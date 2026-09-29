import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Subscribe abuse policy:
//  - per IP: max 5 subscribes per 10 minutes
//  - per email: one subscription only — a second subscribe returns 409
const PER_IP_LIMIT = 5;
const PER_IP_WINDOW_MS = 10 * 60_000;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`subscribe:${ip}`, { limit: PER_IP_LIMIT, windowMs: PER_IP_WINDOW_MS });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // One subscription per email — no re-subscribing.
    const existing = await db.subscriber.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "This email is already subscribed." },
        { status: 409 }
      );
    }

    try {
      await db.subscriber.create({
        data: { email: normalizedEmail },
      });
    } catch (e: any) {
      // Race between two simultaneous subscribes → treat as already subscribed.
      if (e?.code === "P2002") {
        return NextResponse.json(
          { error: "This email is already subscribed." },
          { status: 409 }
        );
      }
      throw e;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thanks for subscribing! I'll keep you updated.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
