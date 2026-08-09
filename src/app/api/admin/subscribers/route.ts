import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const ADMIN_KEY = process.env.ADMIN_KEY || "yaseen-admin-2026";

function checkAuth(request: Request) {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${ADMIN_KEY}`;
}

// GET — list all newsletter subscribers
export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscribers = await db.subscriber.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, createdAt: true },
    });
    return NextResponse.json({ subscribers });
  } catch (error) {
    return NextResponse.json({ subscribers: [] });
  }
}
