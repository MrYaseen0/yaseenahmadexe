"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2, BookOpen, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Editable, useContent } from "@/components/portfolio/content-editor";
import { Reveal } from "../reveal";

export function Newsletter() {
  const { t, tj } = useContent();
  const stats = tj<{ icon: string; text: string }[]>("newsletter.stats");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t("newsletter.invalidEmail"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setSubscribed(true);
      toast.success(t("newsletter.subscribedOk"), {
        description: t("newsletter.subscribedOkSub"),
      });
      setEmail("");
    } catch (err) {
      toast.error(t("newsletter.subscribedFail"), {
        description:
          err instanceof Error ? err.message : t("newsletter.subscribedFailSub"),
      });
    } finally {
      setLoading(false);
    }
  };

  const statIcons = [BookOpen, Sparkles, CheckCircle2];

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <Reveal className="rounded-xl border border-[#E6E8E2] bg-[#F4F5F1] p-8 text-center sm:p-12">
          <div className="flex flex-col items-center gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#E6E8E2] bg-white">
              <Mail className="h-5 w-5 text-[#101410]" />
            </div>

            <div>
              <h3 className="font-display text-3xl font-semibold tracking-tight text-[#101410] sm:text-4xl">
                <Editable id="newsletter.titleA" />{" "}
                <Editable id="newsletter.titleB" />
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#5F665F] sm:text-base">
                <Editable id="newsletter.sub" />
              </p>
            </div>

            <Editable id="newsletter.stats" json label="Stat badges" />

            {/* Stat badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-[11px] uppercase tracking-wider text-[#5F665F]">
              {stats.map((st, i) => {
                const Icon = statIcons[i % statIcons.length];
                return (
                  <span key={i} className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-[#166534]" />
                    {st.text}
                  </span>
                );
              })}
            </div>

            {/* Form */}
            {subscribed ? (
              <div className="flex items-center gap-3 rounded-xl border border-[#E6E8E2] bg-white px-6 py-4">
                <CheckCircle2 className="h-6 w-6 text-[#166534]" />
                <div className="text-left">
                  <div className="font-semibold text-[#101410]">
                    <Editable id="newsletter.subscribedTitle" />
                  </div>
                  <div className="text-xs text-[#5F665F]">
                    <Editable id="newsletter.subscribedSub" />
                  </div>
                </div>
              </div>
            ) : (
              <form
                onSubmit={subscribe}
                className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("newsletter.emailPlaceholder")}
                  className="rounded-full border-[#E6E8E2] bg-white px-5 py-3 text-sm focus:border-[#101410]"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#101410] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <Editable id="newsletter.subscribing" />
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <Editable id="newsletter.subscribe" />
                    </>
                  )}
                </button>
              </form>
            )}

            <p className="text-xs text-[#5F665F]">
              <Editable id="newsletter.footNote" />
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
