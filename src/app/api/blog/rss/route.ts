import { db } from "@/lib/db";
import { developer } from "@/lib/portfolio-data";

export const dynamic = "force-static";
export const revalidate = 3600;

function escapeXml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl = "https://yaseenahmadexe.vercel.app";

  let articles: Array<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    tags: string;
    createdAt: Date;
  }> = [];

  try {
    articles = await db.article.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        tags: true,
        createdAt: true,
      },
    });
  } catch {
    // If DB unavailable, return empty feed
  }

  const items = articles
    .map((a) => {
      const url = `${baseUrl}/#blog`;
      const pubDate = a.createdAt.toUTCString();
      const categories = a.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => `<category>${escapeXml(t)}</category>`)
        .join("");

      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="false">${escapeXml(a.slug)}</guid>
      <description>${escapeXml(a.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(developer.email)} (${escapeXml(developer.name)})</author>
      ${categories}
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(developer.name)} — Blog</title>
    <link>${escapeXml(baseUrl)}/#blog</link>
    <atom:link href="${escapeXml(baseUrl)}/api/blog/rss" rel="self" type="application/rss+xml" />
    <description>Thoughts on web development, architecture, and the freelance journey by ${escapeXml(developer.name)}.</description>
    <language>en-us</language>
    <managingEditor>${escapeXml(developer.email)} (${escapeXml(developer.name)})</managingEditor>
    <webMaster>${escapeXml(developer.email)} (${escapeXml(developer.name)})</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <copyright>© ${new Date().getFullYear()} ${escapeXml(developer.name)}. All rights reserved.</copyright>
    <image>
      <url>${escapeXml(baseUrl)}/assets/logo.png</url>
      <title>${escapeXml(developer.name)} — Blog</title>
      <link>${escapeXml(baseUrl)}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
