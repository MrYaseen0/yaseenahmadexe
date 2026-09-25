"use client";

import { useCallback, useEffect, useState } from "react";
import { History, RefreshCw, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Unified professional audit timeline for the admin panel.
 * Every row: who (actor/IP), when (PKT timestamp), where (city/region/country
 * + ISP), which device (device ID + device/browser/OS), and what (path/detail).
 * Covers admin logins, admin page views, admin actions, content edits, and
 * every attack event — one fast, filterable feed.
 */

interface ActivityEntry {
  id: string;
  event: string;
  actor: string | null;
  ip: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  isp: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  deviceId: string | null;
  path: string | null;
  detail: string | null;
  createdAt: string;
}

const EVENT_STYLE: Record<string, string> = {
  ADMIN_LOGIN: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  ADMIN_LOGOUT: "bg-slate-500/10 text-slate-500 border-slate-500/30",
  ADMIN_PAGE_VIEW: "bg-sky-500/10 text-sky-600 border-sky-500/30",
  ADMIN_ACTION: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  CONTENT_EDIT: "bg-violet-500/10 text-violet-600 border-violet-500/30",
  FAILED_LOGIN: "bg-red-500/10 text-red-500 border-red-500/30",
  RATE_LIMIT: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  BURST: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  BLOCKED_HIT: "bg-red-500/10 text-red-600 border-red-500/30",
  SUSPICIOUS: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
};

const EVENT_LABEL: Record<string, string> = {
  ADMIN_LOGIN: "Admin login",
  ADMIN_LOGOUT: "Admin logout",
  ADMIN_PAGE_VIEW: "Admin page view",
  ADMIN_ACTION: "Admin action",
  CONTENT_EDIT: "Content edit",
  FAILED_LOGIN: "Failed login",
  RATE_LIMIT: "Rate limited",
  BURST: "Burst / DDoS",
  BLOCKED_HIT: "Blocked IP hit",
  SUSPICIOUS: "Suspicious",
};

const EVENT_OPTIONS = [
  { value: "", label: "All events" },
  { value: "ADMIN_LOGIN", label: "Admin logins" },
  { value: "ADMIN_PAGE_VIEW", label: "Admin page views" },
  { value: "ADMIN_ACTION", label: "Admin actions" },
  { value: "CONTENT_EDIT", label: "Content edits" },
  { value: "FAILED_LOGIN", label: "Failed logins" },
  { value: "RATE_LIMIT", label: "Rate limits" },
  { value: "BURST", label: "Bursts" },
  { value: "BLOCKED_HIT", label: "Blocked IP hits" },
  { value: "SUSPICIOUS", label: "Suspicious" },
];

function prettyDetail(e: ActivityEntry): string | null {
  if (!e.detail) return null;
  if (e.event !== "CONTENT_EDIT") return e.detail;
  try {
    const d = JSON.parse(e.detail);
    if (d && typeof d === "object" && d.summary) return String(d.summary);
  } catch {
    /* free-text detail */
  }
  return e.detail;
}

function locationLine(e: ActivityEntry): string | null {
  const parts = [e.city, e.region, e.country].filter(Boolean) as string[];
  const loc = parts.length ? parts.join(", ") : null;
  if (loc && e.isp) return `${loc} · ${e.isp}`;
  return loc || (e.isp ? e.isp : null);
}

function deviceLine(e: ActivityEntry): string | null {
  const parts = [e.device, e.browser, e.os].filter(Boolean) as string[];
  return parts.length ? parts.join(" · ") : null;
}

export default function ActivityFeed({
  authHeaders,
}: {
  authHeaders: Record<string, string>;
}) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (cursor?: string | null) => {
      const params = new URLSearchParams({ limit: "50" });
      if (appliedQuery) params.set("q", appliedQuery);
      if (eventFilter) params.set("event", eventFilter);
      if (cursor) params.set("cursor", cursor);
      const res = await fetch(`/api/admin/activity?${params.toString()}`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.needsMigration) setNeedsMigration(true);
      return {
        page: (data.entries || []) as ActivityEntry[],
        nextCursor: (data.nextCursor as string | null) || null,
      };
    },
    [authHeaders, appliedQuery, eventFilter]
  );

  const load = useCallback(
    async (cursor?: string | null) => {
      if (cursor) setLoadingMore(true);
      else setLoading(true);
      try {
        const { page, nextCursor } = await fetchPage(cursor);
        setEntries((prev) => (cursor ? [...prev, ...page] : page));
        setNextCursor(nextCursor);
      } catch {
        toast.error("Failed to load activity");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [fetchPage]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { page, nextCursor } = await fetchPage(null);
        if (cancelled) return;
        setEntries(page);
        setNextCursor(nextCursor);
      } catch {
        if (!cancelled) toast.error("Failed to load activity");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  const applyFilters = () => {
    setNextCursor(null);
    setAppliedQuery(query);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <History className="h-4 w-4 text-sky-500" />
          {entries.length} recorded event{entries.length === 1 ? "" : "s"}
          {nextCursor && " — more available"}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Search IP, email, city, ISP, device..."
              className="rounded-full pl-9"
            />
          </div>
          <select
            value={eventFilter}
            onChange={(e) => {
              setEventFilter(e.target.value);
              setNextCursor(null);
            }}
            className="rounded-full border border-input bg-background px-3 py-2 text-sm"
            aria-label="Filter by event"
          >
            {EVENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={applyFilters} className="rounded-full">
            Apply
          </Button>
          <Button variant="outline" size="sm" onClick={() => load()} className="rounded-full">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {needsMigration && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
          The audit table is not created yet. Run <code className="font-mono">npx prisma db push</code> against
          the production database, then refresh.
        </div>
      )}

      {loading ? (
        <div className="space-y-2" aria-label="Loading activity">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/40" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-sky-500/15 bg-card p-12 text-center text-muted-foreground">
          <History className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          {appliedQuery || eventFilter
            ? "No events match your filters."
            : "No activity recorded yet. Admin logins, page views, actions and attack attempts appear here."}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {entries.map((e) => {
              const isOpen = expanded === e.id;
              const when = new Date(e.createdAt).toLocaleString("en-PK", {
                timeZone: "Asia/Karachi",
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              });
              const loc = locationLine(e);
              const dev = deviceLine(e);
              return (
                <div
                  key={e.id}
                  className="rounded-xl border border-sky-500/10 bg-card p-4 shadow-soft"
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : e.id)}
                    className="flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 text-left"
                  >
                    <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {when}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn("text-[11px]", EVENT_STYLE[e.event] || "")}
                    >
                      {EVENT_LABEL[e.event] || e.event}
                    </Badge>
                    {e.actor && (
                      <span className="text-sm font-medium">{e.actor}</span>
                    )}
                    {e.ip && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {e.ip}
                      </span>
                    )}
                    <ChevronDown
                      className={cn(
                        "ml-auto h-4 w-4 text-muted-foreground transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {loc && <span>📍 {loc}</span>}
                    {e.deviceId && (
                      <span className="font-mono">🆔 {e.deviceId}</span>
                    )}
                    {dev && <span>💻 {dev}</span>}
                    {e.path && <span className="font-mono">{e.path}</span>}
                  </div>
                  {(prettyDetail(e) || isOpen) && (
                    <div className="mt-2 text-sm">
                      {prettyDetail(e) && (
                        <p className={cn(!isOpen && "line-clamp-2")}>
                          {prettyDetail(e)}
                        </p>
                      )}
                      {isOpen && (
                        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-3">
                          <div><dt className="font-medium text-foreground">IP</dt><dd className="font-mono">{e.ip || "—"}</dd></div>
                          <div><dt className="font-medium text-foreground">Device ID</dt><dd className="font-mono">{e.deviceId || "—"}</dd></div>
                          <div><dt className="font-medium text-foreground">Location</dt><dd>{loc || "—"}</dd></div>
                          <div><dt className="font-medium text-foreground">Device</dt><dd>{dev || "—"}</dd></div>
                          <div><dt className="font-medium text-foreground">Path</dt><dd className="font-mono">{e.path || "—"}</dd></div>
                          <div><dt className="font-medium text-foreground">Time (PKT)</dt><dd className="font-mono">{when}</dd></div>
                        </dl>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {nextCursor && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => load(nextCursor)}
                disabled={loadingMore}
                className="rounded-full"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
