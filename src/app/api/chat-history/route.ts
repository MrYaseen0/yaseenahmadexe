import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Get chat history for a session
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ messages: [] });
  }

  try {
    const messages = await db.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ messages: [] });
  }
}

// Save a chat message (also used by WebSocket service via internal call)
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`chat:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many messages. Please slow down." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { sessionId, sender, name, content } = body;

    if (!sessionId || !sender || !content) {
      return NextResponse.json(
        { error: "sessionId, sender and content are required" },
        { status: 400 }
      );
    }

    const saved = await db.chatMessage.create({
      data: {
        sessionId: String(sessionId).slice(0, 200),
        sender: String(sender) === "owner" ? "owner" : "visitor",
        name: name ? String(name).slice(0, 120) : null,
        content: String(content).slice(0, 4000),
      },
    });

    return NextResponse.json({ success: true, id: saved.id });
  } catch (error: any) {
    console.error("Chat save error:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}
