import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET — aggregate visitor stats (privacy-respecting, anonymous counts only)
export async function GET() {
  try {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalVisits,
      visits24h,
      visits7d,
      visits30d,
      sectionCounts,
      totalBookings,
      pendingBookings,
      totalTestimonials,
      approvedTestimonials,
      totalSubscribers,
      totalArticles,
    ] = await Promise.all([
      db.visit.count(),
      db.visit.count({ where: { createdAt: { gte: dayAgo } } }),
      db.visit.count({ where: { createdAt: { gte: weekAgo } } }),
      db.visit.count({ where: { createdAt: { gte: monthAgo } } }),
      db.visit.groupBy({
        by: ["section"],
        _count: { _all: true },
        orderBy: { _count: { section: "desc" } },
        take: 10,
      }),
      db.booking.count(),
      db.booking.count({ where: { status: "pending" } }),
      db.testimonial.count(),
      db.testimonial.count({ where: { approved: true } }),
      db.subscriber.count(),
      db.article.count({ where: { published: true } }),
    ]);

    // Build top sections array
    const topSections = sectionCounts.map((s) => ({
      section: s.section,
      count: s._count._all,
    }));

    return NextResponse.json({
      visits: {
        total: totalVisits,
        last24h: visits24h,
        last7d: visits7d,
        last30d: visits30d,
      },
      topSections,
      engagement: {
        bookings: totalBookings,
        pendingBookings,
        testimonials: totalTestimonials,
        approvedTestimonials,
        subscribers: totalSubscribers,
        articles: totalArticles,
      },
      generatedAt: now.toISOString(),
    });
  } catch (error: any) {
    console.error("Stats error:", error);
    return NextResponse.json(
      {
        visits: { total: 0, last24h: 0, last7d: 0, last30d: 0 },
        topSections: [],
        engagement: {
          bookings: 0,
          pendingBookings: 0,
          testimonials: 0,
          approvedTestimonials: 0,
          subscribers: 0,
          articles: 0,
        },
        error: "Failed to load stats",
      },
      { status: 200 }
    );
  }
}
