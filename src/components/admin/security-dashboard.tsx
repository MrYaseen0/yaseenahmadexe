"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, Ban, RefreshCw, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Attack / abuse monitoring for the admin panel.
 * Shows failed logins, rate-limit hits, request bursts (DDoS-like),
 * blocked-IP hits, top offending IPs, and manual block/unblock controls.
 */

interface SecurityEvent {
  id: string;
  type: string;
  ip: string;
  path: string | null;
  detail: string | null;
  createdAt: string;
}

interface BlockedEntry {
  ip: string;
  reason: string | null;
  createdAt: string;
}

interface SecurityData {
  events: SecurityEvent[];
  blocked: BlockedEntry[];
  stats24h: {
    failedLogins: number;
    rateLimits: number;
    bursts: number;
    blockedHits: number;
    total: number;
  };
  topOffenders: { ip: string; count: number }[];
  needsMigration?: boolean;
}

const TYPE_STYLE: Record<string, string> = {
  FAILED_LOGIN: "bg-red-500/10 text-red-500 border-red-500/30",
  RATE_LIMIT: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  BURST: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  BLOCKED_HIT: "bg-slate-500/10 text-slate-500 border-slate-500/30",
  SUSPICIOUS: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  CONTENT_EDIT: "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/30",
};

const TYPE_LABEL: Record<string, string> = {
  FAILED_LOGIN: "Failed login",
  RATE_LIMIT: "Rate limited",
  BURST: "Burst / DDoS",
  BLOCKED_HIT: "Blocked IP hit",
  SUSPICIOUS: "Suspicious",
  CONTENT_EDIT: "Content edit",
};

/**
 * CONTENT_EDIT audit events store their structured payload as JSON in
 * `detail` (see /api/admin/content). The attack feed shows the readable
 * summary line; the full Audit Log tab shows the structured fields.
 */
function prettyDetail(e: SecurityEvent): string | null {
  if (!e.detail) return null;
  if (e.type !== "CONTENT_EDIT") return e.detail;
  try {
    const d = JSON.parse(e.detail);
    if (d && typeof d === "object" && d.summary) return String(d.summary);
  } catch {
    /* legacy free-text detail */
  }
  return e.detail;
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function SecurityDashboard({
  authHeaders,
}: {
  authHeaders: Record<string, string>;
}) {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [blockIpInput, setBlockIpInput] = useState("");
  const [blocking, setBlocking] = useState(false);

  const fetchSecurity = useCallback(async () => {
    const res = await fetch("/api/admin/security", { headers: authHeaders });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to load");
    return json as SecurityData;
  }, [authHeaders]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchSecurity());
    } catch (e: any) {
      toast.error("Security feed failed", { description: e?.message });
    } finally {
      setLoading(false);
    }
  }, [fetchSecurity]);

  // Initial load + 30s auto-refresh. All state updates happen after `await`,
  // never synchronously inside the effect. Cancelled on unmount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await fetchSecurity();
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) toast.error("Security feed failed", { description: e?.message });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    const t = setInterval(() => {
      void load();
    }, 30000); // auto-refresh every 30s
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [fetchSecurity, load]);

  const blockIp = async () => {
    const ip = blockIpInput.trim();
    if (!ip) return;
    setBlocking(true);
    try {
      const res = await fetch("/api/admin/security", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ip, reason: "Blocked manually from admin" }),
      });
      if (!res.ok) throw new Error("Block failed");
      toast.success(`Blocked ${ip}`);
      setBlockIpInput("");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Block failed");
    } finally {
      setBlocking(false);
    }
  };

  const unblockIp = async (ip: string) => {
    try {
      const res = await fetch(`/api/admin/security?ip=${encodeURIComponent(ip)}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Unblock failed");
      toast.success(`Unblocked ${ip}`);
      load();
    } catch (e: any) {
      toast.error(e?.message || "Unblock failed");
    }
  };

  if (loading && !data) {
    return <div className="py-10 text-center text-muted-foreground">Loading security feed…</div>;
  }

  if (data?.needsMigration) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
        <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-amber-500" />
        <h3 className="font-bold">Database migration needed</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The security tables don&apos;t exist yet. Run{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">npx prisma db push</code>{" "}
          against your production database, then refresh this page.
        </p>
      </div>
    );
  }

  const s = data?.stats24h ?? { failedLogins: 0, rateLimits: 0, bursts: 0, blockedHits: 0, total: 0 };

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Failed logins (24h)", value: s.failedLogins, icon: KeyRound, color: "text-red-500" },
          { label: "Rate-limit hits (24h)", value: s.rateLimits, icon: ShieldAlert, color: "text-amber-500" },
          { label: "Bursts blocked (24h)", value: s.bursts, icon: ShieldAlert, color: "text-purple-500" },
          { label: "IPs blocked", value: data?.blocked.length ?? 0, icon: Ban, color: "text-slate-500" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-[var(--hairline)] bg-card p-5 ">
            <div className={cn("mb-2 flex items-center gap-2", c.color)}>
              <c.icon className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">{c.label}</span>
            </div>
            <div className="text-3xl font-bold">{c.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          Auto-protection is on: login brute-force throttled at 10/min, tracking bursts
          (&gt;300/min) auto-block the IP.
        </p>
        <Button variant="outline" size="sm" onClick={load} className="rounded-full">
          <RefreshCw className={cn("mr-1.5 h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Event feed */}
        <div className="rounded-2xl border border-[var(--hairline)] bg-card p-5  lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Attack feed — latest 100 events
          </h3>
          {(data?.events.length ?? 0) > 0 ? (
            <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">
              {data!.events.map((e) => (
                <div
                  key={e.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-muted bg-muted/30 px-3 py-2 text-xs"
                >
                  <Badge variant="outline" className={cn("shrink-0", TYPE_STYLE[e.type] ?? "")}>
                    {TYPE_LABEL[e.type] ?? e.type}
                  </Badge>
                  <code className="font-mono font-bold">{e.ip}</code>
                  <span className="text-muted-foreground">{timeAgo(e.createdAt)}</span>
                  {prettyDetail(e) && (
                    <span className="w-full truncate text-muted-foreground" title={prettyDetail(e) ?? undefined}>
                      {prettyDetail(e)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              All quiet — no attacks recorded.
            </p>
          )}
        </div>

        {/* Blocked IPs + top offenders */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--hairline)] bg-card p-5 ">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Blocked IPs
            </h3>
            <div className="mb-4 flex gap-2">
              <Input
                value={blockIpInput}
                onChange={(e) => setBlockIpInput(e.target.value)}
                placeholder="1.2.3.4"
                className="rounded-xl font-mono text-sm"
                onKeyDown={(e) => e.key === "Enter" && blockIp()}
              />
              <Button onClick={blockIp} disabled={blocking} className="rounded-xl">
                <Ban className="mr-1.5 h-4 w-4" /> Block
              </Button>
            </div>
            {(data?.blocked.length ?? 0) > 0 ? (
              <div className="space-y-2">
                {data!.blocked.map((b) => (
                  <div
                    key={b.ip}
                    className="flex items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <code className="font-mono font-bold">{b.ip}</code>
                      {b.reason && (
                        <div className="truncate text-muted-foreground" title={b.reason}>
                          {b.reason}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-full"
                      onClick={() => unblockIp(b.ip)}
                    >
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No blocked IPs.</p>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--hairline)] bg-card p-5 ">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Top offenders (24h)
            </h3>
            {(data?.topOffenders.length ?? 0) > 0 ? (
              <div className="space-y-2">
                {data!.topOffenders.map((o) => (
                  <div key={o.ip} className="flex items-center justify-between text-xs">
                    <code className="font-mono">{o.ip}</code>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">{o.count} events</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 rounded-full px-2 text-red-500"
                        onClick={() => {
                          setBlockIpInput(o.ip);
                        }}
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No offenders in the last 24h.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
