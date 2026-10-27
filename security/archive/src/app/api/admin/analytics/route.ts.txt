import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";

// GET — aggregated analytics data for charts (admin only).
//
// SPEED: daily series come from single indexed Postgres date_trunc queries
// (3 queries) instead of one count-query per day (58 queries before).
export async function GET(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dayKey = (d: Date) => d.toISOString().split("T")[0];

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

    // ---- Daily series: 3 indexed queries instead of 58 per-day counts ----
    const visitRows = await db.$queryRaw<{ day: Date; count: number }[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::int AS count
      FROM "Visit"
      WHERE "createdAt" >= ${days30[0]}
      GROUP BY 1 ORDER BY 1`;
    const visitByDay = new Map(visitRows.map((r) => [dayKey(new Date(r.day)), r.count]));

    const visits7d = days7.map((dayStart) => ({
      date: dayKey(dayStart),
      label: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
      count: visitByDay.get(dayKey(dayStart)) ?? 0,
    }));

    const visits30d = days30.map((dayStart) => ({
      date: dayKey(dayStart),
      count: visitByDay.get(dayKey(dayStart)) ?? 0,
    }));

    const bookingRows = await db.$queryRaw<{ day: Date; count: number }[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::int AS count
      FROM "Booking"
      WHERE "createdAt" >= ${days7[0]}
      GROUP BY 1 ORDER BY 1`;
    const bookingByDay = new Map(bookingRows.map((r) => [dayKey(new Date(r.day)), r.count]));

    const bookings7d = days7.map((dayStart) => ({
      date: dayKey(dayStart),
      label: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
      count: bookingByDay.get(dayKey(dayStart)) ?? 0,
    }));

    // Section breakdown (pie chart data)
    const sectionCounts = await db.visit.groupBy({
      by: ["section"],
      _count: { _all: true },
      orderBy: { _count: { section: "desc" } },
    });

    // Booking purposes + testimonial ratings: groupBy instead of full scans
    const [purposeGroups, ratingGroups, bookingCount, testimonialCount, pendingCount] =
      await Promise.all([
        db.booking.groupBy({ by: ["purpose"], _count: { _all: true } }),
        db.testimonial.groupBy({ by: ["rating"], _count: { _all: true } }),
        db.booking.count(),
        db.testimonial.count(),
        db.booking.count({ where: { status: "pending" } }),
      ]);
    const bookingPurposes = purposeGroups.map((g) => ({
      purpose: g.purpose,
      count: g._count._all,
    }));
    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count:
        ratingGroups.find((g) => g.rating === rating)?._count._all ?? 0,
    }));

    // ---------- Vercel-style traffic breakdowns ----------
    // Each is best-effort: if the new columns don't exist yet (migration
    // not applied), fall back to empty data instead of failing the request.
    const weekAgo = days7[0];

    const visitors7d: { date: string; label: string; visitors: number }[] = [];
    const pageviews7d: { date: string; label: string; count: number }[] = [];
    let bounceRate: number | null = null;
    let topPages: { path: string; count: number }[] = [];
    let referrers: { referrer: string; count: number }[] = [];
    let countries: { name: string; count: number }[] = [];
    let devices: { name: string; count: number }[] = [];
    let browsers: { name: string; count: number }[] = [];
    let operatingSystems: { name: string; count: number }[] = [];

    try {
      // Unique visitors + pageviews per day (last 7 days): ONE indexed query.
      const trafficRows = await db.$queryRaw<
        { day: Date; visitors: number; pageviews: number }[]
      >`
        SELECT date_trunc('day', "createdAt") AS day,
               COUNT(DISTINCT "ipHash")::int AS visitors,
               SUM(CASE WHEN "isPageview" THEN 1 ELSE 0 END)::int AS pageviews
        FROM "Visit"
        WHERE "createdAt" >= ${weekAgo}
        GROUP BY 1 ORDER BY 1`;
      const trafficByDay = new Map(
        trafficRows.map((r) => [dayKey(new Date(r.day)), r])
      );
      days7.forEach((dayStart, i) => {
        const t = trafficByDay.get(dayKey(dayStart));
        visitors7d[i] = {
          date: dayKey(dayStart),
          label: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
          visitors: t?.visitors ?? 0,
        };
        pageviews7d[i] = {
          date: dayKey(dayStart),
          label: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
          count: t?.pageviews ?? 0,
        };
      });

      // Bounce rate: sessions (last 7d) with exactly one tracked event
      const sessionGroups = await db.visit.groupBy({
        by: ["sessionId"],
        where: { createdAt: { gte: weekAgo } },
        _count: { _all: true },
      });
      const realSessions = sessionGroups.filter((g) => g.sessionId);
      if (realSessions.length > 0) {
        const bounced = realSessions.filter((g) => g._count._all <= 1).length;
        bounceRate = Math.round((bounced / realSessions.length) * 100);
      }

      const top = await db.visit.groupBy({
        by: ["path"],
        where: { createdAt: { gte: weekAgo }, isPageview: true },
        _count: { _all: true },
        orderBy: { _count: { path: "desc" } },
        take: 10,
      });
      topPages = top.map((t) => ({ path: t.path, count: t._count._all }));

      const refs = await db.visit.groupBy({
        by: ["referrer"],
        where: { createdAt: { gte: weekAgo } },
        _count: { _all: true },
        orderBy: { _count: { referrer: "desc" } },
        take: 10,
      });
      referrers = refs
        .filter((r) => r.referrer)
        .map((r) => ({ referrer: r.referrer as string, count: r._count._all }));

      const breakdown = async (field: "country" | "device" | "browser" | "os") => {
        const rows = await db.visit.groupBy({
          by: [field],
          where: { createdAt: { gte: weekAgo } },
          _count: { _all: true },
          orderBy: { _count: { [field]: "desc" } },
          take: 10,
        });
        return rows
          .filter((r) => (r as any)[field])
          .map((r) => ({
            name: String((r as any)[field]),
            count: r._count._all,
          }));
      };
      countries = await breakdown("country");
      devices = await breakdown("device");
      browsers = await breakdown("browser");
      operatingSystems = await breakdown("os");
    } catch (e) {
      // New columns not migrated yet — dashboard shows empty panels, old data intact.
      console.warn("Extended analytics unavailable:", (e as Error)?.message);
    }

    return NextResponse.json({
      visits7d,
      visits30d,
      bookings7d,
      sections: sectionCounts.map((s) => ({
        section: s.section,
        count: s._count._all,
      })),
      bookingPurposes,
      ratingDistribution,
      totals: {
        visits: visits30d.reduce((sum, d) => sum + d.count, 0),
        bookings: bookingCount,
        testimonials: testimonialCount,
        pendingBookings: pendingCount,
      },
      // Vercel-style
      visitors7d,
      pageviews7d,
      bounceRate,
      topPages,
      referrers,
      countries,
      devices,
      browsers,
      operatingSystems,
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
