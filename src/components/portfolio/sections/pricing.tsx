"use client";

import { Check } from "lucide-react";
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

export function Pricing() {
  const { tj } = useContent();
  const plans = tj<Plan[]>("pricing.plans");
  const scrollToContact = () =>
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="pricing" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading ek="pricing" />

        <Editable id="pricing.plans" json label="Pricing plans" />
        <Stagger className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal asChild key={plan.name}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-xl border p-7 transition-all hover:-translate-y-0.5",
                  plan.popular
                    ? "border-[#101410] bg-[#101410] text-white hover:shadow-[0_8px_24px_rgba(16,20,16,0.2)]"
                    : "border-[#E6E8E2] bg-white hover:shadow-[0_8px_24px_rgba(16,20,16,0.06)]"
                )}
              >
                {plan.popular && (
                  <div className="absolute right-5 top-5 rounded-full bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#101410]">
                    <Editable id="pricing.popular" />
                  </div>
                )}

                <div
                  className={cn(
                    "mb-4 font-mono text-xs font-medium tracking-widest",
                    plan.popular ? "text-white/60" : "text-[#5F665F]"
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  {plan.name}
                </h3>
                <p
                  className={cn(
                    "mt-1 text-sm",
                    plan.popular ? "text-white/70" : "text-[#5F665F]"
                  )}
                >
                  {plan.description}
                </p>

                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-semibold tracking-tight">
                    {plan.price}
                  </span>
                  <span
                    className={cn(
                      "text-sm",
                      plan.popular ? "text-white/60" : "text-[#5F665F]"
                    )}
                  >
                    {plan.period}
                  </span>
                </div>

                <ul className="mt-7 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          plan.popular ? "text-white" : "text-[#166534]"
                        )}
                      />
                      <span
                        className={plan.popular ? "text-white/85" : "text-[#101410]/80"}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={scrollToContact}
                  variant={plan.popular ? "default" : "outline"}
                  className={cn(
                    "mt-7 w-full rounded-full px-6 py-3 text-sm font-medium",
                    plan.popular
                      ? "bg-white text-[#101410] hover:bg-white/90"
                      : "border-[#E6E8E2] bg-white text-[#101410] hover:border-[#101410] hover:bg-white"
                  )}
                >
                  <Editable id="pricing.getStarted" />
                </Button>
              </div>
            </Reveal>
          ))}
        </Stagger>

        <p className="mt-8 text-center text-sm text-[#5F665F]">
          <Editable id="pricing.footText" />{" "}
          <button
            onClick={scrollToContact}
            className="font-semibold text-[#101410] underline underline-offset-4 hover:text-[#166534]"
          >
            <Editable id="pricing.footLink" />
          </button>
        </p>
      </div>
    </section>
  );
}
