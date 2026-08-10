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
import { faqs, developer } from "@/lib/portfolio-data";
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

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <SectionHeading
          emoji="❓"
          title="Frequently Asked"
          highlight="Questions"
          subtitle="Quick answers to the most common questions clients ask before working with me."
        />

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
                    ? "border-sky-500/30 shadow-card-hover"
                    : "border-sky-500/15 shadow-soft hover:border-pink-500/30"
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
                        ? "bg-gradient-to-br from-sky-500 to-pink-500 text-white shadow-soft"
                        : "bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:bg-pink-500/10 group-hover:text-pink-600"
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
                        ? "bg-sky-500/15 text-sky-600"
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
        <div className="mt-10 rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/5 via-transparent to-pink-500/5 p-6 text-center sm:p-8">
          <p className="text-lg font-semibold text-foreground">
            Still have questions?{" "}
            <span className="text-gradient-sky-pink">I&apos;m here to help.</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Reach out via the contact form, WhatsApp, or the live chat —
            I typically reply within a few hours.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              onClick={() =>
                document
                  .querySelector("#contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-full bg-gradient-to-r from-sky-500 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:shadow-glow-pink hover:-translate-y-0.5"
            >
              Contact Me
            </button>
            <a
              href="https://wa.me/923189370042"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-green-500/40 bg-green-500/5 px-6 py-2.5 text-sm font-semibold text-green-600 transition-all hover:bg-green-500/10 hover:-translate-y-0.5 dark:text-green-400"
            >
              💬 WhatsApp {developer.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
