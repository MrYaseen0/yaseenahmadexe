"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, MessageSquarePlus, Loader2, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { SectionHeading } from "../section-heading";

// Curated default testimonials (always visible)
const defaultTestimonials = [
  {
    name: "Sarah Johnson",
    role: "Startup Founder",
    company: "TechFlow Inc.",
    avatar: "SJ",
    rating: 5,
    text: "Yaseen delivered our SaaS dashboard ahead of schedule. His attention to detail and clean code made maintenance a breeze. Highly recommended!",
    color: "from-sky-400 to-blue-500",
    verified: true,
  },
  {
    name: "Ahmed Hassan",
    role: "Product Manager",
    company: "Innovate Labs",
    avatar: "AH",
    rating: 5,
    text: "Excellent communication and technical skills. Yaseen transformed our requirements into a polished product. Will definitely work with him again.",
    color: "from-pink-400 to-rose-500",
    verified: true,
  },
  {
    name: "Emily Chen",
    role: "CTO",
    company: "CloudScale",
    avatar: "EC",
    rating: 5,
    text: "Working with Yaseen was a pleasure. He understands modern architecture deeply and writes production-ready code. True professional.",
    color: "from-amber-500 to-orange-600",
    verified: true,
  },
  {
    name: "Marcus Williams",
    role: "Entrepreneur",
    company: "BuildRight",
    avatar: "MW",
    rating: 5,
    text: "From concept to deployment, Yaseen handled everything flawlessly. Our e-commerce platform is fast, scalable, and beautiful.",
    color: "from-sky-400 to-cyan-500",
    verified: true,
  },
  {
    name: "Fatima Khan",
    role: "Marketing Director",
    company: "GrowthHub",
    avatar: "FK",
    rating: 5,
    text: "The AI content tool Yaseen built saved us countless hours. Brilliant execution and ongoing support. Couldn't be happier!",
    color: "from-pink-400 to-fuchsia-500",
    verified: true,
  },
  {
    name: "David Park",
    role: "Lead Developer",
    company: "DevStudio",
    avatar: "DP",
    rating: 5,
    text: "I've worked with many developers — Yaseen stands out. Clean code, thoughtful architecture, and a great collaborator.",
    color: "from-amber-600 to-red-600",
    verified: true,
  },
];

interface VisitorTestimonial {
  id: string;
  name: string;
  role: string;
  company: string | null;
  rating: number;
  message: string;
  color: string;
}

export function Testimonials() {
  const [visitorTestimonials, setVisitorTestimonials] = useState<VisitorTestimonial[]>([]);
  const [submitOpen, setSubmitOpen] = useState(false);

  useEffect(() => {
    fetch("/api/testimonials", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.testimonials?.length) {
          setVisitorTestimonials(data.testimonials);
        }
      })
      .catch(() => {});
  }, []);

  // Merge: visitor testimonials first, then defaults
  const allTestimonials = [
    ...visitorTestimonials.map((t) => ({
      name: t.name,
      role: t.role,
      company: t.company || "Verified Client",
      avatar: t.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      rating: t.rating,
      text: t.message,
      color: colorMap[t.color as keyof typeof colorMap] || colorMap.sky,
      verified: false,
    })),
    ...defaultTestimonials,
  ];

  return (
    <section id="testimonials" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          emoji="💬"
          title="What Clients"
          highlight="Say"
          subtitle="Feedback from clients and collaborators who trusted me with their projects."
        />

        {/* Submit CTA */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => setSubmitOpen(true)}
            variant="outline"
            className="rounded-full border-pink-500/40 bg-pink-500/5 px-5 text-pink-600 hover:bg-pink-500/10 dark:text-pink-400"
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Leave a Testimonial
          </Button>
        </div>

        {/* Testimonials grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allTestimonials.map((t, i) => (
            <motion.div
              key={t.name + i}
              className="animate-fade-in-up group relative overflow-hidden rounded-2xl border border-sky-500/15 bg-card p-6 shadow-soft transition-all hover:-translate-y-1.5 hover:shadow-card-hover"
              style={{ animationDelay: `${(i % 3) * 0.1}s` }}
            >
              <Quote className="absolute right-4 top-4 h-10 w-10 text-sky-500/10 transition-colors group-hover:text-pink-500/20" />

              <div className="mb-3 flex items-center justify-between">
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                {t.verified ? (
                  <span className="flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-600 dark:text-sky-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-3 w-3" />
                    New
                  </span>
                )}
              </div>

              <p className="relative mb-5 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 border-t border-sky-500/10 pt-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white shadow-soft`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.role} · {t.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats summary */}
        <div className="animate-fade-in-up mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { v: "30+", l: "Happy Clients" },
            { v: "50+", l: "Projects Delivered" },
            { v: "5.0", l: "Average Rating" },
            { v: "98%", l: "Repeat Hire Rate" },
          ].map((s) => (
            <div
              key={s.l}
              className="glass rounded-2xl p-5 text-center shadow-soft"
            >
              <div className="text-2xl font-bold text-gradient-sky-pink sm:text-3xl">
                {s.v}
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit testimonial modal */}
      <SubmitTestimonialModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onSubmitted={() => {
          // Refresh list after submission (will show after approval)
          setSubmitOpen(false);
        }}
      />
    </section>
  );
}

const colorMap = {
  sky: "from-sky-400 to-blue-500",
  pink: "from-pink-400 to-rose-500",
  wood: "from-amber-500 to-orange-600",
};

function SubmitTestimonialModal({
  open,
  onClose,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "",
    company: "",
    email: "",
    rating: 5,
    message: "",
  });
  const [hoverRating, setHoverRating] = useState(0);

  const set = (k: keyof typeof form) => (v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.role || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (form.message.trim().length < 10) {
      toast.error("Please write at least 10 characters in your message.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("🎉 Thank you for your testimonial!", {
        description:
          "It will appear publicly after a quick review by Yaseen.",
      });
      setForm({
        name: "",
        role: "",
        company: "",
        email: "",
        rating: 5,
        message: "",
      });
      onSubmitted();
    } catch (err: any) {
      toast.error("Submission failed", {
        description: err?.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border-sky-500/20 p-0">
        <DialogHeader className="border-b border-sky-500/10 bg-gradient-to-r from-sky-500/5 to-pink-500/5 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-pink-500 text-white">
              <MessageSquarePlus className="h-5 w-5" />
            </span>
            Leave a Testimonial
          </DialogTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Share your experience working with me. Submissions are reviewed before public display.
          </p>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your Name" required>
              <Input
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
                placeholder="John Smith"
                className="rounded-xl"
              />
            </Field>
            <Field label="Your Role" required>
              <Input
                value={form.role}
                onChange={(e) => set("role")(e.target.value)}
                placeholder="CTO, Founder, etc."
                className="rounded-xl"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company (optional)">
              <Input
                value={form.company}
                onChange={(e) => set("company")(e.target.value)}
                placeholder="Acme Inc."
                className="rounded-xl"
              />
            </Field>
            <Field label="Email" required>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                placeholder="you@example.com"
                className="rounded-xl"
              />
            </Field>
          </div>

          {/* Rating */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set("rating")(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="rounded-md p-1 transition-transform hover:scale-110"
                  aria-label={`Rate ${n} stars`}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      n <= (hoverRating || form.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-medium text-muted-foreground">
                {form.rating} / 5
              </span>
            </div>
          </div>

          <Field label="Your Message" required>
            <Textarea
              value={form.message}
              onChange={(e) => set("message")(e.target.value)}
              placeholder="Share your experience working with Yaseen — what went well, the impact, etc."
              className="min-h-[120px] rounded-xl resize-none"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {form.message.length} / 2000 characters
            </p>
          </Field>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-soft"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">
        {label}
        {required && <span className="ml-1 text-pink-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
