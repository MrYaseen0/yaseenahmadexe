"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  Trash2,
  Check,
  X,
  Calendar,
  MessageSquare,
  Mail,
  FileText,
  Activity,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { developer } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

const ADMIN_KEY_STORAGE = "ya-admin-key";
const ADMIN_KEY_DEFAULT = "yaseen-admin-2026";

interface Booking {
  id: string;
  name: string;
  email: string;
  purpose: string;
  date: string;
  time: string;
  timezone: string;
  notes: string | null;
  status: string;
  createdAt: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string | null;
  email: string;
  rating: number;
  message: string;
  approved: boolean;
  color: string;
  createdAt: string;
}

interface Stats {
  visits: { total: number; last24h: number; last7d: number; last30d: number };
  topSections: { section: string; count: number }[];
  engagement: {
    bookings: number;
    pendingBookings: number;
    testimonials: number;
    approvedTestimonials: number;
    subscribers: number;
    articles: number;
  };
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_KEY_STORAGE);
    if (stored === ADMIN_KEY_DEFAULT) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthed(true);
    }
  }, []);

  const authenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (key === ADMIN_KEY_DEFAULT) {
      localStorage.setItem(ADMIN_KEY_STORAGE, key);
      setAuthed(true);
      toast.success("Welcome back, Yaseen!");
    } else {
      toast.error("Invalid admin key");
    }
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
    setAuthed(false);
    setKey("");
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-pink-50 px-4 dark:from-slate-950 dark:to-rose-950/40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-sky-500/20 bg-card p-8 shadow-card-hover"
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-pink-500 shadow-glow-sky">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your admin key to manage bookings, testimonials, and view analytics.
            </p>
          </div>
          <form onSubmit={authenticate} className="space-y-4">
            <Input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Admin key"
              className="rounded-xl"
              autoFocus
            />
            <Button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 text-white"
            >
              <Shield className="mr-2 h-4 w-4" />
              Unlock Dashboard
            </Button>
          </form>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Hint: Default key is <code className="rounded bg-muted px-1 py-0.5 font-mono">yaseen-admin-2026</code>
          </p>
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-xs text-muted-foreground hover:text-sky-600"
            >
              ← Back to portfolio
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return <AdminDashboard onLogout={logout} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const authHeaders = {
    Authorization: `Bearer ${ADMIN_KEY_DEFAULT}`,
    "Content-Type": "application/json",
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [bookRes, testRes, statsRes] = await Promise.all([
        fetch("/api/admin/testimonials", { headers: authHeaders }),
        fetch("/api/admin/testimonials", { headers: authHeaders }),
        fetch("/api/stats", { cache: "no-store" }),
      ]);
      const bookData = await bookRes.json();
      const testData = await testRes.json();
      const statsData = await statsRes.json();
      // Bookings come from the public GET endpoint
      const bookingRes = await fetch("/api/booking");
      const bookingData = await bookingRes.json();
      setBookings(bookingData.bookings || []);
      setTestimonials(testData.testimonials || []);
      setStats(statsData);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const approveTestimonial = async (id: string) => {
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ id, action: "approve" }),
      });
      if (res.ok) {
        toast.success("Testimonial approved");
        loadAll();
      }
    } catch {
      toast.error("Failed to approve");
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm("Delete this testimonial permanently?")) return;
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ id, action: "delete" }),
      });
      if (res.ok) {
        toast.success("Testimonial deleted");
        loadAll();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50/50 to-pink-50/50 dark:from-slate-950 dark:to-rose-950/30">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-sky-500/15 bg-card/80 backdrop-blur">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-pink-500">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold sm:text-lg">Admin Dashboard</h1>
              <p className="text-[11px] text-muted-foreground">{developer.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={loadAll} disabled={loading} className="rounded-full">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              <span className="hidden sm:inline ml-1">Refresh</span>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <a href="/" target="_blank">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">View Site</span>
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout} className="rounded-full">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 rounded-full bg-muted p-1 sm:w-auto sm:grid-cols-4">
            <TabsTrigger value="overview" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Activity className="mr-1.5 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Calendar className="mr-1.5 h-4 w-4" />
              Bookings
              {stats?.engagement.pendingBookings ? (
                <Badge className="ml-1.5 bg-pink-500 text-white">{stats.engagement.pendingBookings}</Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Testimonials
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Mail className="mr-1.5 h-4 w-4" />
              Email List
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-6">
            {stats ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard icon={Eye} label="Total Visits" value={stats.visits.total} sub={`+${stats.visits.last24h} today`} color="text-sky-500" />
                  <StatCard icon={Calendar} label="Bookings" value={stats.engagement.bookings} sub={`${stats.engagement.pendingBookings} pending`} color="text-pink-500" />
                  <StatCard icon={MessageSquare} label="Testimonials" value={stats.engagement.testimonials} sub={`${stats.engagement.approvedTestimonials} approved`} color="text-wood" />
                  <StatCard icon={Mail} label="Subscribers" value={stats.engagement.subscribers} sub="newsletter" color="text-sky-500" />
                </div>

                {/* Top sections */}
                <div className="rounded-2xl border border-sky-500/15 bg-card p-5 shadow-soft">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    <Activity className="h-4 w-4 text-pink-500" />
                    Top Viewed Sections
                  </h3>
                  {stats.topSections.length > 0 ? (
                    <div className="space-y-2">
                      {stats.topSections.map((s) => {
                        const max = stats.topSections[0]?.count || 1;
                        const pct = (s.count / max) * 100;
                        return (
                          <div key={s.section} className="flex items-center gap-3">
                            <span className="w-20 shrink-0 text-sm font-medium capitalize">{s.section}</span>
                            <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-pink-400" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-12 shrink-0 text-right text-sm font-mono font-bold">{s.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No data yet</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">Loading stats...</div>
            )}
          </TabsContent>

          {/* Bookings */}
          <TabsContent value="bookings" className="mt-6">
            <div className="space-y-3">
              {bookings.length === 0 ? (
                <div className="rounded-2xl border border-sky-500/15 bg-card p-12 text-center text-muted-foreground">
                  <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                  No bookings yet
                </div>
              ) : (
                bookings.map((b) => (
                  <div key={b.id} className="rounded-2xl border border-sky-500/15 bg-card p-4 shadow-soft">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold">{b.name}</h4>
                          <Badge className={cn(
                            "rounded-full px-2 py-0.5 text-[10px]",
                            b.status === "pending" ? "bg-amber-500/15 text-amber-600" :
                            b.status === "confirmed" ? "bg-green-500/15 text-green-600" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {b.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{b.email}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div className="font-semibold text-foreground">{b.purpose}</div>
                        <div>{b.date} at {b.time}</div>
                        <div>{b.timezone}</div>
                      </div>
                    </div>
                    {b.notes && (
                      <p className="mt-2 rounded-lg bg-muted/30 p-2 text-xs text-muted-foreground">
                        <strong>Notes:</strong> {b.notes}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between border-t border-sky-500/10 pt-2 text-[11px] text-muted-foreground">
                      <span>Submitted {new Date(b.createdAt).toLocaleString()}</span>
                      <a
                        href={`/api/booking/calendar?date=${b.date}&time=${encodeURIComponent(b.time)}&purpose=${encodeURIComponent(b.purpose)}&name=${encodeURIComponent(b.name)}&email=${encodeURIComponent(b.email)}`}
                        download
                        className="text-sky-600 hover:underline"
                      >
                        Download .ics
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Testimonials */}
          <TabsContent value="testimonials" className="mt-6">
            <div className="space-y-3">
              {testimonials.length === 0 ? (
                <div className="rounded-2xl border border-sky-500/15 bg-card p-12 text-center text-muted-foreground">
                  <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                  No testimonials yet
                </div>
              ) : (
                testimonials.map((t) => (
                  <div key={t.id} className="rounded-2xl border border-sky-500/15 bg-card p-4 shadow-soft">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold">{t.name}</h4>
                          <Badge className={cn(
                            "rounded-full px-2 py-0.5 text-[10px]",
                            t.approved ? "bg-green-500/15 text-green-600" : "bg-amber-500/15 text-amber-600"
                          )}>
                            {t.approved ? "Approved" : "Pending"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{"⭐".repeat(t.rating)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{t.role}{t.company ? ` · ${t.company}` : ""}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{t.email}</p>
                      </div>
                      {!t.approved && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => approveTestimonial(t.id)} className="rounded-full bg-green-500 text-white hover:bg-green-600">
                            <Check className="h-3.5 w-3.5" />
                            <span className="ml-1 hidden sm:inline">Approve</span>
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteTestimonial(t.id)} className="rounded-full border-red-500/30 text-red-600 hover:bg-red-500/5">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 rounded-lg bg-muted/30 p-3 text-sm">&ldquo;{t.message}&rdquo;</p>
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      Submitted {new Date(t.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Subscribers */}
          <TabsContent value="subscribers" className="mt-6">
            <SubscriberList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-sky-500/15 bg-card p-5 shadow-soft">
      <div className={cn("mb-2 flex items-center gap-2", color)}>
        <Icon className="h-5 w-5" />
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-3xl font-bold text-gradient-sky-pink">{value.toLocaleString()}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function SubscriberList() {
  const [subscribers, setSubscribers] = useState<{ id: string; email: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/subscribers", {
      headers: { Authorization: `Bearer ${ADMIN_KEY_DEFAULT}` },
    })
      .then((r) => r.json())
      .then((data) => setSubscribers(data.subscribers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyEmails = () => {
    const emails = subscribers.map((s) => s.email).join("\n");
    navigator.clipboard.writeText(emails);
    toast.success(`Copied ${subscribers.length} email addresses`);
  };

  if (loading) return <div className="text-center text-muted-foreground">Loading subscribers...</div>;

  return (
    <div className="rounded-2xl border border-sky-500/15 bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <Mail className="h-4 w-4 text-sky-500" />
          Newsletter Subscribers ({subscribers.length})
        </h3>
        {subscribers.length > 0 && (
          <Button size="sm" variant="outline" onClick={copyEmails} className="rounded-full">
            Copy all emails
          </Button>
        )}
      </div>
      {subscribers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No subscribers yet</p>
      ) : (
        <div className="space-y-2">
          {subscribers.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border border-sky-500/10 bg-muted/20 p-3 text-sm">
              <span className="font-medium">{s.email}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(s.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
