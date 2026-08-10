"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Lock,
  Mail,
  KeyRound,
  Trash2,
  Check,
  Calendar,
  MessageSquare,
  Mail as MailIcon,
  Activity,
  RefreshCw,
  ExternalLink,
  Save,
  Edit3,
  TrendingUp,
  Users,
  Star,
  PieChart,
  BarChart3,
  Database,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TOKEN_STORAGE = "ya-admin-token";

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

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

interface Analytics {
  visits7d: { date: string; label: string; count: number }[];
  visits30d: { date: string; count: number }[];
  bookings7d: { date: string; label: string; count: number }[];
  sections: { section: string; count: number }[];
  bookingPurposes: { purpose: string; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
  totals: { visits: number; bookings: number; testimonials: number; pendingBookings: number };
}

interface ContentMap {
  [key: string]: { value: string; category: string };
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_STORAGE);
    // A valid token is a signed JWT: header.payload.signature
    if (stored && stored.split(".").length === 3) {
      setToken(stored);
      setAuthed(true);
    }
  }, []);

  const authenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid credentials");
      localStorage.setItem(TOKEN_STORAGE, data.token);
      setToken(data.token);
      setAuthed(true);
      toast.success("Welcome back, Yaseen! 🎉");
    } catch (err: any) {
      toast.error("Login failed", { description: err?.message });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE);
    setAuthed(false);
    setToken("");
    setEmail("");
    setPassword("");
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
              Sign in with your admin credentials to manage your website.
            </p>
          </div>
          <form onSubmit={authenticate} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-xl pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl pl-9"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 text-white"
            >
              {loading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Shield className="mr-2 h-4 w-4" />
              )}
              Sign In
            </Button>
          </form>
          <div className="mt-6 text-center">
            <a href="/" className="text-xs text-muted-foreground hover:text-sky-600">
              ← Back to portfolio
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return <AdminDashboard token={token} onLogout={logout} />;
}

function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [content, setContent] = useState<ContentMap>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingRes, testRes, subRes, analyticsRes, contentRes] = await Promise.all([
        fetch("/api/booking", { headers: authHeaders }),
        fetch("/api/admin/testimonials", { headers: authHeaders }),
        fetch("/api/admin/subscribers", { headers: authHeaders }),
        fetch("/api/admin/analytics", { headers: authHeaders }),
        fetch("/api/admin/content"),
      ]);
      const bookingData = await bookingRes.json();
      const testData = await testRes.json();
      const subData = await subRes.json();
      const analyticsData = await analyticsRes.json();
      const contentData = await contentRes.json();
      setBookings(bookingData.bookings || []);
      setTestimonials(testData.testimonials || []);
      setSubscribers(subData.subscribers || []);
      setAnalytics(analyticsData);
      setContent(contentData.contents || {});
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

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
      await fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ id, action: "delete" }),
      });
      toast.success("Testimonial deleted");
      loadAll();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50/50 to-pink-50/50 dark:from-slate-950 dark:to-rose-950/30">
      <header className="sticky top-0 z-30 border-b border-sky-500/15 bg-card/80 backdrop-blur">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-pink-500">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold sm:text-lg">Admin Dashboard</h1>
              <p className="text-[11px] text-muted-foreground">Yaseen Ahmad</p>
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
          <TabsList className="grid w-full grid-cols-2 rounded-full bg-muted p-1 sm:grid-cols-5">
            <TabsTrigger value="analytics" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <BarChart3 className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Edit3 className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Calendar className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
              {analytics?.totals.pendingBookings ? (
                <Badge className="ml-1 bg-pink-500 text-white">{analytics.totals.pendingBookings}</Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <MessageSquare className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <MailIcon className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Emails</span>
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            {analytics ? (
              <AnalyticsView analytics={analytics} subscriberCount={subscribers.length} />
            ) : (
              <div className="text-center text-muted-foreground">Loading analytics...</div>
            )}
          </TabsContent>

          {/* Content Editor Tab */}
          <TabsContent value="content" className="mt-6">
            <ContentEditor content={content} setContent={setContent} authHeaders={authHeaders} />
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="mt-6">
            <BookingsView bookings={bookings} />
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials" className="mt-6">
            <TestimonialsView
              testimonials={testimonials}
              onApprove={approveTestimonial}
              onDelete={deleteTestimonial}
            />
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="mt-6">
            <SubscribersView subscribers={subscribers} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ===== Analytics View with Charts =====
function AnalyticsView({ analytics, subscriberCount }: { analytics: Analytics; subscriberCount: number }) {
  const maxVisits7 = Math.max(...analytics.visits7d.map((d) => d.count), 1);
  const maxBookings7 = Math.max(...analytics.bookings7d.map((d) => d.count), 1);
  const maxSections = Math.max(...analytics.sections.map((s) => s.count), 1);
  const max30 = Math.max(...analytics.visits30d.map((d) => d.count), 1);
  const totalPurposes = analytics.bookingPurposes.reduce((s, p) => s + p.count, 0) || 1;

  const purposeColors = ["#38bdf8", "#ec4899", "#b08968", "#10b981", "#f59e0b", "#8b5cf6"];

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={TrendingUp} label="Total Visits (30d)" value={analytics.totals.visits} color="text-sky-500" />
        <KpiCard icon={Calendar} label="Total Bookings" value={analytics.totals.bookings} color="text-pink-500" sub={`${analytics.totals.pendingBookings} pending`} />
        <KpiCard icon={MessageSquare} label="Testimonials" value={analytics.totals.testimonials} color="text-wood" />
        <KpiCard icon={Users} label="Subscribers" value={subscriberCount} color="text-green-500" />
      </div>

      {/* Visits last 7 days - bar chart */}
      <div className="rounded-2xl border border-sky-500/15 bg-card p-5 shadow-soft">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <BarChart3 className="h-4 w-4 text-sky-500" />
          Visits — Last 7 Days
        </h3>
        <div className="flex h-40 items-end justify-between gap-2">
          {analytics.visits7d.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end justify-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.count / maxVisits7) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-sky-500 to-pink-400"
                  title={`${d.count} visits`}
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">{d.label}</span>
              <span className="text-[11px] font-bold text-foreground">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Visits last 30 days - line/area chart */}
        <div className="rounded-2xl border border-sky-500/15 bg-card p-5 shadow-soft">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-pink-500" />
            Visits — Last 30 Days
          </h3>
          <div className="flex h-32 items-end gap-0.5">
            {analytics.visits30d.map((d, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(d.count / max30) * 100}%` }}
                transition={{ duration: 0.4, delay: i * 0.02 }}
                className="flex-1 rounded-t bg-gradient-to-t from-sky-400/60 to-pink-400/60"
                style={{ minHeight: d.count > 0 ? "4px" : "2px" }}
                title={`${d.date}: ${d.count}`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Booking purposes - pie/donut */}
        <div className="rounded-2xl border border-sky-500/15 bg-card p-5 shadow-soft">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <PieChart className="h-4 w-4 text-wood" />
            Booking Purposes
          </h3>
          {analytics.bookingPurposes.length > 0 ? (
            <div className="space-y-3">
              {analytics.bookingPurposes.map((p, i) => {
                const pct = (p.count / totalPurposes) * 100;
                return (
                  <div key={p.purpose}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: purposeColors[i % purposeColors.length] }} />
                        {p.purpose}
                      </span>
                      <span className="font-bold">{p.count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: purposeColors[i % purposeColors.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No bookings yet</p>
          )}
        </div>
      </div>

      {/* Top sections + rating distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-sky-500/15 bg-card p-5 shadow-soft">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <Activity className="h-4 w-4 text-sky-500" />
            Top Viewed Sections
          </h3>
          {analytics.sections.length > 0 ? (
            <div className="space-y-2">
              {analytics.sections.slice(0, 8).map((s) => (
                <div key={s.section} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs font-medium capitalize">{s.section}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-pink-400" style={{ width: `${(s.count / maxSections) * 100}%` }} />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs font-mono font-bold">{s.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data yet</p>
          )}
        </div>

        <div className="rounded-2xl border border-sky-500/15 bg-card p-5 shadow-soft">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <Star className="h-4 w-4 text-amber-500" />
            Testimonial Ratings
          </h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((r) => {
              const data = analytics.ratingDistribution.find((d) => d.rating === r);
              const count = data?.count || 0;
              const max = Math.max(...analytics.ratingDistribution.map((d) => d.count), 1);
              return (
                <div key={r} className="flex items-center gap-3">
                  <span className="flex w-16 shrink-0 items-center gap-0.5 text-xs">
                    {r}<Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-sky-500/15 bg-card p-5 shadow-soft">
      <div className={cn("mb-2 flex items-center gap-2", color)}>
        <Icon className="h-5 w-5" />
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-3xl font-bold text-gradient-sky-pink">{value.toLocaleString()}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

// ===== Content Editor =====
function ContentEditor({
  content,
  setContent,
  authHeaders,
}: {
  content: ContentMap;
  setContent: (c: ContentMap) => void;
  authHeaders: Record<string, string>;
}) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [saving, setSaving] = useState<string | null>(null);

  const editableFields = [
    { key: "hero_name", label: "Hero Name", category: "hero", type: "text" },
    { key: "hero_tagline", label: "Hero Tagline", category: "hero", type: "text" },
    { key: "hero_status", label: "Availability Status", category: "hero", type: "text" },
    { key: "about_text", label: "About Text", category: "about", type: "textarea" },
    { key: "contact_email", label: "Contact Email", category: "contact", type: "text" },
    { key: "contact_phone", label: "Contact Phone", category: "contact", type: "text" },
    { key: "footer_text", label: "Footer Text", category: "footer", type: "text" },
  ];

  const save = async (key: string, value: string, category: string) => {
    setSaving(key);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ key, value, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setContent({ ...content, [key]: { value, category } });
      toast.success(`Saved "${key}"`);
    } catch (err: any) {
      toast.error("Save failed", { description: err?.message });
    } finally {
      setSaving(null);
    }
  };

  const addNew = async () => {
    if (!newKey || !newValue) {
      toast.error("Key and value are required");
      return;
    }
    await save(newKey, newValue, newCategory);
    setNewKey("");
    setNewValue("");
  };

  const remove = async (key: string) => {
    if (!confirm(`Delete "${key}"?`)) return;
    try {
      await fetch(`/api/admin/content?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const next = { ...content };
      delete next[key];
      setContent(next);
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Predefined editable fields */}
      <div className="rounded-2xl border border-sky-500/15 bg-card p-5 shadow-soft">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <Edit3 className="h-4 w-4 text-sky-500" />
          Edit Website Content
        </h3>
        <div className="space-y-4">
          {editableFields.map((field) => (
            <EditableField
              key={field.key}
              field={field}
              initialValue={content[field.key]?.value || ""}
              saving={saving === field.key}
              onSave={(val) => save(field.key, val, field.category)}
            />
          ))}
        </div>
      </div>

      {/* Add new content */}
      <div className="rounded-2xl border border-sky-500/15 bg-card p-5 shadow-soft">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <Plus className="h-4 w-4 text-pink-500" />
          Add Custom Content
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="key (e.g. hero_subtitle)" />
          <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="category" />
          <Button onClick={addNew} className="rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 text-white">
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
        <Textarea
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Value..."
          className="mt-3 resize-none"
          rows={2}
        />
      </div>

      {/* All custom content list */}
      <div className="rounded-2xl border border-sky-500/15 bg-card p-5 shadow-soft">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <Database className="h-4 w-4 text-wood" />
          All Content ({Object.keys(content).length})
        </h3>
        {Object.keys(content).length === 0 ? (
          <p className="text-sm text-muted-foreground">No custom content yet. Add some above!</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(content).map(([key, data]) => (
              <div key={key} className="flex items-start justify-between gap-3 rounded-lg border border-sky-500/10 bg-muted/20 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-600">{key}</span>
                    <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[9px]">{data.category}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{data.value}</p>
                </div>
                <button
                  onClick={() => remove(key)}
                  className="shrink-0 rounded-md p-1 text-red-500 transition-colors hover:bg-red-500/10"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Editable Field =====
function EditableField({
  field,
  initialValue,
  saving,
  onSave,
}: {
  field: { key: string; label: string; category: string; type: string };
  initialValue: string;
  saving: boolean;
  onSave: (val: string) => void;
}) {
  const [val, setVal] = useState(initialValue);
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">
        {field.label} <span className="text-muted-foreground">({field.key})</span>
      </Label>
      <div className="flex gap-2">
        {field.type === "textarea" ? (
          <Textarea
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="flex-1 resize-none"
            rows={3}
          />
        ) : (
          <Input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="flex-1"
          />
        )}
        <Button
          size="sm"
          onClick={() => onSave(val)}
          disabled={saving}
          className="shrink-0 rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 text-white"
        >
          {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}

// ===== Bookings View =====
function BookingsView({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-sky-500/15 bg-card p-12 text-center text-muted-foreground">
        <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
        No bookings yet
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {bookings.map((b) => (
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
      ))}
    </div>
  );
}

// ===== Testimonials View =====
function TestimonialsView({
  testimonials,
  onApprove,
  onDelete,
}: {
  testimonials: Testimonial[];
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (testimonials.length === 0) {
    return (
      <div className="rounded-2xl border border-sky-500/15 bg-card p-12 text-center text-muted-foreground">
        <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
        No testimonials yet
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {testimonials.map((t) => (
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
                <Button size="sm" onClick={() => onApprove(t.id)} className="rounded-full bg-green-500 text-white hover:bg-green-600">
                  <Check className="h-3.5 w-3.5" />
                  <span className="ml-1 hidden sm:inline">Approve</span>
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(t.id)} className="rounded-full border-red-500/30 text-red-600 hover:bg-red-500/5">
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
      ))}
    </div>
  );
}

// ===== Subscribers View =====
function SubscribersView({ subscribers }: { subscribers: Subscriber[] }) {
  const copyEmails = () => {
    const emails = subscribers.map((s) => s.email).join("\n");
    navigator.clipboard.writeText(emails);
    toast.success(`Copied ${subscribers.length} email addresses`);
  };

  return (
    <div className="rounded-2xl border border-sky-500/15 bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <MailIcon className="h-4 w-4 text-sky-500" />
          Newsletter Subscribers ({subscribers.length})
        </h3>
        {subscribers.length > 0 && (
          <Button size="sm" variant="outline" onClick={copyEmails} className="rounded-full">
            Copy all
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
