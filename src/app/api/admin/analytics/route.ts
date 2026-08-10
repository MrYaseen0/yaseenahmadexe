import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";

// GET — aggregated analytics data for charts (admin only)
export async function GET(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const days7 = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const days30 = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    // Visits per day for last 7 days
    const visits7d = await Promise.all(
      days7.map(async (dayStart) => {
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const count = await db.visit.count({
          where: {
            createdAt: { gte: dayStart, lt: dayEnd },
          },
        });
        return {
          date: dayStart.toISOString().split("T")[0],
          label: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
          count,
        };
      })
    );

    // Visits per day for last 30 days
    const visits30d = await Promise.all(
      days30.map(async (dayStart) => {
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const count = await db.visit.count({
          where: {
            createdAt: { gte: dayStart, lt: dayEnd },
          },
        });
        return {
          date: dayStart.toISOString().split("T")[0],
          count,
        };
      })
    );

    // Bookings per day for last 7 days
    const bookings7d = await Promise.all(
      days7.map(async (dayStart) => {
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const count = await db.booking.count({
          where: {
            createdAt: { gte: dayStart, lt: dayEnd },
          },
        });
        return {
          date: dayStart.toISOString().split("T")[0],
          label: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
          count,
        };
      })
    );

    // Section breakdown (pie chart data)
    const sectionCounts = await db.visit.groupBy({
      by: ["section"],
      _count: { _all: true },
      orderBy: { _count: { section: "desc" } },
    });

    // Booking purposes breakdown
    const bookings = await db.booking.findMany();
    const purposeMap: Record<string, number> = {};
    bookings.forEach((b) => {
      purposeMap[b.purpose] = (purposeMap[b.purpose] || 0) + 1;
    });

    // Testimonials by rating
    const testimonials = await db.testimonial.findMany();
    const ratingMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    testimonials.forEach((t) => {
      ratingMap[t.rating] = (ratingMap[t.rating] || 0) + 1;
    });

    return NextResponse.json({
      visits7d,
      visits30d,
      bookings7d,
      sections: sectionCounts.map((s) => ({
        section: s.section,
        count: s._count._all,
      })),
      bookingPurposes: Object.entries(purposeMap).map(([purpose, count]) => ({
        purpose,
        count,
      })),
      ratingDistribution: Object.entries(ratingMap).map(([rating, count]) => ({
        rating: Number(rating),
        count,
      })),
      totals: {
        visits: visits30d.reduce((sum, d) => sum + d.count, 0),
        bookings: bookings.length,
        testimonials: testimonials.length,
        pendingBookings: bookings.filter((b) => b.status === "pending").length,
      },
    });
  } catch (error: any) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      {
        visits7d: [],
        visits30d: [],
        bookings7d: [],
        sections: [],
        bookingPurposes: [],
        ratingDistribution: [],
        totals: { visits: 0, bookings: 0, testimonials: 0, pendingBookings: 0 },
        error: "Failed to load analytics",
      },
      { status: 200 }
    );
  }
}
