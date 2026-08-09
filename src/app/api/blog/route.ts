import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET — list published articles (summary only, no full content)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featuredOnly = searchParams.get("featured") === "true";

  try {
    const articles = await db.article.findMany({
      where: {
        published: true,
        ...(featuredOnly ? { featured: true } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        tags: true,
        coverColor: true,
        readTime: true,
        featured: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error("Blog list error:", error);
    return NextResponse.json({ count: 0, articles: [] });
  }
}
