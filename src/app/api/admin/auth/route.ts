import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyCredentials, signAdminToken, verifyAdmin } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logSecurityEvent, isIpBlocked, shouldLogBlockedHit } from "@/lib/security";

export async function POST(request: Request) {
  const ip = getClientIp(request);

  // Blocked IPs can't even attempt login.
  if (await isIpBlocked(ip)) {
    if (shouldLogBlockedHit(ip)) {
      await logSecurityEvent("BLOCKED_HIT", ip, "/api/admin/auth", "Login attempt from blocked IP");
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Throttle login attempts to blunt credential brute-forcing.
  const limit = rateLimit(`admin-auth:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!limit.ok) {
    await logSecurityEvent("RATE_LIMIT", ip, "/api/admin/auth", "Login brute-force throttle (10/min)");
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
      await logSecurityEvent("FAILED_LOGIN", ip, "/api/admin/auth", `Failed login for ${String(email).slice(0, 80)}`);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signAdminToken(String(email).toLowerCase().trim());

    // Log the admin login (best-effort).
    try {
      await db.visit.create({
        data: {
          section: "admin-login",
          path: "/admin",
          referrer: null,
        },
      });
    } catch {
      // ignore tracking errors
    }

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
