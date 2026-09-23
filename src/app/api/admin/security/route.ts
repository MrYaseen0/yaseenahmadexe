import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";
import { blockIp, unblockIp } from "@/lib/security";

// GET — security overview for the admin dashboard (admin only).
// Returns recent attack events, 24h stats, top offending IPs, blocked list.
export async function GET(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [events, blocked, stats24h, topIps] = await Promise.all([
      db.securityEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      db.blockedIp.findMany({ orderBy: { createdAt: "desc" } }),
      db.securityEvent.groupBy({
        by: ["type"],
        where: { createdAt: { gte: dayAgo } },
        _count: { _all: true },
      }),
      db.securityEvent.groupBy({
        by: ["ip"],
        where: { createdAt: { gte: dayAgo } },
        _count: { _all: true },
        orderBy: { _count: { ip: "desc" } },
        take: 10,
      }),
    ]);

    const byType: Record<string, number> = {};
    stats24h.forEach((s) => {
      byType[s.type] = s._count._all;
    });

    return NextResponse.json({
      events: events.map((e) => ({
        id: e.id,
        type: e.type,
        ip: e.ip,
        path: e.path,
        detail: e.detail,
        createdAt: e.createdAt,
      })),
      blocked: blocked.map((b) => ({
        ip: b.ip,
        reason: b.reason,
        createdAt: b.createdAt,
      })),
      stats24h: {
        failedLogins: byType.FAILED_LOGIN ?? 0,
        rateLimits: byType.RATE_LIMIT ?? 0,
        bursts: byType.BURST ?? 0,
        blockedHits: byType.BLOCKED_HIT ?? 0,
        total: stats24h.reduce((s, x) => s + x._count._all, 0),
      },
      topOffenders: topIps.map((t) => ({ ip: t.ip, count: t._count._all })),
    });
  } catch (error: any) {
    // Tables may not exist yet if the migration hasn't been applied.
    return NextResponse.json(
      { events: [], blocked: [], stats24h: { failedLogins: 0, rateLimits: 0, bursts: 0, blockedHits: 0, total: 0 }, topOffenders: [], needsMigration: true },
      { status: 200 }
    );
  }
}

// POST — manually block an IP (admin only). Body: { ip, reason? }
export async function POST(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { ip, reason } = await request.json();
    if (!ip || typeof ip !== "string") {
      return NextResponse.json({ error: "ip is required" }, { status: 400 });
    }
    await blockIp(ip.trim().slice(0, 45), String(reason || "Blocked manually from admin").slice(0, 200));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to block IP" }, { status: 500 });
  }
}

// DELETE — unblock an IP (admin only). Query: ?ip=1.2.3.4
export async function DELETE(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ip = new URL(request.url).searchParams.get("ip");
  if (!ip) {
    return NextResponse.json({ error: "ip is required" }, { status: 400 });
  }
  await unblockIp(ip);
  return NextResponse.json({ success: true });
}
