import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendLeadNotification } from "@/lib/email";

// GET — list all bookings (admin only)
export async function GET(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const bookings = await db.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ bookings: [] });
  }
}

// POST — submit a new booking request
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`booking:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { name, email, purpose, date, time, timezone, notes } = body;

    if (!name || !email || !purpose || !date || !time) {
      return NextResponse.json(
        { error: "Name, email, purpose, date, and time are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const saved = await db.booking.create({
      data: {
        name: String(name).slice(0, 120),
        email: String(email).slice(0, 200),
        purpose: String(purpose).slice(0, 200),
        date: String(date).slice(0, 50),
        time: String(time).slice(0, 50),
        timezone: timezone ? String(timezone).slice(0, 100) : "Asia/Karachi",
        notes: notes ? String(notes).slice(0, 2000) : null,
      },
    });

    // Notify the owner instantly; awaiting keeps it alive on serverless,
    // and sendLeadNotification never throws so the response is unaffected.
    await sendLeadNotification({
      kind: "booking",
      subject: `📅 New booking: ${String(purpose).slice(0, 80)}`,
      lines: [
        `Name: ${String(name)}`,
        `Email: ${String(email)}`,
        `Purpose: ${String(purpose)}`,
        `When: ${String(date)} at ${String(time)} (${String(timezone || "Asia/Karachi")})`,
        notes ? "" : "Notes: —",
        ...(notes ? [String(notes).slice(0, 1500)] : []),
      ],
      replyTo: String(email),
    });

    return NextResponse.json({
      success: true,
      id: saved.id,
      message:
        "Booking request submitted! I'll confirm via email within a few hours.",
    });
  } catch (error: any) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to submit booking. Please try again." },
      { status: 500 }
    );
  }
}

// PATCH — admin manages a booking: confirm / cancel / delete
export async function PATCH(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, action } = await request.json();
    if (!id || !action) {
      return NextResponse.json({ error: "id and action are required" }, { status: 400 });
    }
    if (action === "delete") {
      await db.booking.delete({ where: { id: String(id) } });
      return NextResponse.json({ success: true });
    }
    if (action === "confirm" || action === "cancel") {
      const booking = await db.booking.update({
        where: { id: String(id) },
        data: { status: action === "confirm" ? "confirmed" : "cancelled" },
      });
      return NextResponse.json({ success: true, booking });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Booking update error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
