"use client";

import { motion } from "framer-motion";

const items = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Tailwind CSS",
  "PostgreSQL",
  "MongoDB",
  "Prisma",
  "GraphQL",
  "Docker",
  "Vercel",
  "Stripe",
  "Socket.io",
  "Python",
  "Express",
  "Firebase",
  "Supabase",
  "Git",
];

export function Marquee() {
  return (
    <section className="relative border-y border-sky-500/10 bg-gradient-to-r from-sky-500/5 via-pink-500/5 to-wood/5 py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      {/* 3D ticker: alternating rotateY gives the ribbon a dimensional drift */}
      <div className="flex overflow-hidden" style={{ perspective: "900px" }}>
        <motion.div
          className="flex shrink-0 items-center gap-8 pr-8"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...items, ...items].map((item, i) => (
            <div key={i} className="flex items-center gap-8">
              <span
                className="font-display whitespace-nowrap text-xl font-bold text-muted-foreground/60"
                style={{
                  transform: `perspective(600px) rotateY(${i % 2 === 0 ? 9 : -9}deg) translateZ(${i % 2 === 0 ? 18 : -6}px)`,
                }}
              >
                {item}
              </span>
              <span
                className="text-2xl text-pink-500/40"
                style={{ animation: "flutter-3d 6s ease-in-out infinite", animationDelay: `${i * 0.3}s`, display: "inline-block" }}
              >
                ✦
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
