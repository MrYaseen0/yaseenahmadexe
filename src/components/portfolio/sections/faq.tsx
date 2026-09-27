"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "../section-heading";
import { Reveal } from "../reveal";
import { Editable, useContent } from "@/components/portfolio/content-editor";
import { cn } from "@/lib/utils";

interface FaqItem {
  q: string;
  a: string;
  icon: string;
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const { tj } = useContent();
  const faqs = tj<FaqItem[]>("faq.items");

  return (
    <section id="faq" className="border-t border-[var(--hairline)] bg-[#F4F5F1] py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <SectionHeading ek="faq" />

        <Editable id="faq.items" json label="Questions & answers" />
        <Reveal className="mt-12 border-t border-[var(--hairline)]">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.q} className="border-b border-[var(--hairline)]">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="flex-1 text-base font-medium text-[#101410]">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                      isOpen
                        ? "border-[#101410] bg-[#101410] text-white"
                        : "border-[var(--hairline)] bg-white text-[var(--muted)]"
                    )}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-12 text-sm leading-relaxed text-[var(--muted)] sm:text-[15px]">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>

        {/* CTA */}
        <div className="mt-10 rounded-xl border border-[var(--hairline)] bg-white p-6 text-center sm:p-8">
          <p className="text-lg font-medium text-[#101410]">
            <Editable id="faq.ctaTitle" />{" "}
            <span className="text-[#166534]">
              <Editable id="faq.ctaHighlight" />
            </span>
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            <Editable id="faq.ctaSub" />
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              onClick={() =>
                document
                  .querySelector("#contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-full bg-[#101410] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black"
            >
              <Editable id="faq.ctaContact" />
            </button>
            <a
              href="https://wa.me/923189370042"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[var(--hairline)] px-6 py-2.5 text-sm font-medium text-[#101410] transition-colors hover:border-[#101410]"
            >
              WhatsApp <Editable id="brand.phone" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
