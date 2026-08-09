"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, CheckCircle2, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
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
      toast.success("🎉 Subscribed successfully!", {
        description:
          "You'll get notified when I publish new articles on SaaS, TypeScript, and freelance dev life.",
      });
      setEmail("");
    } catch (err: any) {
      toast.error("Subscription failed", {
        description: err?.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-16 sm:py-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-white/80 to-pink-500/10 p-8 shadow-card-hover dark:from-sky-500/10 dark:via-slate-900/80 dark:to-pink-500/10 sm:p-12"
        >
          {/* Decorative background */}
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-pink-500/15 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-sky-500/15 blur-3xl" />

          <div className="relative flex flex-col items-center gap-6 text-center">
            {/* Icon badge */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-pink-500 shadow-glow-sky">
              <Mail className="h-8 w-8 text-white" />
            </div>

            <div>
              <h3 className="text-2xl font-bold sm:text-3xl">
                Stay in the{" "}
                <span className="text-gradient-sky-pink">Loop</span>
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
                Get notified when I publish new articles on SaaS architecture,
                TypeScript patterns, and lessons from my freelance journey.
                No spam — just quality content, occasionally.
              </p>
            </div>

            {/* Stats badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-sky-500" />
                6+ articles published
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                Monthly digest
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                Unsubscribe anytime
              </span>
            </div>

            {/* Form */}
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 px-6 py-4"
              >
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <div className="text-left">
                  <div className="font-semibold text-foreground">
                    You&apos;re subscribed!
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Watch your inbox for the next article.
                  </div>
                </div>
              </motion.div>
            ) : (
              <form
                onSubmit={subscribe}
                className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-full border-sky-500/30 bg-white/80 px-5 py-3 text-sm shadow-soft dark:bg-slate-800/80"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="shrink-0 rounded-full bg-gradient-to-r from-sky-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow-pink"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Subscribe
                    </>
                  )}
                </Button>
              </form>
            )}

            <p className="text-[11px] text-muted-foreground">
              Join 120+ developers and founders who trust my content.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
