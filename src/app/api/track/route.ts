import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST — record a section view (anonymous, privacy-respecting)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { section, path } = body;

    if (!section) {
      return NextResponse.json(
        { error: "section is required" },
        { status: 400 }
      );
    }

    // Extract referrer origin only (no full URL for privacy)
    const referrer = body.referrer
      ? (() => {
          try {
            const url = new URL(body.referrer);
            return url.origin;
          } catch {
            return null;
          }
        })()
      : null;

    await db.visit.create({
      data: {
        section: String(section).slice(0, 100),
        path: String(path || "/").slice(0, 200),
        referrer,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Silent fail — tracking should never break the UX
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
