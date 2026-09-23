import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin, verifyToken } from "@/lib/auth";
import { getClientIp } from "@/lib/rate-limit";
import {
  CONTENT_DEFAULTS,
  CONTENT_FIELDS,
  validateJsonField,
} from "@/lib/content-fields";

// Never statically cache this route: the public page merges these overrides
// client-side, and a cached GET would serve stale values after a save.
export const dynamic = "force-dynamic";

/** Keys registered as JSON fields — only these get server-side JSON validation. */
const JSON_FIELD_KEYS = new Set(
  CONTENT_FIELDS.filter((f) => f.json).map((f) => f.key)
);

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
    // A database failure must NOT look like "no overrides": the client falls
    // back to defaults on any shape, but operators can tell the difference
    // via the 503 status and the error field.
    console.error("Content read error:", error);
    return NextResponse.json(
      { contents: {}, error: "unavailable" },
      { status: 503 }
    );
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
    // Server-side JSON validation for JSON-registered keys (mirrors the
    // client check): a raw API call must not corrupt a JSON field with bad
    // syntax or a wrong top-level shape. Stores the normalized compact JSON.
    let finalValue = cleanValue;
    if (JSON_FIELD_KEYS.has(cleanKey)) {
      const check = validateJsonField(cleanKey, cleanValue);
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }
      finalValue = check.normalized;
    }
    const email = adminEmailFrom(request);
    const ip = getClientIp(request);

    // The mutation and its audit event are one atomic transaction, and the
    // audit detail is written directly (not through logSecurityEvent, whose
    // 500-char cap would corrupt the structured audit JSON).
    const updated = await db.$transaction(async (tx) => {
      // No .catch(() => null) here: a real database error must surface as a
      // 500, never be misread as "this key has no override".
      const prev = await tx.siteContent.findUnique({
        where: { key: cleanKey },
      });
      const row = await tx.siteContent.upsert({
        where: { key: cleanKey },
        update: {
          value: finalValue,
          category: category ? String(category).slice(0, 50) : undefined,
        },
        create: {
          key: cleanKey,
          value: finalValue,
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
            )}" → "${trunc(finalValue)}"`,
            actor: email,
            action: isNew ? "created" : "updated",
            key: cleanKey,
            oldValue: prev?.value ?? null,
            newValue: finalValue,
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

    // No .catch(() => null) here: only a genuinely missing row means
    // "already at default". A database failure must surface as a 500,
    // never be masked as a successful no-op.
    const prev = await db.siteContent.findUnique({
      where: { key: cleanKey },
    });
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
