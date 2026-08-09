import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Admin credentials (configured per user request)
const ADMIN_EMAIL = "yaseenahmad13579@gmail.com";
const ADMIN_PASSWORD = "Yaseen@13579";

// Simple session token store (in production, use JWT + secure storage)
const VALID_TOKEN = `ya-admin-${Date.now()}-yaseen`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const emailMatch = email.toLowerCase().trim() === ADMIN_EMAIL;
    const passwordMatch = password === ADMIN_PASSWORD;

    if (!emailMatch || !passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Log the admin login
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
      token: VALID_TOKEN,
      email: ADMIN_EMAIL,
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

// GET — verify if a token is still valid
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const token = auth?.replace("Bearer ", "");

  if (token && token.startsWith("ya-admin-") && token.endsWith("yaseen")) {
    return NextResponse.json({ valid: true, email: ADMIN_EMAIL });
  }

  return NextResponse.json({ valid: false }, { status: 401 });
}
