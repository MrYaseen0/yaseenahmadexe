"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
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
  RefreshCw,
  ExternalLink,
  Save,
  Edit3,
  BarChart3,
  Eye,
  History,
  RotateCcw,
  Search,
  FileJson,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TrafficDashboard } from "@/components/admin/traffic-dashboard";
import { SecurityDashboard } from "@/components/admin/security-dashboard";
import {
  CONTENT_FIELDS,
  CONTENT_DEFAULTS,
  CONTENT_CATEGORIES,
  validateJsonField,
} from "@/lib/content-fields";

const TOKEN_STORAGE = "ya-admin-token";

function errMsg(e: unknown): string {
  return e instanceof Error && e.message ? e.message : "Action failed";
}

// Returns the stored admin token if it looks like a signed JWT
// (header.payload.signature), otherwise "". Safe to call during SSR.
function readStoredToken(): string {
  if (typeof window === "undefined") return "";
  const stored = window.localStorage.getItem(TOKEN_STORAGE);
  return stored && stored.split(".").length === 3 ? stored : "";
}

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

interface ContentMap {
  [key: string]: { value: string; category: string };
}

export default function AdminPage() {
  // A valid token is a signed JWT: header.payload.signature.
  // Restored via lazy state initializers (read once) instead of a mount
  // effect that sets state synchronously.
  const [token, setToken] = useState<string>(() => readStoredToken());
  const [authed, setAuthed] = useState<boolean>(() => readStoredToken() !== "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const authenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Invalid credentials");
      localStorage.setItem(TOKEN_STORAGE, data.token ?? "");
      setToken(data.token ?? "");
      setAuthed(true);
      toast.success("Welcome back, Yaseen!");
    } catch (err: unknown) {
      toast.error("Login failed", { description: errMsg(err) });
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
      <div className="flex min-h-screen items-center justify-center bg-[#FBFBF9] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-[--hairline] bg-white p-8 shadow-[0_8px_24px_rgba(16,20,16,0.06)]"
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#101410]">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#101410]">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-[#5F665F]">
              Sign in with your admin credentials to manage your website.
            </p>
          </div>
          <form onSubmit={authenticate} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F665F]" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-lg border-[--hairline] pl-9 focus-visible:border-[#101410]"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F665F]" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-lg border-[--hairline] pl-9 focus-visible:border-[#101410]"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#101410] text-white hover:bg-black"
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
            <a href="/" className="text-xs text-[#5F665F] hover:text-[#166534]">
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

  // Memoized: children use this as an effect dependency, so a stable
  // identity prevents refetch loops on every parent render.
  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  // Pure fetch: no setState inside, so effects can await it without
  // synchronously triggering renders.
  const fetchAllData = useCallback(async () => {
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
    return {
      bookings: bookingData.bookings || [],
      testimonials: testData.testimonials || [],
      subscribers: subData.subscribers || [],
      analytics: analyticsData,
      content: contentData.contents || {},
    };
  }, [token]);

  const applyAllData = useCallback(
    (d: Awaited<ReturnType<typeof fetchAllData>>) => {
      setBookings(d.bookings);
      setTestimonials(d.testimonials);
      setSubscribers(d.subscribers);
      setAnalytics(d.analytics);
      setContent(d.content);
    },
    []
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      applyAllData(await fetchAllData());
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [fetchAllData, applyAllData]);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const d = await fetchAllData();
        if (!dead) applyAllData(d);
      } catch {
        if (!dead) toast.error("Failed to load data");
      }
    })();
    return () => {
      dead = true;
    };
  }, [fetchAllData, applyAllData]);

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
    <div className="min-h-screen bg-[#FBFBF9]">
      <header className="sticky top-0 z-30 border-b border-[--hairline] bg-white">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#101410]">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#101410] sm:text-lg">Admin Dashboard</h1>
              <p className="text-[11px] text-[#5F665F]">Yaseen Ahmad</p>
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
            <Button variant="outline" size="sm" onClick={onLogout} className="rounded-full border-[--hairline] hover:border-[#101410]">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 rounded-full border border-[--hairline] bg-white p-1 sm:grid-cols-8">
            <TabsTrigger value="analytics" className="rounded-full data-[state=active]:bg-[#101410] data-[state=active]:text-white">
              <BarChart3 className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-full data-[state=active]:bg-[#101410] data-[state=active]:text-white">
              <Edit3 className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="visual" className="rounded-full data-[state=active]:bg-[#101410] data-[state=active]:text-white">
              <Eye className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Visual</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-full data-[state=active]:bg-[#101410] data-[state=active]:text-white">
              <Calendar className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
              {analytics?.totals.pendingBookings ? (
                <Badge className="ml-1 rounded-full bg-[#166534] text-white">{analytics.totals.pendingBookings}</Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="rounded-full data-[state=active]:bg-[#101410] data-[state=active]:text-white">
              <MessageSquare className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="rounded-full data-[state=active]:bg-[#101410] data-[state=active]:text-white">
              <MailIcon className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Emails</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="rounded-full data-[state=active]:bg-[#101410] data-[state=active]:text-white">
              <History className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Audit Log</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-full data-[state=active]:bg-[#101410] data-[state=active]:text-white">
              <Shield className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            {analytics ? (
              <TrafficDashboard analytics={analytics} />
            ) : (
              <div className="space-y-4" aria-label="Loading analytics">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#F4F5F1]" />
                  ))}
                </div>
                <div className="h-64 animate-pulse rounded-2xl bg-[#F4F5F1]" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {[0, 1].map((i) => (
                    <div key={i} className="h-48 animate-pulse rounded-2xl bg-[#F4F5F1]" />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Content Editor Tab */}
          <TabsContent value="content" className="mt-6">
            <ContentEditor content={content} setContent={setContent} authHeaders={authHeaders} />
          </TabsContent>

          {/* Visual Editor Tab — the public page with inline pencils */}
          <TabsContent value="visual" className="mt-6">
            <VisualEditorView />
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="mt-6">
            <BookingsView
              bookings={bookings}
              authHeaders={authHeaders}
              onChanged={loadAll}
            />
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

          {/* Audit Log Tab — every content change, who / when / what */}
          <TabsContent value="audit" className="mt-6">
            <AuditLogView authHeaders={authHeaders} />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <SecurityDashboard authHeaders={authHeaders} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ===== Content Editor (registry-driven) =====
// Every registered field (see src/lib/content-fields.ts) is listed here,
// grouped by category, with its registry default. Keys that have a saved
// database override show the override plus a "Customized" badge and a
// reset button (restores the default by deleting the override).
function ContentEditor({
  content,
  setContent,
  authHeaders,
}: {
  content: ContentMap;
  setContent: (c: ContentMap) => void;
  authHeaders: Record<string, string>;
}) {
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const fields = CONTENT_FIELDS.filter(
    (f) =>
      !q ||
      f.key.toLowerCase().includes(q) ||
      f.label.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
  );

  const groups = CONTENT_CATEGORIES.map((c) => ({
    ...c,
    fields: fields.filter((f) => f.category === c.id),
  })).filter((g) => g.fields.length > 0);

  const save = async (key: string, value: string, category: string) => {
    setSaving(key);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ key, value, category }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error);
      setContent({ ...content, [key]: { value, category } });
      toast.success(`Saved "${key}"`);
    } catch (err: unknown) {
      toast.error("Save failed", { description: errMsg(err) });
    } finally {
      setSaving(null);
    }
  };

  const reset = async (key: string) => {
    // No native confirm() here on purpose: headless/automated browsers dismiss
    // it silently, which made the button look dead. Confirmation is a two-step
    // inline button in RegistryField instead.
    setSaving(key);
    try {
      const res = await fetch(
        `/api/admin/content?key=${encodeURIComponent(key)}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || `Reset failed (${res.status})`);
      const next = { ...content };
      delete next[key];
      setContent(next);
      toast.success(`"${key}" reset to default`);
    } catch (err: unknown) {
      toast.error("Reset failed", { description: errMsg(err) });
    } finally {
      setSaving(null);
    }
  };

  const customizedCount = CONTENT_FIELDS.filter((f) => content[f.key]).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-[#5F665F]">
          <Edit3 className="h-4 w-4 text-[#166534]" />
          {CONTENT_FIELDS.length} editable fields · {customizedCount} customized
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F665F]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fields..."
            className="rounded-full border-[--hairline] bg-white pl-9 focus-visible:border-[#101410]"
          />
        </div>
      </div>

      {groups.map((g) => (
        <div
          key={g.id}
          className="rounded-2xl border border-[--hairline] bg-white p-5 shadow-[0_8px_24px_rgba(16,20,16,0.06)]"
        >
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#5F665F]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#101410] text-[10px] font-bold text-white">
              {g.fields.length}
            </span>
            {g.label}
          </h3>
          <div className="space-y-5">
            {g.fields.map((f) => {
              const override = content[f.key];
              const current = override?.value ?? CONTENT_DEFAULTS[f.key] ?? "";
              return (
                <RegistryField
                  key={f.key}
                  fieldKey={f.key}
                  label={f.label}
                  category={f.category}
                  json={f.json}
                  multiline={f.multiline}
                  defaultValue={CONTENT_DEFAULTS[f.key] ?? ""}
                  value={current}
                  customized={!!override}
                  saving={saving === f.key}
                  onSave={(val) => save(f.key, val, f.category)}
                  onReset={() => reset(f.key)}
                />
              );
            })}
          </div>
        </div>
      ))}

      {groups.length === 0 && (
        <div className="rounded-2xl border border-[--hairline] bg-white p-12 text-center text-[#5F665F]">
          No fields match &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}

// ===== Registry Field (single row: default + override aware) =====
function RegistryField({
  fieldKey,
  label,
  category,
  json,
  multiline,
  defaultValue,
  value,
  customized,
  saving,
  onSave,
  onReset,
}: {
  fieldKey: string;
  label: string;
  category: string;
  json?: boolean;
  multiline?: boolean;
  defaultValue: string;
  value: string;
  customized: boolean;
  saving: boolean;
  onSave: (val: string) => void;
  onReset: () => void;
}) {
  const [val, setVal] = useState(value);
  const [showDefault, setShowDefault] = useState(false);
  const [jsonError, setJsonError] = useState("");
  // Two-step inline reset confirmation (no native confirm() — headless
  // browsers auto-dismiss it, which made the button look dead).
  const [confirmReset, setConfirmReset] = useState(false);
  useEffect(() => {
    if (!confirmReset) return;
    const t = setTimeout(() => setConfirmReset(false), 5000);
    return () => clearTimeout(t);
  }, [confirmReset]);
  const trySave = () => {
    if (json) {
      const check = validateJsonField(fieldKey, val);
      if (!check.ok) {
        setJsonError(check.error);
        return;
      }
      setJsonError("");
      onSave(check.normalized);
      return;
    }
    setJsonError("");
    onSave(val);
  };
  // keep the input in sync when the saved value changes elsewhere
  // (render-phase adjustment: the React-endorsed alternative to setState-in-effect)
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setVal(value);
  }

  const long = json || multiline || val.length > 90 || val.includes("\n");
  // Dirty tracking: highlight when the draft differs from the saved value,
  // so unsaved edits are impossible to miss.
  const dirty = val !== value;

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <Label className="text-xs font-semibold text-[#101410]">
          {label} <span className="font-mono text-[#5F665F]">({fieldKey})</span>
        </Label>
        {dirty && (
          <Badge className="rounded-full bg-amber-500/15 px-2 py-0 text-[9px] font-semibold text-amber-600">
            ● Unsaved
          </Badge>
        )}
        {customized ? (
          <Badge className="rounded-full bg-[#EAF3EC] px-2 py-0 text-[9px] font-semibold text-[#166534]">
            Customized
          </Badge>
        ) : (
          <Badge variant="secondary" className="rounded-full bg-[#F4F5F1] px-2 py-0 text-[9px] text-[#5F665F]">
            Default
          </Badge>
        )}
        <button
          onClick={() => setShowDefault((v) => !v)}
          className="text-[11px] text-[#166534] underline-offset-2 hover:underline"
        >
          {showDefault ? "Hide default" : "Show default"}
        </button>
        {customized && (
          <button
            onClick={() => {
              if (confirmReset) {
                setConfirmReset(false);
                onReset();
              } else {
                setConfirmReset(true);
              }
            }}
            className={
              confirmReset
                ? "ml-auto flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-semibold text-red-600"
                : "ml-auto flex items-center gap-1 text-[11px] text-[#5F665F] hover:text-red-500"
            }
          >
            <RotateCcw className="h-3 w-3" />{" "}
            {confirmReset ? "Click again to confirm reset" : "Reset to default"}
          </button>
        )}
      </div>
      {showDefault && (
        <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-[#F4F5F1] p-2 font-mono text-[11px] text-[#5F665F]">
          {defaultValue}
        </pre>
      )}
      <div className="flex gap-2">
        {long ? (
          <Textarea
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className={cn("flex-1 rounded-lg border-[--hairline] font-mono text-xs focus-visible:border-[#101410]", dirty && "border-amber-400 ring-1 ring-amber-400/40")}
            rows={json ? 6 : 3}
            spellCheck={false}
          />
        ) : (
          <Input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className={cn("flex-1 rounded-lg border-[--hairline] focus-visible:border-[#101410]", dirty && "border-amber-400 ring-1 ring-amber-400/40")}
          />
        )}
        <Button
          size="sm"
          onClick={trySave}
          disabled={saving || !dirty}
          title={dirty ? "Save this field" : "No changes to save"}
          className={cn(
            "shrink-0 rounded-full text-white",
            dirty
              ? "bg-[#166534] hover:bg-[#0f4a26]"
              : "bg-[#101410] opacity-60 hover:opacity-80"
          )}
        >
          {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        </Button>
      </div>
      {jsonError && (
        <p className="text-xs font-medium text-red-500">{jsonError}</p>
      )}
    </div>
  );
}

// ===== Visual Editor =====
// Opens the public portfolio itself in edit mode (?edit=1). The page reads
// the same admin token from localStorage, so no second login is needed.
function VisualEditorView() {
  const [embedded, setEmbedded] = useState(false);
  const openVisual = () => {
    window.open("/?edit=1", "_blank", "noopener");
  };
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[--hairline] bg-white p-6 shadow-[0_8px_24px_rgba(16,20,16,0.06)] sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#101410]">
            <Pencil className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#101410]">Visual Editor</h3>
            <p className="mt-1 text-sm text-[#5F665F]">
              Edit the portfolio exactly as visitors see it. Open the live page
              in edit mode — every headline, button, card, label, and list shows
              a <Pencil className="inline h-3 w-3" /> pencil. Changes save
              instantly to the live site and every change is recorded in the
              Audit Log with your account and IP.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={openVisual}
            className="rounded-full bg-[#101410] text-white hover:bg-black"
          >
            <Eye className="mr-2 h-4 w-4" /> Open Visual Editor
          </Button>
          <Button
            variant="outline"
            onClick={() => setEmbedded((v) => !v)}
            className="rounded-full border-[--hairline] hover:border-[#101410]"
          >
            <FileJson className="mr-2 h-4 w-4" />
            {embedded ? "Hide embedded preview" : "Embed preview here"}
          </Button>
        </div>
        <ul className="mt-6 list-disc space-y-1 pl-5 text-xs text-[#5F665F]">
          <li>Edit mode only activates with a valid admin session — visitors never see pencils.</li>
          <li>Text fields open a quick dialog; lists (navigation, services, FAQs, plans…) open a JSON editor.</li>
          <li>To undo a change, edit the field back or reset it to its default in the Content tab.</li>
        </ul>
      </div>

      {embedded && (
        <div className="overflow-hidden rounded-2xl border border-[--hairline] shadow-[0_8px_24px_rgba(16,20,16,0.06)]">
          <div className="flex items-center justify-between border-b border-[--hairline] bg-[#F4F5F1] px-4 py-2">
            <span className="font-mono text-xs text-[#5F665F]">/?edit=1</span>
            <Button size="sm" variant="ghost" onClick={openVisual} className="h-7 text-xs">
              Open in new tab <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <iframe
            src="/?edit=1"
            title="Visual editor preview"
            className="h-[80vh] w-full bg-white"
          />
        </div>
      )}
    </div>
  );
}

// ===== Audit Log =====
// Shows CONTENT_EDIT security events: when, who (admin email), source IP,
// action, content key, and previous → new value. Kept separate from the
// Security tab's attack feed.
interface ParsedAudit {
  id: string;
  createdAt: string;
  ip: string;
  actor: string;
  action: string;
  key: string;
  oldValue: string | null;
  newValue: string | null;
  summary: string;
}

function AuditLogView({ authHeaders }: { authHeaders: Record<string, string> }) {
  const [entries, setEntries] = useState<ParsedAudit[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (cursor?: string | null) => {
      const params = new URLSearchParams({ limit: "50" });
      if (appliedQuery) params.set("search", appliedQuery);
      if (actionFilter) params.set("action", actionFilter);
      if (cursor) params.set("cursor", cursor);
      const res = await fetch(`/api/admin/audit?${params.toString()}`, {
        headers: authHeaders,
      });
      const data = await res.json();
      const page: ParsedAudit[] = (data.entries || []).map((e: ParsedAudit) => ({
        ...e,
        oldValue: e.oldValue == null ? null : String(e.oldValue),
        newValue: e.newValue == null ? null : String(e.newValue),
      }));
      return { page, nextCursor: (data.nextCursor as string | null) || null };
    },
    [authHeaders, appliedQuery, actionFilter]
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
        toast.error("Failed to load audit log");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [fetchPage]
  );

  // Initial fetch. All state updates happen after `await`, never
  // synchronously inside the effect. Cancelled on unmount / refetch.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { page, nextCursor } = await fetchPage(null);
        if (cancelled) return;
        setEntries(page);
        setNextCursor(nextCursor);
      } catch {
        if (!cancelled) toast.error("Failed to load audit log");
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
        <div className="flex items-center gap-2 text-sm text-[#5F665F]">
          <History className="h-4 w-4 text-[#166534]" />
          {entries.length} recorded content change{entries.length === 1 ? "" : "s"}
          {nextCursor && " — more available"}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F665F]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Search by key, editor, IP..."
              className="rounded-full border-[--hairline] bg-white pl-9 focus-visible:border-[#101410]"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setNextCursor(null);
            }}
            className="rounded-full border border-[--hairline] bg-white px-3 py-2 text-sm text-[#101410]"
            aria-label="Filter by action"
          >
            <option value="">All actions</option>
            <option value="updated">Updated</option>
            <option value="created">Created</option>
            <option value="deleted">Deleted (reset to default)</option>
          </select>
          <Button variant="outline" size="sm" onClick={applyFilters} className="rounded-full border-[--hairline] hover:border-[#101410]">
            Apply
          </Button>
          <Button variant="outline" size="sm" onClick={() => load()} className="rounded-full border-[--hairline] hover:border-[#101410]">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2" aria-label="Loading audit log">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-[#F4F5F1]" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-[--hairline] bg-white p-12 text-center text-[#5F665F]">
          <History className="mx-auto mb-3 h-10 w-10 text-[#5F665F]/40" />
          {appliedQuery || actionFilter
            ? "No entries match your filters."
            : "No content changes recorded yet. Edits made through the Visual Editor or Content tab appear here."}
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
              });
              return (
                <div
                  key={e.id}
                  className="rounded-xl border border-[--hairline] bg-white p-4 shadow-[0_8px_24px_rgba(16,20,16,0.06)]"
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : e.id)}
                    className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 text-left"
                  >
                    <Badge
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        e.action === "deleted"
                          ? "bg-red-500/15 text-red-600"
                          : e.action === "created"
                            ? "bg-[#EAF3EC] text-[#166534]"
                            : "bg-[#F4F5F1] text-[#101410]"
                      )}
                    >
                      {e.action === "deleted" ? "reset to default" : e.action}
                    </Badge>
                    <span className="font-mono text-xs font-bold text-[#101410]">{e.key}</span>
                    <span className="text-xs text-[#5F665F]">{e.actor}</span>
                    <span className="ml-auto text-xs text-[#5F665F]">{when} PKT</span>
                  </button>
                  {isOpen && (
                    <div className="mt-3 space-y-2 border-t border-[--hairline] pt-3 text-xs">
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-[#5F665F]">
                        <span>IP: <span className="font-mono text-[#101410]">{e.ip}</span></span>
                        <span>Editor: <span className="font-medium text-[#101410]">{e.actor}</span></span>
                      </div>
                      {e.summary && <p className="text-[#5F665F]">{e.summary}</p>}
                      {e.oldValue !== null && (
                        <div>
                          <div className="mb-1 font-semibold text-[#5F665F]">Previous value</div>
                          <pre className="max-h-24 overflow-auto whitespace-pre-wrap rounded-lg bg-red-500/5 p-2 font-mono text-[11px] text-[#101410]/80">
                            {e.oldValue}
                          </pre>
                        </div>
                      )}
                      {e.newValue !== null && (
                        <div>
                          <div className="mb-1 font-semibold text-[#5F665F]">New value</div>
                          <pre className="max-h-24 overflow-auto whitespace-pre-wrap rounded-lg bg-[#EAF3EC]/50 p-2 font-mono text-[11px] text-[#101410]/80">
                            {e.newValue}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {nextCursor && (
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => load(nextCursor)}
                disabled={loadingMore}
                className="rounded-full border-[--hairline] hover:border-[#101410]"
              >
                {loadingMore ? "Loading..." : "Load older entries"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BookingsView({
  bookings,
  authHeaders,
  onChanged,
}: {
  bookings: Booking[];
  authHeaders: Record<string, string>;
  onChanged: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [acting, setActing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const act = async (id: string, action: "confirm" | "cancel" | "delete") => {
    setActing(id);
    try {
      const res = await fetch("/api/booking", {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ id, action }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Action failed");
      toast.success(
        action === "confirm"
          ? "Booking confirmed"
          : action === "cancel"
            ? "Booking cancelled"
            : "Booking deleted"
      );
      setConfirmDelete(null);
      onChanged();
    } catch (err: unknown) {
      toast.error("Action failed", { description: errMsg(err) });
    } finally {
      setActing(null);
    }
  };

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };
  const shown =
    statusFilter === "all"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  const statusBadge = (status: string) =>
    status === "pending"
      ? "bg-amber-500/15 text-amber-600"
      : status === "confirmed"
        ? "bg-[#EAF3EC] text-[#166534]"
        : status === "cancelled"
          ? "bg-red-500/15 text-red-600"
          : "bg-[#F4F5F1] text-[#5F665F]";

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-[--hairline] bg-white p-12 text-center text-[#5F665F]">
        <Calendar className="mx-auto mb-3 h-10 w-10 text-[#5F665F]/40" />
        No bookings yet
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "confirmed", "cancelled"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
              statusFilter === s
                ? "bg-[#101410] text-white"
                : "bg-white border border-[--hairline] text-[#5F665F] hover:text-[#101410]"
            )}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="rounded-2xl border border-[--hairline] bg-white p-12 text-center text-[#5F665F]">
          No {statusFilter} bookings
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-[--hairline] bg-white p-4 shadow-[0_8px_24px_rgba(16,20,16,0.06)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#101410]">{b.name}</h4>
                    <Badge className={cn("rounded-full px-2 py-0.5 text-[10px] capitalize", statusBadge(b.status))}>
                      {b.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#5F665F]">{b.email}</p>
                </div>
                <div className="text-right text-xs text-[#5F665F]">
                  <div className="font-semibold text-[#101410]">{b.purpose}</div>
                  <div>{b.date} at {b.time}</div>
                  <div>{b.timezone}</div>
                </div>
              </div>
              {b.notes && (
                <p className="mt-2 rounded-lg bg-[#F4F5F1] p-2 text-xs text-[#5F665F]">
                  <strong>Notes:</strong> {b.notes}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[--hairline] pt-3">
                <div className="flex flex-wrap gap-2">
                  {b.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => act(b.id, "confirm")}
                        disabled={acting === b.id}
                        className="rounded-full bg-[#166534] text-white hover:bg-[#0f4a26]"
                      >
                        {acting === b.id ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        <span className="ml-1">Confirm</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => act(b.id, "cancel")}
                        disabled={acting === b.id}
                        className="rounded-full border-amber-500/40 text-amber-600 hover:bg-amber-500/5"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirmDelete === b.id) act(b.id, "delete");
                      else {
                        setConfirmDelete(b.id);
                        setTimeout(() => setConfirmDelete((c) => (c === b.id ? null : c)), 5000);
                      }
                    }}
                    disabled={acting === b.id}
                    className={cn(
                      "rounded-full",
                      confirmDelete === b.id
                        ? "border-red-500 bg-red-500 text-white hover:bg-red-600"
                        : "border-red-500/30 text-red-600 hover:bg-red-500/5"
                    )}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="ml-1">
                      {confirmDelete === b.id ? "Click again to delete" : "Delete"}
                    </span>
                  </Button>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#5F665F]">
                  <span>Submitted {new Date(b.createdAt).toLocaleString()}</span>
                  <a
                    href={`/api/booking/calendar?date=${b.date}&time=${encodeURIComponent(b.time)}&purpose=${encodeURIComponent(b.purpose)}&name=${encodeURIComponent(b.name)}&email=${encodeURIComponent(b.email)}`}
                    download
                    className="text-[#166534] hover:underline"
                  >
                    Download .ics
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
      <div className="rounded-2xl border border-[--hairline] bg-white p-12 text-center text-[#5F665F]">
        <MessageSquare className="mx-auto mb-3 h-10 w-10 text-[#5F665F]/40" />
        No testimonials yet
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {testimonials.map((t) => (
        <div key={t.id} className="rounded-2xl border border-[--hairline] bg-white p-4 shadow-[0_8px_24px_rgba(16,20,16,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-[#101410]">{t.name}</h4>
                <Badge className={cn(
                  "rounded-full px-2 py-0.5 text-[10px]",
                  t.approved ? "bg-[#EAF3EC] text-[#166534]" : "bg-amber-500/15 text-amber-600"
                )}>
                  {t.approved ? "Approved" : "Pending"}
                </Badge>
                <span className="font-mono text-xs text-[#5F665F]">{t.rating}/5</span>
              </div>
              <p className="text-sm text-[#5F665F]">{t.role}{t.company ? ` · ${t.company}` : ""}</p>
              <p className="mt-1 text-xs text-[#5F665F]">{t.email}</p>
            </div>
            {!t.approved && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onApprove(t.id)} className="rounded-full bg-[#166534] text-white hover:bg-[#0f4a26]">
                  <Check className="h-3.5 w-3.5" />
                  <span className="ml-1 hidden sm:inline">Approve</span>
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(t.id)} className="rounded-full border-red-500/30 text-red-600 hover:bg-red-500/5">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
          <p className="mt-2 rounded-lg bg-[#F4F5F1] p-3 text-sm text-[#101410]">&ldquo;{t.message}&rdquo;</p>
          <div className="mt-2 text-[11px] text-[#5F665F]">
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
    <div className="rounded-2xl border border-[--hairline] bg-white p-5 shadow-[0_8px_24px_rgba(16,20,16,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#101410]">
          <MailIcon className="h-4 w-4 text-[#166534]" />
          Newsletter Subscribers ({subscribers.length})
        </h3>
        {subscribers.length > 0 && (
          <Button size="sm" variant="outline" onClick={copyEmails} className="rounded-full border-[--hairline] hover:border-[#101410]">
            Copy all
          </Button>
        )}
      </div>
      {subscribers.length === 0 ? (
        <p className="text-sm text-[#5F665F]">No subscribers yet</p>
      ) : (
        <div className="space-y-2">
          {subscribers.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border border-[--hairline] bg-[#FBFBF9] p-3 text-sm">
              <span className="font-medium text-[#101410]">{s.email}</span>
              <span className="text-xs text-[#5F665F]">
                {new Date(s.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
