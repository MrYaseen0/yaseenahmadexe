import { NextResponse } from "next/server";
import { verifyCredentials, signAdminToken, verifyAdmin } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  logSecurityEvent,
  isIpBlocked,
  shouldLogBlockedHit,
  logAudit,
  blockIp,
  recentFailedLogins,
  clearFailedLogins,
} from "@/lib/security";

// Admin login brute-force policy:
//  - fast lane: max 5 attempts per 5 minutes per IP (in-memory, per instance)
//  - hard lane: 5 FAILED logins inside a rolling 5-minute window (DB-backed,
//    works across serverless instances) → IP blocked for 24 hours.
// A successful login clears the failed-attempt counter, so the owner's own
// typos never lock him out. Manual blocks can be lifted early from the
// admin Security tab; timed lockouts expire automatically.
const FAIL_WINDOW_MS = 5 * 60_000;
const FAIL_LIMIT = 5;
const LOCKOUT_MS = 24 * 60 * 60_000;

export async function POST(request: Request) {
  const ip = getClientIp(request);

  // Blocked IPs can't even attempt login.
  if (await isIpBlocked(ip)) {
    if (shouldLogBlockedHit(ip)) {
      await logSecurityEvent("BLOCKED_HIT", ip, "/api/admin/auth", "Login attempt from blocked IP", request.headers.get("user-agent") || undefined);
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Throttle login attempts to blunt credential brute-forcing.
  const limit = rateLimit(`admin-auth:${ip}`, { limit: 5, windowMs: FAIL_WINDOW_MS });
  if (!limit.ok) {
    await logSecurityEvent("RATE_LIMIT", ip, "/api/admin/auth", "Login brute-force throttle (5/5min)", request.headers.get("user-agent") || undefined);
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!verifyCredentials(email, password)) {
      // Log every failed login so brute-forcing shows up in the security feed.
      await logSecurityEvent("FAILED_LOGIN", ip, "/api/admin/auth", `Failed login for ${String(email).slice(0, 80)}`, request.headers.get("user-agent") || undefined);

      // Hard lane: 5th failure inside the rolling 5-minute window → 24h block.
      const fails = await recentFailedLogins(ip, FAIL_WINDOW_MS);
      if (fails >= FAIL_LIMIT) {
        const until = new Date(Date.now() + LOCKOUT_MS);
        await blockIp(
          ip,
          `Admin login lockout: ${FAIL_LIMIT} failed attempts in 5 minutes (auto-expires 24h)`,
          until
        );
        await logSecurityEvent("LOCKOUT", ip, "/api/admin/auth", `IP blocked for 24h after ${fails} failed logins`, request.headers.get("user-agent") || undefined);
        return NextResponse.json(
          { error: "Too many failed login attempts. This IP is blocked for 24 hours." },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Success clears the strike counter.
    await clearFailedLogins(ip, FAIL_WINDOW_MS);

    const token = signAdminToken(String(email).toLowerCase().trim());

    // Audit the successful admin login: IP + timestamp + device + geo/ISP.
    await logAudit({
      event: "ADMIN_LOGIN",
      request,
      actor: String(email).toLowerCase().trim(),
      path: "/admin",
      detail: "Admin login successful",
    });

    return NextResponse.json({
      success: true,
      token,
      email: String(email).toLowerCase().trim(),
      message: "Authentication successful",
    });
  } catch (error: any) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

// GET — verify whether the presented token is still valid
export async function GET(request: Request) {
  if (verifyAdmin(request)) {
    return NextResponse.json({ valid: true });
  }
  return NextResponse.json({ valid: false }, { status: 401 });
}
