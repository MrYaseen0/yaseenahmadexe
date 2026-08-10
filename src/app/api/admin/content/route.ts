import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";

// GET — fetch all site content (public read, so the site can use dynamic data)
export async function GET() {
  try {
    const contents = await db.siteContent.findMany({
      orderBy: { category: "asc" },
    });
    const map: Record<string, { value: string; category: string }> = {};
    contents.forEach((c) => {
      map[c.key] = { value: c.value, category: c.category };
    });
    return NextResponse.json({ contents: map });
  } catch (error) {
    return NextResponse.json({ contents: {} });
  }
}

// PUT — update or create site content (admin only)
export async function PUT(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { key, value, category } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "key and value are required" },
        { status: 400 }
      );
    }

    const updated = await db.siteContent.upsert({
      where: { key: String(key).slice(0, 100) },
      update: {
        value: String(value).slice(0, 10000),
        category: category ? String(category).slice(0, 50) : undefined,
      },
      create: {
        key: String(key).slice(0, 100),
        value: String(value).slice(0, 10000),
        category: category ? String(category).slice(0, 50) : "general",
      },
    });

    return NextResponse.json({ success: true, content: updated });
  } catch (error: any) {
    console.error("Content update error:", error);
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  }
}

// DELETE — remove a content key (admin only)
export async function DELETE(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    await db.siteContent.delete({
      where: { key: String(key).slice(0, 100) },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true }); // already deleted
  }
}
