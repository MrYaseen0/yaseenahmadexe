"use client";

import { useEffect, useState } from "react";
import { Quote, Star, MessageSquarePlus, Loader2, CheckCircle2 } from "lucide-react";
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
import { Reveal, Stagger } from "../reveal";
import { Editable, useContent } from "@/components/portfolio/content-editor";

// No hardcoded testimonials — only real visitor submissions are shown

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
  const { t, tj } = useContent();
  const statCards = tj<{ v: string; l: string }[]>("testimonials.stats");
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

  // Only show real visitor testimonials
  const allTestimonials = visitorTestimonials.map((tm) => ({
    name: tm.name,
    role: tm.role,
    company: tm.company || "Verified Client",
    avatar: tm.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    rating: tm.rating,
    text: tm.message,
    color: colorMap[tm.color as keyof typeof colorMap] || colorMap.sky,
    verified: false,
  }));

  return (
    <section id="testimonials" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading ek="testimonials" />

        {/* Submit CTA */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => setSubmitOpen(true)}
            variant="outline"
            className="rounded-full border-pink-500/40 bg-pink-500/5 px-5 text-pink-700 hover:bg-pink-500/10 dark:text-pink-400"
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            <Editable id="testimonials.leaveBtn" />
          </Button>
        </div>

        {/* Testimonials grid */}
        {allTestimonials.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-sky-500/15 bg-card p-12 text-center">
            <Quote className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold"><Editable id="testimonials.emptyTitle" /></h3>
            <p className="mt-2 text-sm text-muted-foreground">
              <Editable id="testimonials.emptySub" />
            </p>
          </div>
        ) : (
          <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allTestimonials.map((tm, i) => (
            <Reveal
              asChild
              key={tm.name + i}
              className="group relative overflow-hidden rounded-2xl border border-sky-500/15 bg-card p-6 shadow-soft transition-all hover:-translate-y-1.5 hover:shadow-card-hover"
            >
              <Quote className="absolute right-4 top-4 h-10 w-10 text-sky-500/10 transition-colors group-hover:text-pink-500/20" />

              <div className="mb-3 flex items-center justify-between">
                <div className="flex gap-1">
                  {Array.from({ length: tm.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                {tm.verified ? (
                  <span className="flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-600 dark:text-sky-400">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("testimonials.verifiedWord")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("testimonials.newWord")}
                  </span>
                )}
              </div>

              <p className="relative mb-5 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{tm.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 border-t border-sky-500/10 pt-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${tm.color} text-sm font-bold text-white shadow-soft`}
                >
                  {tm.avatar}
                </div>
                <div>
                  <div className="font-semibold">{tm.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {tm.role} · {tm.company}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
          </Stagger>
        )}

        {/* Stats summary */}
        <Editable id="testimonials.stats" json label="Summary stat cards" />
        <Stagger className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {statCards.map((s, si) => (
            <Reveal
              asChild
              key={s.l}
              className="glass rounded-2xl p-5 text-center shadow-soft"
            >
              <div className="text-2xl font-bold text-gradient-sky-pink sm:text-3xl">
                {si === 0 ? visitorTestimonials.length.toString() : s.v}
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {s.l}
              </div>
            </Reveal>
          ))}
        </Stagger>
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
  const { t } = useContent();
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
      toast.error(t("testimonials.fillError"));
      return;
    }
    if (form.message.trim().length < 10) {
      toast.error(t("testimonials.shortError"));
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
      toast.success(t("testimonials.submitOk"), {
        description: t("testimonials.submitOkSub"),
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
      toast.error(t("testimonials.submitFail"), {
        description: err?.message || t("testimonials.submitFailSub"),
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
            <Editable id="testimonials.leaveBtn" />
          </DialogTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            <Editable id="testimonials.modalSub" />
          </p>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("testimonials.fName")} required>
              <Input
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
                placeholder={t("testimonials.pName")}
                className="rounded-xl"
              />
            </Field>
            <Field label={t("testimonials.fRole")} required>
              <Input
                value={form.role}
                onChange={(e) => set("role")(e.target.value)}
                placeholder={t("testimonials.pRole")}
                className="rounded-xl"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("testimonials.fCompany")}>
              <Input
                value={form.company}
                onChange={(e) => set("company")(e.target.value)}
                placeholder={t("testimonials.pCompany")}
                className="rounded-xl"
              />
            </Field>
            <Field label={t("testimonials.fEmail")} required>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                placeholder={t("testimonials.pEmail")}
                className="rounded-xl"
              />
            </Field>
          </div>

          {/* Rating */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold"><Editable id="testimonials.fRating" /></Label>
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

          <Field label={t("testimonials.fMessage")} required>
            <Textarea
              value={form.message}
              onChange={(e) => set("message")(e.target.value)}
              placeholder={t("testimonials.pMessage")}
              className="min-h-[120px] rounded-xl resize-none"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {form.message.length} / 2000 {t("testimonials.charsWord")}
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
              <Editable id="testimonials.cancelBtn" />
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-soft"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <Editable id="testimonials.submitting" />
                </>
              ) : (
                <>
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  <Editable id="testimonials.submitBtn" />
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
