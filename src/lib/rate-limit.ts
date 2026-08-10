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

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
