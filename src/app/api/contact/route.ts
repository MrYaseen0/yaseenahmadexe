import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendLeadNotification } from "@/lib/email";

// Contact-form abuse policy:
//  - per IP: max 5 messages per 10 minutes (bulk-spam guard)
//  - per sender email: max 3 messages total (one person can't flood the inbox)
const PER_IP_LIMIT = 5;
const PER_IP_WINDOW_MS = 10 * 60_000;
const PER_EMAIL_LIMIT = 3;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`contact:${ip}`, { limit: PER_IP_LIMIT, windowMs: PER_IP_WINDOW_MS });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many messages from this network. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { name, email, subject, message, website } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject and message are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Per-sender cap: one email address may send at most PER_EMAIL_LIMIT messages.
    const sentCount = await db.contactMessage.count({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });
    if (sentCount >= PER_EMAIL_LIMIT) {
      return NextResponse.json(
        {
          error: `You have already sent the maximum of ${PER_EMAIL_LIMIT} messages. I'll get back to you soon.`,
        },
        { status: 429 }
      );
    }

    const saved = await db.contactMessage.create({
      data: {
        name: String(name).slice(0, 120),
        email: String(email).trim().slice(0, 200),
        subject: String(subject).slice(0, 200),
        message: String(message).slice(0, 5000),
        website: website ? String(website).slice(0, 200) : null,
      },
    });

    // Notify the owner instantly; never blocks/fails the client response.
    // Notify the owner instantly; awaiting keeps it alive on serverless,
    // and sendLeadNotification never throws so the response is unaffected.
    await sendLeadNotification({
      kind: "contact",
      subject: `New contact: ${String(subject).slice(0, 80)}`,
      lines: [
        `Name: ${String(name)}`,
        `Email: ${String(email)}`,
        `Subject: ${String(subject)}`,
        "",
        String(message).slice(0, 1500),
      ],
      replyTo: String(email),
    });

    return NextResponse.json({
      success: true,
      id: saved.id,
      message: "Your message has been received. I'll get back to you soon!",
    });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    const unread = await db.contactMessage.count({ where: { read: false } });
    return NextResponse.json({ messages, unread });
  } catch (error) {
    return NextResponse.json({ messages: [], unread: 0 });
  }
}

// Admin-only: mark a message read/unread.
export async function PATCH(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, read } = body;
    if (!id || typeof read !== "boolean") {
      return NextResponse.json(
        { error: "id and read (boolean) are required" },
        { status: 400 }
      );
    }
    await db.contactMessage.update({
      where: { id: String(id) },
      data: { read },
    });
    const unread = await db.contactMessage.count({ where: { read: false } });
    return NextResponse.json({ success: true, unread });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}
