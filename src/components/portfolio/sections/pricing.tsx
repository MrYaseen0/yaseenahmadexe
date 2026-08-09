"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "../section-heading";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    emoji: "🌱",
    price: "$499",
    period: "/ project",
    description: "Perfect for small websites & landing pages.",
    features: [
      "1-3 page website",
      "Responsive design",
      "Basic SEO setup",
      "Contact form",
      "1 round of revisions",
      "7-day delivery",
    ],
    color: "sky",
    popular: false,
  },
  {
    name: "Professional",
    emoji: "🚀",
    price: "$1,499",
    period: "/ project",
    description: "Full-featured web app with backend & database.",
    features: [
      "Up to 10 pages / screens",
      "Custom backend & API",
      "Database design",
      "Authentication system",
      "Admin dashboard",
      "3 rounds of revisions",
      "30 days free support",
      "14-day delivery",
    ],
    color: "pink",
    popular: true,
  },
  {
    name: "Enterprise",
    emoji: "🏢",
    price: "Custom",
    period: "",
    description: "SaaS products with scaling & ongoing support.",
    features: [
      "Unlimited pages / features",
      "Microservices architecture",
      "Payment integration (Stripe)",
      "Real-time features",
      "CI/CD pipeline",
      "Unlimited revisions",
      "90 days free support",
      "Dedicated support channel",
      "Flexible timeline",
    ],
    color: "wood",
    popular: false,
  },
];

const colorMap: Record<string, { border: string; bg: string; btn: string; check: string }> = {
  sky: {
    border: "border-sky-500/30",
    bg: "from-sky-500/5 to-transparent",
    btn: "bg-gradient-to-r from-sky-500 to-sky-600 text-white",
    check: "text-sky-500",
  },
  pink: {
    border: "border-pink-500/40",
    bg: "from-pink-500/10 to-sky-500/5",
    btn: "bg-gradient-to-r from-pink-500 to-sky-500 text-white shadow-glow-pink",
    check: "text-pink-500",
  },
  wood: {
    border: "border-wood/30",
    bg: "from-wood/10 to-transparent",
    btn: "bg-gradient-to-r from-wood to-amber-700 text-white",
    check: "text-wood",
  },
};

export function Pricing() {
  const scrollToContact = () =>
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="pricing" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          emoji="💎"
          title="Pricing"
          highlight="Plans"
          subtitle="Transparent pricing for every stage of your project. Custom quotes available on request."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => {
            const colors = colorMap[plan.color];
            return (
              <motion.div
                key={plan.name}
                className={cn(
                  "animate-fade-in-up relative overflow-hidden rounded-2xl border bg-gradient-to-b p-6 shadow-soft transition-shadow hover:-translate-y-2 hover:shadow-card-hover",
                  colors.border,
                  colors.bg,
                  plan.popular && "lg:scale-105"
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {plan.popular && (
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-sky-500 px-3 py-1 text-[11px] font-bold text-white">
                    <Sparkles className="h-3 w-3" />
                    POPULAR
                  </div>
                )}

                <div className="mb-4 text-4xl">{plan.emoji}</div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gradient-sky-pink">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>

                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={cn("mt-0.5 h-4 w-4 shrink-0", colors.check)} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={scrollToContact}
                  className={cn(
                    "mt-7 w-full rounded-full",
                    plan.popular ? colors.btn : "border " + colors.border + " bg-card hover:bg-muted"
                  )}
                  variant={plan.popular ? "default" : "outline"}
                >
                  Get Started
                </Button>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Need something different?{" "}
          <button
            onClick={scrollToContact}
            className="font-semibold text-pink-600 underline-offset-4 hover:underline dark:text-pink-400"
          >
            Let&apos;s discuss your project →
          </button>
        </p>
      </div>
    </section>
  );
}
