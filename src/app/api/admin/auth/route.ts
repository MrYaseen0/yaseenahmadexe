import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyCredentials, signAdminToken, verifyAdmin } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Throttle login attempts to blunt credential brute-forcing.
  const ip = getClientIp(request);
  const limit = rateLimit(`admin-auth:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!limit.ok) {
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
