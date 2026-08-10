"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  User,
  Mail,
  MessageSquare,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Globe,
  CalendarPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SectionHeading } from "../section-heading";
import { Reveal } from "../reveal";
import { developer } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

const purposes = [
  { id: "consultation", label: "Project Consultation", icon: "💬", desc: "Discuss your project idea" },
  { id: "code-review", label: "Code Review", icon: "🔍", desc: "Get feedback on your codebase" },
  { id: "hiring", label: "Hire Me", icon: "🚀", desc: "Start a development project" },
  { id: "mentorship", label: "Mentorship", icon: "🎓", desc: "Career guidance & advice" },
];

const timeSlots = [
  "10:00 AM", "11:00 AM", "12:00 PM",
  "2:00 PM", "3:00 PM", "4:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM",
];

const purposesMap: Record<string, string> = {
  consultation: "Project Consultation",
  "code-review": "Code Review",
  hiring: "Hire Me",
  mentorship: "Mentorship",
};

export function Booking() {
  const [step, setStep] = useState(1);
  const [purpose, setPurpose] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [form, setForm] = useState({ name: "", email: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  // Generate next 14 days of available dates
  const availableDates = useMemo(() => {
    const dates: { date: Date; iso: string; day: string; weekday: string; disabled: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      // Skip Fridays (getDay() === 5) — weekend in Pakistan
      const disabled = d.getDay() === 5;
      dates.push({
        date: d,
        iso: d.toISOString().split("T")[0],
        day: String(d.getDate()),
        weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
        disabled,
      });
    }
    return dates;
  }, []);

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.email) {
      toast.error("Please enter your name and email.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          purpose: purposesMap[purpose] || purpose,
          date: selectedDate,
          time: selectedTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi",
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setBooked(true);
      toast.success("📅 Booking request submitted!", {
        description: "I'll confirm the time via email within a few hours.",
      });
    } catch (err: any) {
      toast.error("Booking failed", {
        description: err?.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setBooked(false);
    setStep(1);
    setPurpose("");
    setSelectedDate("");
    setSelectedTime("");
    setForm({ name: "", email: "", notes: "" });
  };

  return (
    <section id="booking" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading
          emoji="📅"
          title="Book a"
          highlight="Call"
          subtitle="Skip the back-and-forth emails. Pick a time that works for you and let's talk about your project."
        />

        <Reveal className="mt-12 overflow-hidden rounded-3xl border border-sky-500/20 bg-card shadow-card-hover">
          {/* Status bar */}
          <div className="flex items-center justify-between border-b border-sky-500/10 bg-gradient-to-r from-sky-500/5 to-pink-500/5 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              <span className="text-sm font-semibold text-foreground">
                Available this week
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[
                { n: 1, label: "Purpose" },
                { n: 2, label: "Date & Time" },
                { n: 3, label: "Details" },
              ].map((s, i) => (
                <div key={s.n} className="flex items-center gap-2">
                  {i > 0 && <div className="h-px w-6 bg-sky-500/30" />}
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all",
                      step >= s.n
                        ? "bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-soft"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step > s.n ? <CheckCircle2 className="h-4 w-4" /> : s.n}
                  </div>
                  <span
                    className={cn(
                      "hidden text-xs font-medium sm:block",
                      step >= s.n ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {booked ? (
              <SuccessView
                onReset={reset}
                date={selectedDate}
                time={selectedTime}
                purpose={purpose}
                name={form.name}
                email={form.email}
              />
            ) : step === 1 ? (
              <Step1Purpose
                purpose={purpose}
                setPurpose={(p) => {
                  setPurpose(p);
                  setStep(2);
                }}
              />
            ) : step === 2 ? (
              <Step2DateTime
                availableDates={availableDates}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTime={selectedTime}
                setSelectedTime={(t) => {
                  setSelectedTime(t);
                  setStep(3);
                }}
                onBack={() => setStep(1)}
              />
            ) : (
              <Step3Details
                form={form}
                set={set}
                purpose={purpose}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onBack={() => setStep(2)}
                onSubmit={submit}
                loading={loading}
              />
            )}
          </div>
        </Reveal>

        {/* Trust badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5 text-sky-500" />
            Google Meet / Zoom
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-pink-500" />
            30-45 min sessions
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-wood" />
            All timezones welcome
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            Free consultation
          </span>
        </div>
      </div>
    </section>
  );
}

function Step1Purpose({
  purpose,
  setPurpose,
}: {
  purpose: string;
  setPurpose: (p: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-1 text-lg font-bold">What would you like to discuss?</h3>
      <p className="mb-5 text-sm text-muted-foreground">
        Choose the type of call that fits your needs.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {purposes.map((p) => (
          <button
            key={p.id}
            onClick={() => setPurpose(p.id)}
            className={cn(
              "group flex items-start gap-4 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5",
              purpose === p.id
                ? "border-pink-500/40 bg-gradient-to-br from-sky-500/10 to-pink-500/10 shadow-soft"
                : "border-sky-500/15 hover:border-sky-500/30 hover:bg-muted/30"
            )}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-soft dark:bg-slate-800">
              {p.icon}
            </span>
            <div>
              <div className="font-semibold text-foreground">{p.label}</div>
              <div className="text-xs text-muted-foreground">{p.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2DateTime({
  availableDates,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  onBack,
}: {
  availableDates: { iso: string; day: string; weekday: string; disabled: boolean }[];
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  selectedTime: string;
  setSelectedTime: (t: string) => void;
  onBack: () => void;
}) {
  return (
    <div>
      <h3 className="mb-1 text-lg font-bold">Pick a date & time</h3>
      <p className="mb-5 text-sm text-muted-foreground">
        All times shown in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone}).
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Date picker */}
        <div>
          <Label className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
            <Calendar className="h-3.5 w-3.5 text-sky-500" />
            Select Date
          </Label>
          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-7">
            {availableDates.map((d) => (
              <button
                key={d.iso}
                onClick={() => !d.disabled && setSelectedDate(d.iso)}
                disabled={d.disabled}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl border p-2 transition-all",
                  selectedDate === d.iso
                    ? "border-pink-500/40 bg-gradient-to-br from-sky-500/15 to-pink-500/15 shadow-soft"
                    : d.disabled
                    ? "cursor-not-allowed border-muted/30 bg-muted/20 opacity-40"
                    : "border-sky-500/15 hover:border-sky-500/30 hover:bg-muted/30"
                )}
              >
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {d.weekday}
                </span>
                <span className="text-base font-bold text-foreground">{d.day}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Fridays excluded (weekend in Pakistan). Times in PKT (UTC+5).
          </p>
        </div>

        {/* Time picker */}
        <div>
          <Label className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
            <Clock className="h-3.5 w-3.5 text-pink-500" />
            Select Time
          </Label>
          {selectedDate ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {timeSlots.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    selectedTime === t
                      ? "border-pink-500/40 bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-soft"
                      : "border-sky-500/15 hover:border-sky-500/30 hover:bg-muted/30"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-[120px] items-center justify-center rounded-xl border border-dashed border-sky-500/20 p-4 text-center text-sm text-muted-foreground">
              Select a date first
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={onBack} className="rounded-full">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
}

function Step3Details({
  form,
  set,
  purpose,
  selectedDate,
  selectedTime,
  onBack,
  onSubmit,
  loading,
}: {
  form: { name: string; email: string; notes: string };
  set: (k: "name" | "email" | "notes") => (v: string) => void;
  purpose: string;
  selectedDate: string;
  selectedTime: string;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const dateLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <h3 className="mb-1 text-lg font-bold">Your details</h3>
      <p className="mb-5 text-sm text-muted-foreground">
        Confirm your booking and I&apos;ll send a calendar invite.
      </p>

      {/* Summary card */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-sky-500/20 bg-gradient-to-r from-sky-500/5 to-pink-500/5 p-4">
        <Badge className="rounded-full bg-gradient-to-r from-sky-500 to-pink-500 text-white">
          {purposesMap[purpose] || purpose}
        </Badge>
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Calendar className="h-4 w-4 text-sky-500" />
          {dateLabel}
        </span>
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Clock className="h-4 w-4 text-pink-500" />
          {selectedTime}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              placeholder="Your Name"
              className="rounded-xl pl-9"
            />
          </div>
        </Field>
        <Field label="Email" required>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email")(e.target.value)}
              placeholder="you@example.com"
              className="rounded-xl pl-9"
            />
          </div>
        </Field>
      </div>

      <Field label="Notes (optional)" className="mt-4">
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            value={form.notes}
            onChange={(e) => set("notes")(e.target.value)}
            placeholder="Anything you'd like me to know before the call?"
            className="min-h-[80px] rounded-xl pl-9 resize-none"
          />
        </div>
      </Field>

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={onBack} className="rounded-full">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={loading}
          className="rounded-full bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-soft"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm Booking
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SuccessView({
  onReset,
  date,
  time,
  purpose,
  name,
  email,
}: {
  onReset: () => void;
  date: string;
  time: string;
  purpose: string;
  name: string;
  email: string;
}) {
  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const purposeLabel = purposesMap[purpose] || purpose;
  const calendarUrl = `/api/booking/calendar?${new URLSearchParams({
    date,
    time,
    purpose: purposeLabel,
    name,
    email,
  })}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 py-8 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-foreground">Booking Request Sent! 🎉</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Your <strong>{purposeLabel}</strong> call for{" "}
          <strong>{dateLabel}</strong> at <strong>{time}</strong> has been requested.
          I&apos;ll send a calendar invite to your email within a few hours to confirm.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <a
          href={calendarUrl}
          download
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow-pink"
        >
          <CalendarPlus className="h-4 w-4" />
          Add to Calendar
        </a>
        <Button
          onClick={onReset}
          variant="outline"
          className="rounded-full border-sky-500/30"
        >
          Book another call
        </Button>
      </div>

      <div className="mt-2 flex items-center gap-2 rounded-full border border-sky-500/20 bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        <Mail className="h-3.5 w-3.5 text-sky-500" />
        {developer.email}
      </div>
    </motion.div>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-semibold">
        {label}
        {required && <span className="ml-1 text-pink-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
