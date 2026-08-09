"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  TrendingUp,
  Calendar,
  Mail,
  MessageSquare,
  FileText,
  Users,
  Activity,
} from "lucide-react";

interface StatsData {
  visits: {
    total: number;
    last24h: number;
    last7d: number;
    last30d: number;
  };
  topSections: { section: string; count: number }[];
  engagement: {
    bookings: number;
    pendingBookings: number;
    testimonials: number;
    approvedTestimonials: number;
    subscribers: number;
    articles: number;
  };
  generatedAt: string;
}

export function StatsWidget() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="glass-card animate-fade-in-up rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 animate-pulse text-sky-500" />
          <span className="text-sm font-semibold">Live Stats</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "Total Views",
      value: stats.visits.total,
      icon: Eye,
      color: "text-sky-500",
      sub: `+${stats.visits.last24h} today`,
    },
    {
      label: "This Week",
      value: stats.visits.last7d,
      icon: TrendingUp,
      color: "text-pink-500",
      sub: `${stats.visits.last30d} / 30d`,
    },
    {
      label: "Bookings",
      value: stats.engagement.bookings,
      icon: Calendar,
      color: "text-wood",
      sub: `${stats.engagement.pendingBookings} pending`,
    },
    {
      label: "Testimonials",
      value: stats.engagement.testimonials,
      icon: MessageSquare,
      color: "text-sky-500",
      sub: `${stats.engagement.approvedTestimonials} approved`,
    },
    {
      label: "Subscribers",
      value: stats.engagement.subscribers,
      icon: Mail,
      color: "text-pink-500",
      sub: "newsletter",
    },
    {
      label: "Articles",
      value: stats.engagement.articles,
      icon: FileText,
      color: "text-wood",
      sub: "published",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass-card overflow-hidden rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sky-500/15 bg-gradient-to-r from-sky-500/5 to-pink-500/5 px-5 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-sky-500" />
          <span className="text-sm font-bold">Live Analytics</span>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
          </span>
          Live
        </span>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-sky-500/15 bg-card p-3 text-center shadow-soft"
            >
              <div className={`mx-auto mb-1 flex justify-center ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-xl font-bold text-gradient-sky-pink">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </div>
              <div className="mt-0.5 text-[9px] text-muted-foreground/70">
                {stat.sub}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Top sections */}
      {stats.topSections.length > 0 && (
        <div className="border-t border-sky-500/10 px-5 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <Users className="h-3 w-3 text-pink-500" />
            Most Viewed Sections
          </div>
          <div className="space-y-1.5">
            {stats.topSections.slice(0, 5).map((s, i) => {
              const maxCount = stats.topSections[0]?.count || 1;
              const pct = (s.count / maxCount) * 100;
              return (
                <div key={s.section} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-xs font-medium capitalize text-muted-foreground">
                    {s.section}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-pink-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-[10px] font-mono text-muted-foreground">
                    {s.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
