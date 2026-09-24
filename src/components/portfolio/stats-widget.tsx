"use client";

import { useEffect, useState } from "react";
import { useContent } from "@/components/portfolio/content-editor";
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
  const { t } = useContent();
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
      <div className="rounded-2xl border border-[--hairline] bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 animate-pulse text-[#166534]" />
          <span className="text-sm font-semibold text-[#101410]">{t("stats.title")}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-[#F4F5F1]" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: t("stats.totalViews"),
      value: stats.visits.total,
      icon: Eye,
      sub: `+${stats.visits.last24h} ${t("stats.today")}`,
    },
    {
      label: t("stats.thisWeek"),
      value: stats.visits.last7d,
      icon: TrendingUp,
      sub: `${stats.visits.last30d} ${t("stats.per30d")}`,
    },
    {
      label: t("stats.bookings"),
      value: stats.engagement.bookings,
      icon: Calendar,
      sub: `${stats.engagement.pendingBookings} ${t("stats.pending")}`,
    },
    {
      label: t("stats.testimonials"),
      value: stats.engagement.testimonials,
      icon: MessageSquare,
      sub: `${stats.engagement.approvedTestimonials} ${t("stats.approved")}`,
    },
    {
      label: t("stats.subscribers"),
      value: stats.engagement.subscribers,
      icon: Mail,
      sub: t("stats.newsletter"),
    },
    {
      label: t("stats.articles"),
      value: stats.engagement.articles,
      icon: FileText,
      sub: t("stats.published"),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden rounded-2xl border border-[--hairline] bg-white shadow-[0_8px_24px_rgba(16,20,16,0.06)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[--hairline] px-5 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#166534]" />
          <span className="text-sm font-bold text-[#101410]">{t("stats.analytics")}</span>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-[#EAF3EC] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-[#166534]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#166534] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#166534]" />
          </span>
          {t("stats.live")}
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
              className="rounded-xl border border-[--hairline] bg-white p-3 text-center"
            >
              <div className="mx-auto mb-1 flex justify-center text-[#101410]">
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-xl font-bold text-[#101410]">
                {stat.value.toLocaleString()}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#5F665F]">
                {stat.label}
              </div>
              <div className="mt-0.5 text-[9px] text-[#5F665F]/70">
                {stat.sub}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Top sections */}
      {stats.topSections.length > 0 && (
        <div className="border-t border-[--hairline] px-5 py-3">
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#5F665F]">
            <Users className="h-3 w-3 text-[#166534]" />
            {t("stats.topSections")}
          </div>
          <div className="space-y-1.5">
            {stats.topSections.slice(0, 5).map((s) => {
              const maxCount = stats.topSections[0]?.count || 1;
              const pct = (s.count / maxCount) * 100;
              return (
                <div key={s.section} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-xs font-medium capitalize text-[#5F665F]">
                    {s.section}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F4F5F1]">
                    <div
                      className="h-full rounded-full bg-[#166534]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right font-mono text-[10px] text-[#5F665F]">
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
