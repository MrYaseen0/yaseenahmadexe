import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin, verifyToken } from "@/lib/auth";
import { logAudit, type AuditEventType } from "@/lib/security";

// GET — unified audit timeline (admin only).
// Query params:
//   event:  ADMIN_LOGIN | ADMIN_LOGOUT | ADMIN_PAGE_VIEW | ADMIN_ACTION |
//           CONTENT_EDIT | FAILED_LOGIN | RATE_LIMIT | BURST | BLOCKED_HIT | SUSPICIOUS
//   q:      free text over ip / actor / city / region / country / isp / deviceId / detail
//   limit:  1-100, default 50
//   cursor: ISO timestamp — returns rows older than this (keyset pagination)
//
// Single indexed query: fast even with large tables.
export async function GET(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const event = url.searchParams.get("event")?.trim() || null;
    const q = url.searchParams.get("q")?.trim() || null;
    const limit = Math.min(
      Math.max(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 1),
      100
    );
    const cursorRaw = url.searchParams.get("cursor")?.trim() || null;
    const cursor = cursorRaw ? new Date(cursorRaw) : null;
    const cursorValid = cursor && !Number.isNaN(cursor.getTime()) ? cursor : null;

    const where: any = {};
    if (event) where.event = event;
    if (cursorValid) where.createdAt = { lt: cursorValid };
    if (q) {
      where.OR = [
        { ip: { contains: q, mode: "insensitive" } },
        { actor: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { region: { contains: q, mode: "insensitive" } },
        { country: { contains: q, mode: "insensitive" } },
        { isp: { contains: q, mode: "insensitive" } },
        { deviceId: { contains: q, mode: "insensitive" } },
        { detail: { contains: q, mode: "insensitive" } },
      ];
    }

    const rows = await db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore
      ? page[page.length - 1].createdAt.toISOString()
      : null;

    return NextResponse.json({
      entries: page.map((r) => ({
        id: r.id,
        event: r.event,
        actor: r.actor,
        ip: r.ip,
        city: r.city,
        region: r.region,
        country: r.country,
        isp: r.isp,
        device: r.device,
        browser: r.browser,
        os: r.os,
        deviceId: r.deviceId,
        path: r.path,
        detail: r.detail,
        createdAt: r.createdAt,
      })),
      nextCursor,
    });
  } catch (error: any) {
    // Table may not exist yet if the migration hasn't been applied.
    return NextResponse.json(
      { entries: [], nextCursor: null, needsMigration: true },
      { status: 200 }
    );
  }
}

// POST — client beacon for admin page views / logout (admin only).
// Body: { event: "ADMIN_PAGE_VIEW" | "ADMIN_LOGOUT", path?, detail? }
const BEACON_EVENTS: AuditEventType[] = ["ADMIN_PAGE_VIEW", "ADMIN_LOGOUT"];

export async function POST(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const event = String(body.event || "");
    if (!BEACON_EVENTS.includes(event as AuditEventType)) {
      return NextResponse.json({ error: "invalid event" }, { status: 400 });
    }
    const auth = request.headers.get("authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "").trim();
    const actor = verifyToken(token)?.email || "admin";
    await logAudit({
      event: event as AuditEventType,
      request,
      actor,
      path: String(body.path || "/admin").slice(0, 200),
      detail:
        event === "ADMIN_PAGE_VIEW"
          ? "Admin panel opened"
          : "Admin logged out",
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to log" }, { status: 500 });
  }
}
