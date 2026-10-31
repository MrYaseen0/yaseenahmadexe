"use client";

import dynamic from "next/dynamic";
import { Users, Eye, LogOut } from "lucide-react";

const TrafficChart = dynamic(() => import("./traffic-chart"), {
  ssr: false,
  loading: () => <div className="h-56 animate-pulse rounded-xl bg-muted" />,
});

/**
 * Vercel-Analytics-style traffic dashboard for the admin panel.
 * Stat cards (Visitors / Page Views / Bounce Rate), a 7-day visitors chart,
 * and ranked breakdown panels: Pages, Referrers, Countries, Devices,
 * Browsers, Operating Systems.
 */

export interface TrafficAnalytics {
  visitors7d?: { date: string; label: string; visitors: number }[];
  pageviews7d?: { date: string; label: string; count: number }[];
  bounceRate?: number | null;
  topPages?: { path: string; count: number }[];
  referrers?: { referrer: string; count: number }[];
  countries?: { name: string; count: number }[];
  devices?: { name: string; count: number }[];
  browsers?: { name: string; count: number }[];
  operatingSystems?: { name: string; count: number }[];
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--hairline)] bg-card p-5 ">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className="text-4xl font-bold tracking-tight">{value}</span>
      </div>
    </div>
  );
}

function RankedPanel({
  title,
  rows,
  emptyHint,
}: {
  title: string;
  rows: { name: string; count: number }[];
  emptyHint?: string;
}) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="rounded-2xl border border-[var(--hairline)] bg-card p-5 ">
      <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
        Visitors
      </div>
      {rows.length > 0 ? (
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.name}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="max-w-[70%] truncate font-medium" title={r.name}>
                  {r.name}
                </span>
                <span className="font-mono font-bold">{r.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[var(--accent)]"
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <svg
            className="h-6 w-6 text-muted-foreground/50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 3v18h18" />
            <path d="M7 15l4-6 4 3 5-8" />
          </svg>
          <p className="text-sm text-muted-foreground">
            {emptyHint ?? "No data found for selected period."}
          </p>
        </div>
      )}
    </div>
  );
}

export function TrafficDashboard({ analytics }: { analytics: TrafficAnalytics }) {
  const visitors7d = analytics.visitors7d ?? [];
  const totalVisitors = visitors7d.reduce((s, d) => s + d.visitors, 0);
  const totalPageviews = (analytics.pageviews7d ?? []).reduce((s, d) => s + d.count, 0);
  const bounce = analytics.bounceRate;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Visitors"
          value={totalVisitors.toLocaleString()}
          color="text-[var(--accent)]"
        />
        <StatCard
          icon={Eye}
          label="Page Views"
          value={totalPageviews.toLocaleString()}
          color="text-pink-500"
        />
        <StatCard
          icon={LogOut}
          label="Bounce Rate"
          value={bounce === null || bounce === undefined ? "—" : `${bounce}%`}
          color="text-amber-500"
        />
      </div>

      {/* Visitors chart — last 7 days */}
      <div className="rounded-2xl border border-[var(--hairline)] bg-card p-5 ">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Visitors — Last 7 Days
        </h3>
        {visitors7d.length > 0 && totalVisitors > 0 ? (
          <TrafficChart data={visitors7d} />
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No data found for selected period.
          </p>
        )}
      </div>

      {/* Breakdown panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RankedPanel
          title="Pages"
          rows={(analytics.topPages ?? []).map((p) => ({ name: p.path, count: p.count }))}
        />
        <RankedPanel
          title="Referrers"
          rows={(analytics.referrers ?? []).map((r) => ({ name: r.referrer, count: r.count }))}
        />
        <RankedPanel title="Countries" rows={analytics.countries ?? []} />
        <RankedPanel title="Devices" rows={analytics.devices ?? []} />
        <RankedPanel title="Browsers" rows={analytics.browsers ?? []} />
        <RankedPanel title="Operating Systems" rows={analytics.operatingSystems ?? []} />
      </div>

      <p className="text-xs text-muted-foreground">
        Traffic is tracked by your own site (no third party). Bounce rate = sessions with a
        single tracked event ÷ all sessions, last 7 days.
      </p>
    </div>
  );
}
