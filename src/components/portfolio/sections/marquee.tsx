"use client";

import { motion } from "framer-motion";
import { Editable, useContent } from "@/components/portfolio/content-editor";

export function Marquee() {
  const { tj } = useContent();
  const items = tj<string[]>("marquee.items");
  return (
    <section className="relative border-y border-green-500/10 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-wood/5 py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <Editable id="marquee.items" json label="Marquee items" />
      <div className="flex overflow-hidden">
        <motion.div
          className="flex shrink-0 items-center gap-8 pr-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...items, ...items].map((item, i) => (
            <div key={i} className="flex items-center gap-8">
              <span className="whitespace-nowrap text-xl font-bold text-muted-foreground/60">
                {item}
              </span>
              <span className="text-2xl text-emerald-500/40">✦</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
