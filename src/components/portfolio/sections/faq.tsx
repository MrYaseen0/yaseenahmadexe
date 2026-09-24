"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CreditCard,
  DollarSign,
  Wrench,
  Users,
  Code,
  Calendar,
  ShieldCheck,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { SectionHeading } from "../section-heading";
import { Editable, useContent } from "@/components/portfolio/content-editor";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  CreditCard,
  DollarSign,
  Wrench,
  Users,
  Code,
  Calendar,
  ShieldCheck,
};

interface FaqItem { q: string; a: string; icon: string; }

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const { t, tj } = useContent();
  const faqs = tj<FaqItem[]>("faq.items");

  return (
    <section id="faq" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <SectionHeading ek="faq" />

        <Editable id="faq.items" json label="Questions & answers" />
        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => {
            const Icon = iconMap[faq.icon] || HelpCircle;
            const isOpen = open === i;
            return (
              <div
                key={faq.q}
                className={cn(
                  "group overflow-hidden rounded-2xl border bg-card transition-all duration-300",
                  isOpen
                    ? "border-green-500/30 shadow-card-hover"
                    : "border-green-500/15 shadow-soft hover:border-emerald-500/30"
                )}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-4 p-5 text-left"
                  aria-expanded={isOpen}
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                      isOpen
                        ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-soft"
                        : "bg-green-500/10 text-green-600 dark:text-green-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-600"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="flex-1 text-base font-semibold text-foreground">
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
                      isOpen
                        ? "bg-green-500/15 text-green-600"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pl-14 pr-5 sm:pl-20">
                        <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 p-6 text-center sm:p-8">
          <p className="text-lg font-semibold text-foreground">
            <Editable id="faq.ctaTitle" />{" "}
            <span className="text-gradient-viridia"><Editable id="faq.ctaHighlight" /></span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            <Editable id="faq.ctaSub" />
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              onClick={() =>
                document
                  .querySelector("#contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:shadow-glow-green hover:-translate-y-0.5"
            >
              <Editable id="faq.ctaContact" />
            </button>
            <a
              href="https://wa.me/923189370042"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-green-500/40 bg-green-500/5 px-6 py-2.5 text-sm font-semibold text-green-600 transition-all hover:bg-green-500/10 hover:-translate-y-0.5 dark:text-green-400"
            >
              💬 WhatsApp <Editable id="brand.phone" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
