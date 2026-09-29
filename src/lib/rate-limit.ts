import crypto from "crypto";
import { db } from "@/lib/db";

/**
 * Minimal in-memory sliding-window rate limiter — no external deps.
 *
 * NOTE: state lives in a module-level Map, so it is per-instance and resets on
 * redeploy / cold start. On serverless (Vercel) each instance limits
 * independently. That is acceptable for a portfolio site's abuse protection; for
 * strict distributed limits, swap this for @upstash/ratelimit + Redis.
 */

type Bucket = number[]; // timestamps (ms) within the current window

const buckets = new Map<string, Bucket>();

// Occasionally sweep empty buckets so the Map can't grow unbounded.
let opsSinceSweep = 0;
const SWEEP_EVERY = 500;

export interface RateLimitOptions {
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Milliseconds until the caller may retry (0 when ok). */
  retryAfterMs: number;
}

/**
 * Record a hit for `key` and report whether it's within the limit.
 * Call once per request, before touching the database.
 */
export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowStart = now - opts.windowMs;

  const existing = buckets.get(key) ?? [];
  // Drop timestamps older than the window.
  const recent = existing.filter((ts) => ts > windowStart);

  if (recent.length >= opts.limit) {
    buckets.set(key, recent);
    const oldest = recent[0];
    return {
      ok: false,
      remaining: 0,
      retryAfterMs: Math.max(0, oldest + opts.windowMs - now),
    };
  }

  recent.push(now);
  buckets.set(key, recent);

  if (++opsSinceSweep >= SWEEP_EVERY) {
    opsSinceSweep = 0;
    for (const [k, v] of buckets) {
      if (v.length === 0 || v[v.length - 1] <= windowStart) buckets.delete(k);
    }
  }

  return { ok: true, remaining: opts.limit - recent.length, retryAfterMs: 0 };
}

// ---- Persistent (DB-backed) sliding-window limiter ----
// The in-memory limiter above is per serverless instance; on Vercel a burst
// can spread across instances and dodge it. rateLimitDb persists every hit
// in the RateHit table so the limit holds across all instances.

let rateTableEnsured: Promise<void> | null = null;

function ensureRateTable(): Promise<void> {
  if (!rateTableEnsured) {
    rateTableEnsured = (async () => {
      try {
        await db.$executeRawUnsafe(
          `CREATE TABLE IF NOT EXISTS "RateHit" ("id" TEXT NOT NULL PRIMARY KEY, "key" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`
        );
        await db.$executeRawUnsafe(
          `CREATE INDEX IF NOT EXISTS "RateHit_key_createdAt_idx" ON "RateHit"("key", "createdAt")`
        );
      } catch {
        // best-effort — caller falls back to the in-memory limiter
      }
    })();
  }
  return rateTableEnsured;
}

/**
 * DB-backed sliding-window rate limit. Counts hits for `key` inside the
 * window across ALL serverless instances. Falls back to the in-memory
 * limiter if the database is unreachable.
 */
export async function rateLimitDb(
  key: string,
  opts: RateLimitOptions
): Promise<RateLimitResult> {
  await ensureRateTable();
  const now = Date.now();
  const windowStart = new Date(now - opts.windowMs);
  try {
    await db.$executeRawUnsafe(
      `INSERT INTO "RateHit"("id","key","createdAt") VALUES ($1,$2,NOW())`,
      crypto.randomUUID(),
      key
    );
    const rows = await db.$queryRawUnsafe<{ c: bigint; oldest: Date }[]>(
      `SELECT COUNT(*)::bigint AS c, MIN("createdAt") AS oldest FROM "RateHit" WHERE "key" = $1 AND "createdAt" > $2`,
      key,
      windowStart
    );
    const count = Number(rows[0]?.c ?? 0);

    // Best-effort prune of stale rows so the table stays small
    // (~5% of calls; cheap and lock-free).
    if (Math.random() < 0.05) {
      void db
        .$executeRawUnsafe(
          `DELETE FROM "RateHit" WHERE "createdAt" < NOW() - INTERVAL '2 hours'`
        )
        .catch(() => {});
    }

    if (count > opts.limit) {
      const oldestMs = rows[0]?.oldest ? new Date(rows[0].oldest).getTime() : now;
      return {
        ok: false,
        remaining: 0,
        retryAfterMs: Math.max(0, oldestMs + opts.windowMs - now),
      };
    }
    return { ok: true, remaining: opts.limit - count, retryAfterMs: 0 };
  } catch {
    return rateLimit(key, opts); // DB down → per-instance limit still applies
  }
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
