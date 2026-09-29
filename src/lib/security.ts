import crypto from "crypto";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/rate-limit";

/**
 * Security helpers: visitor fingerprinting (privacy-respecting),
 * user-agent parsing, attack-event logging, IP blocking, and the unified
 * professional audit log (every admin visit/login/action + every attack,
 * enriched with geo/ISP and a stable device fingerprint).
 */

// ---- Visitor privacy ----

/** One-way hash of an IP for unique-visitor counting. Raw IPs of normal visitors are never stored. */
export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(`visit:${ip}`).digest("hex");
}

// ---- Request enrichment ----

export interface ParsedUa {
  browser: string;
  os: string;
  device: string;
}

/** Tiny dependency-free user-agent parser — good enough for dashboard breakdowns. */
export function parseUserAgent(ua: string): ParsedUa {
  const u = ua || "";
  let browser = "Other";
  if (/Edg\//i.test(u)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(u)) browser = "Opera";
  else if (/SamsungBrowser/i.test(u)) browser = "Samsung Internet";
  else if (/Chrome\//i.test(u)) browser = "Chrome";
  else if (/Firefox\//i.test(u)) browser = "Firefox";
  else if (/Safari\//i.test(u) && /Version\//i.test(u)) browser = "Safari";

  let os = "Other";
  if (/Windows/i.test(u)) os = "Windows";
  else if (/Android/i.test(u)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(u)) os = "iOS";
  else if (/Mac OS X/i.test(u)) os = "macOS";
  else if (/Linux/i.test(u)) os = "Linux";

  let device = "Desktop";
  if (/iPad|Tablet/i.test(u)) device = "Tablet";
  else if (/Mobi|Android|iPhone|iPod/i.test(u)) device = "Mobile";

  return { browser, os, device };
}

/** Country from the hosting provider's geo header (Vercel sets x-vercel-ip-country). */
export function getCountry(request: Request): string | null {
  return (
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    null
  );
}

// ---- Attack-event logging ----

export type SecurityEventType =
  | "FAILED_LOGIN"
  | "RATE_LIMIT"
  | "BURST"
  | "BLOCKED_HIT"
  | "LOCKOUT"
  | "SUSPICIOUS"
  | "CONTENT_EDIT";

/** Best-effort insert — must never break the request it instruments. */
export async function logSecurityEvent(
  type: SecurityEventType,
  ip: string,
  path?: string,
  detail?: string,
  userAgent?: string
): Promise<void> {
  try {
    await db.securityEvent.create({
      data: {
        type,
        ip: String(ip).slice(0, 45),
        path: path?.slice(0, 200),
        detail: detail?.slice(0, 500),
      },
    });
  } catch {
    // ignore — logging must never break UX
  }
  // Mirror into the unified audit timeline (fire-and-forget, enriched).
  void logAudit({
    event: type,
    ip,
    userAgent,
    path,
    detail,
  });
}

// ---- Unified audit log (professional timeline) ----

export type AuditEventType =
  | "ADMIN_LOGIN"
  | "ADMIN_LOGOUT"
  | "ADMIN_PAGE_VIEW"
  | "ADMIN_ACTION"
  | "CONTENT_EDIT"
  | "FAILED_LOGIN"
  | "RATE_LIMIT"
  | "BURST"
  | "BLOCKED_HIT"
  | "LOCKOUT"
  | "SUSPICIOUS";

interface GeoInfo {
  city: string | null;
  region: string | null;
  country: string | null;
  isp: string | null;
}

// In-memory geo cache (24h TTL) so repeat visitors don't re-hit ip-api.
const geoCache = new Map<string, { at: number; geo: GeoInfo }>();
const GEO_TTL_MS = 24 * 60 * 60 * 1000;

function isPrivateIp(ip: string): boolean {
  return (
    ip === "unknown" ||
    /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|127\.|::1|fc00:|fe80:)/i.test(
      ip
    )
  );
}

/** City/region/country/ISP for an IP via ip-api.com. Best-effort, never throws. */
async function lookupGeo(ip: string): Promise<GeoInfo | null> {
  if (!ip || isPrivateIp(ip)) return null;
  const now = Date.now();
  const cached = geoCache.get(ip);
  if (cached && now - cached.at < GEO_TTL_MS) return cached.geo;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3500);
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(
        ip
      )}?fields=status,country,regionName,city,isp,query`,
      { signal: ctrl.signal }
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const j: any = await res.json();
    if (!j || j.status !== "success") return null;
    const geo: GeoInfo = {
      city: j.city ?? null,
      region: j.regionName ?? null,
      country: j.country ?? null,
      isp: j.isp ?? null,
    };
    geoCache.set(ip, { at: now, geo });
    if (geoCache.size > 2000) {
      const oldest = geoCache.keys().next().value;
      if (oldest) geoCache.delete(oldest);
    }
    return geo;
  } catch {
    return null;
  }
}

/** Stable per-device fingerprint: sha256(ip + user-agent), 16 hex chars. */
export function fingerprintDevice(ip: string, userAgent: string): string {
  return crypto
    .createHash("sha256")
    .update(`audit:${ip}:${userAgent}`)
    .digest("hex")
    .slice(0, 16);
}

export interface AuditInput {
  event: AuditEventType;
  /** Pass the request for automatic IP + user-agent enrichment. */
  request?: Request;
  /** Explicit IP (overrides request). */
  ip?: string;
  /** Explicit user-agent (overrides request header). */
  userAgent?: string;
  /** Admin email when the actor is known (logins / actions). */
  actor?: string;
  path?: string;
  detail?: string;
}

/**
 * Write one row to the unified audit timeline. Inserts immediately (fast
 * path — no network), then fills geo/ISP asynchronously. Best-effort:
 * never throws, never breaks the request it instruments.
 */
export async function logAudit(input: AuditInput): Promise<void> {
  try {
    const ip =
      input.ip ?? (input.request ? getClientIp(input.request) : "unknown");
    const ua =
      input.userAgent ?? input.request?.headers.get("user-agent") ?? "";
    const parsed = parseUserAgent(ua);
    const row = await db.auditLog.create({
      data: {
        event: input.event,
        actor: input.actor?.slice(0, 120) ?? null,
        ip: ip === "unknown" ? null : ip.slice(0, 45),
        ipHash: ip === "unknown" ? null : hashIp(ip),
        device: parsed.device,
        browser: parsed.browser,
        os: parsed.os,
        deviceId:
          ip === "unknown" ? null : fingerprintDevice(ip, ua),
        path: input.path?.slice(0, 200) ?? null,
        detail: input.detail?.slice(0, 1000) ?? null,
      },
    });
    // Geo/ISP enrichment lands a moment later — never blocks the request.
    if (row.ip) {
      lookupGeo(row.ip)
        .then((geo) => {
          if (!geo) return;
          return db.auditLog
            .update({ where: { id: row.id }, data: { ...geo } })
            .catch(() => {});
        })
        .catch(() => {});
    }
  } catch {
    // Table may not exist yet (migration pending) — logging never breaks UX.
  }
}

// ---- IP blocking ----

// Best-effort DDL for the timed-block + per-email-cap columns. Runs once per
// serverless instance so the 24h login lockout works even if the admin
// migrate endpoint was never called for this deploy. Never throws.
let columnsEnsured: Promise<void> | null = null;

function ensureSecurityColumns(): Promise<void> {
  if (!columnsEnsured) {
    columnsEnsured = (async () => {
      try {
        await db.$executeRawUnsafe(
          `ALTER TABLE "BlockedIp" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3)`
        );
        await db.$executeRawUnsafe(
          `CREATE INDEX IF NOT EXISTS "BlockedIp_expiresAt_idx" ON "BlockedIp"("expiresAt")`
        );
        await db.$executeRawUnsafe(
          `CREATE INDEX IF NOT EXISTS "ContactMessage_email_idx" ON "ContactMessage"("email")`
        );
      } catch {
        // best-effort — callers have raw-query fallbacks below
      }
    })();
  }
  return columnsEnsured;
}

// In-memory cache of blocked IPs (60s TTL) so every request doesn't hit the DB.
let blockedCache: { ips: Set<string>; at: number } | null = null;

export async function isIpBlocked(ip: string): Promise<boolean> {
  await ensureSecurityColumns();
  const now = Date.now();
  if (!blockedCache || now - blockedCache.at > 60_000) {
    try {
      // Expiry-aware: timed blocks (e.g. 24h login lockouts) lift automatically.
      const rows = await db.$queryRawUnsafe<{ ip: string }[]>(
        `SELECT "ip" FROM "BlockedIp" WHERE "expiresAt" IS NULL OR "expiresAt" > NOW()`
      );
      blockedCache = { ips: new Set(rows.map((r) => r.ip)), at: now };
      // Best-effort prune of expired rows so the table can't grow forever.
      void db
        .$executeRawUnsafe(
          `DELETE FROM "BlockedIp" WHERE "expiresAt" IS NOT NULL AND "expiresAt" <= NOW()`
        )
        .catch(() => {});
    } catch {
      return false; // fail open on DB error — blocking is best-effort
    }
  }
  return blockedCache.ips.has(ip);
}

export function invalidateBlockedCache(): void {
  blockedCache = null;
}

/**
 * Block an IP. `expiresAt` set → timed block that lifts automatically
 * (24h admin-login lockout). Omitted → permanent manual block.
 */
export async function blockIp(
  ip: string,
  reason: string,
  expiresAt?: Date
): Promise<void> {
  await ensureSecurityColumns();
  try {
    await db.$executeRawUnsafe(
      `INSERT INTO "BlockedIp"("id","ip","reason","expiresAt","createdAt")
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT("ip") DO UPDATE SET "reason" = EXCLUDED."reason", "expiresAt" = EXCLUDED."expiresAt"`,
      crypto.randomUUID(),
      ip,
      reason,
      expiresAt ?? null
    );
  } catch {
    // Fallback for very old DBs where the expiresAt column is missing:
    // block permanently via Prisma so some protection still applies.
    try {
      await db.blockedIp.upsert({
        where: { ip },
        update: { reason },
        create: { ip, reason },
      });
    } catch {
      // ignore
    }
  }
  invalidateBlockedCache();
}

export async function unblockIp(ip: string): Promise<void> {
  try {
    await db.blockedIp.delete({ where: { ip } });
    invalidateBlockedCache();
  } catch {
    // ignore (already unblocked)
  }
}

// Throttle BLOCKED_HIT logging: at most one log entry per IP per 5 minutes,
// so a blocked attacker can't flood the security feed.
const lastBlockedLog = new Map<string, number>();

export function shouldLogBlockedHit(ip: string): boolean {
  const now = Date.now();
  const last = lastBlockedLog.get(ip) ?? 0;
  if (now - last < 5 * 60_000) return false;
  lastBlockedLog.set(ip, now);
  return true;
}

// ---- Admin login lockout support ----

/** Failed admin logins from this IP inside the rolling window. DB-backed so it works across serverless instances. */
export async function recentFailedLogins(ip: string, windowMs: number): Promise<number> {
  try {
    const since = new Date(Date.now() - windowMs);
    return await db.securityEvent.count({
      where: { type: "FAILED_LOGIN", ip, createdAt: { gte: since } },
    });
  } catch {
    return 0; // fail open on DB error — the in-memory throttle still gates
  }
}

/** A successful login clears the strike counter: typos don't lock the owner out. */
export async function clearFailedLogins(ip: string, windowMs: number): Promise<void> {
  try {
    const since = new Date(Date.now() - windowMs);
    await db.securityEvent.deleteMany({
      where: { type: "FAILED_LOGIN", ip, createdAt: { gte: since } },
    });
  } catch {
    // ignore — logging hygiene must never break login
  }
}
