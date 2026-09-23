import crypto from "crypto";
import { db } from "@/lib/db";

/**
 * Security helpers: visitor fingerprinting (privacy-respecting),
 * user-agent parsing, attack-event logging, and IP blocking.
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
  | "SUSPICIOUS";

/** Best-effort insert — must never break the request it instruments. */
export async function logSecurityEvent(
  type: SecurityEventType,
  ip: string,
  path?: string,
  detail?: string
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
}

// ---- IP blocking ----

// In-memory cache of blocked IPs (60s TTL) so every request doesn't hit the DB.
let blockedCache: { ips: Set<string>; at: number } | null = null;

export async function isIpBlocked(ip: string): Promise<boolean> {
  const now = Date.now();
  if (!blockedCache || now - blockedCache.at > 60_000) {
    try {
      const rows = await db.blockedIp.findMany({ select: { ip: true } });
      blockedCache = { ips: new Set(rows.map((r) => r.ip)), at: now };
    } catch {
      return false; // fail open on DB error — blocking is best-effort
    }
  }
  return blockedCache.ips.has(ip);
}

export function invalidateBlockedCache(): void {
  blockedCache = null;
}

export async function blockIp(ip: string, reason: string): Promise<void> {
  try {
    await db.blockedIp.upsert({
      where: { ip },
      update: { reason },
      create: { ip, reason },
    });
    invalidateBlockedCache();
  } catch {
    // ignore
  }
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
