import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin, verifyToken } from "@/lib/auth";
import { getClientIp } from "@/lib/rate-limit";
import { CONTENT_DEFAULTS } from "@/lib/content-fields";

/** Admin email from the Bearer token (for the audit trail). */
function adminEmailFrom(request: Request): string {
  const auth = request.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return verifyToken(token)?.email || "admin";
}

/** Truncate a value for the audit log line. */
function trunc(v: string | null | undefined, n = 140): string {
  const s = String(v ?? "");
  return s.length > n ? s.slice(0, n) + "…" : s;
}

// GET — fetch all site content (public read, so the site can use dynamic data).
// Only registered CONTENT_DEFAULTS keys are exposed; unknown legacy rows are
// never leaked to the public.
export async function GET() {
  try {
    const contents = await db.siteContent.findMany({
      orderBy: { category: "asc" },
    });
    const map: Record<string, { value: string; category: string }> = {};
    contents.forEach((c) => {
      if (c.key in CONTENT_DEFAULTS) {
        map[c.key] = { value: c.value, category: c.category };
      }
    });
    return NextResponse.json({ contents: map });
  } catch (error) {
    return NextResponse.json({ contents: {} });
  }
}

// PUT — update or create site content (admin only).
// Every write is audit-logged as a CONTENT_EDIT security event with the
// admin's email, IP, key, and old → new value.
export async function PUT(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { key, value, category } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "key and value are required" },
        { status: 400 }
      );
    }

    const cleanKey = String(key).slice(0, 100);
    const cleanValue = String(value).slice(0, 10000);
    if (!(cleanKey in CONTENT_DEFAULTS)) {
      return NextResponse.json(
        { error: "Unknown content key" },
        { status: 400 }
      );
    }
    const email = adminEmailFrom(request);
    const ip = getClientIp(request);

    // The mutation and its audit event are one atomic transaction, and the
    // audit detail is written directly (not through logSecurityEvent, whose
    // 500-char cap would corrupt the structured audit JSON).
    const updated = await db.$transaction(async (tx) => {
      const prev = await tx.siteContent
        .findUnique({ where: { key: cleanKey } })
        .catch(() => null);
      const row = await tx.siteContent.upsert({
        where: { key: cleanKey },
        update: {
          value: cleanValue,
          category: category ? String(category).slice(0, 50) : undefined,
        },
        create: {
          key: cleanKey,
          value: cleanValue,
          category: category ? String(category).slice(0, 50) : "general",
        },
      });
      const isNew = !prev;
      await tx.securityEvent.create({
        data: {
          type: "CONTENT_EDIT",
          ip: String(ip).slice(0, 45),
          path: "/api/admin/content",
          detail: JSON.stringify({
            summary: `content ${isNew ? "created" : "updated"} key="${cleanKey}" by ${email} | "${trunc(
              prev?.value
            )}" → "${trunc(cleanValue)}"`,
            actor: email,
            action: isNew ? "created" : "updated",
            key: cleanKey,
            oldValue: prev?.value ?? null,
            newValue: cleanValue,
            ip,
            at: new Date().toISOString(),
          }),
        },
      });
      return row;
    });

    return NextResponse.json({ success: true, content: updated });
  } catch (error: any) {
    console.error("Content update error:", error);
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  }
}

// DELETE — remove a content key (admin only)
export async function DELETE(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    const cleanKey = String(key).slice(0, 100);
    if (!(cleanKey in CONTENT_DEFAULTS)) {
      return NextResponse.json(
        { error: "Unknown content key" },
        { status: 400 }
      );
    }

    const email = adminEmailFrom(request);
    const ip = getClientIp(request);

    const prev = await db.siteContent
      .findUnique({ where: { key: cleanKey } })
      .catch(() => null);
    if (!prev) {
      return NextResponse.json({ success: true, note: "already at default" });
    }

    await db.$transaction(async (tx) => {
      await tx.siteContent.delete({ where: { key: cleanKey } });
      await tx.securityEvent.create({
        data: {
          type: "CONTENT_EDIT",
          ip: String(ip).slice(0, 45),
          path: "/api/admin/content",
          detail: JSON.stringify({
            summary: `content deleted key="${cleanKey}" by ${email}`,
            actor: email,
            action: "deleted",
            key: cleanKey,
            oldValue: prev.value,
            newValue: null,
            ip,
            at: new Date().toISOString(),
          }),
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Content delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete content" },
      { status: 500 }
    );
  }
}
