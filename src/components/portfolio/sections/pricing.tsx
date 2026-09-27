"use client";

import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "../section-heading";
import { Reveal, Stagger } from "../reveal";
import { cn } from "@/lib/utils";
import { Editable, useContent } from "@/components/portfolio/content-editor";

interface Plan {
  name: string;
  emoji: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  color: string;
  popular: boolean;
}


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
  const { tj } = useContent();
  const plans = tj<Plan[]>("pricing.plans");
  const scrollToContact = () =>
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="pricing" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading ek="pricing" />

        <Editable id="pricing.plans" json label="Pricing plans" />
        <Stagger className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const colors = colorMap[plan.color];
            return (
              <Reveal
                asChild
                key={plan.name}
                className={cn(
                  "relative overflow-hidden rounded-2xl border bg-gradient-to-b p-6 shadow-soft transition-shadow hover:-translate-y-2 hover:shadow-card-hover",
                  colors.border,
                  colors.bg,
                  plan.popular && "lg:scale-105"
                )}
              >
                {plan.popular && (
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-sky-500 px-3 py-1 text-[11px] font-bold text-white">
                    <Sparkles className="h-3 w-3" />
                    <Editable id="pricing.popular" />
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
                  <Editable id="pricing.getStarted" />
                </Button>
              </Reveal>
            );
          })}
        </Stagger>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Editable id="pricing.footText" />{" "}
          <button
            onClick={scrollToContact}
            className="font-semibold text-pink-700 underline-offset-4 hover:underline dark:text-pink-400"
          >
            <Editable id="pricing.footLink" />
          </button>
        </p>
      </div>
    </section>
  );
}
