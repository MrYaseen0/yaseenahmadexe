import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";

// One-time schema bootstrap for the unified audit timeline.
// Admin-authenticated. Safe to call repeatedly (IF NOT EXISTS).
// Used instead of build-time `prisma db push`, which can hang on the
// connection pooler in serverless build containers.
const DDL = [
  `CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event" TEXT NOT NULL,
    "actor" TEXT,
    "ip" TEXT,
    "ipHash" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "isp" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "deviceId" TEXT,
    "path" TEXT,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_event_createdAt_idx" ON "AuditLog"("event", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_actor_createdAt_idx" ON "AuditLog"("actor", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_ipHash_createdAt_idx" ON "AuditLog"("ipHash", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_deviceId_createdAt_idx" ON "AuditLog"("deviceId", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt")`,
  // 2026-09-29: timed IP blocks (24h admin-login lockout) + per-email contact cap.
  `ALTER TABLE "BlockedIp" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3)`,
  `CREATE INDEX IF NOT EXISTS "BlockedIp_expiresAt_idx" ON "BlockedIp"("expiresAt")`,
  `CREATE INDEX IF NOT EXISTS "ContactMessage_email_idx" ON "ContactMessage"("email")`,
  // 2026-09-29: DB-backed cross-instance rate limiter hit log.
  `CREATE TABLE IF NOT EXISTS "RateHit" ("id" TEXT NOT NULL PRIMARY KEY, "key" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE INDEX IF NOT EXISTS "RateHit_key_createdAt_idx" ON "RateHit"("key", "createdAt")`,
];

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    for (const stmt of DDL) {
      await db.$executeRawUnsafe(stmt);
    }
    const rows = await db.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*)::bigint AS count FROM "AuditLog"`
    );
    return NextResponse.json({
      ok: true,
      table: "AuditLog",
      rows: Number(rows[0]?.count ?? 0),
    });
  } catch (e) {
    console.error("migrate failed:", e);
    return NextResponse.json(
      { error: "Migration failed" },
      { status: 500 }
    );
  }
}
