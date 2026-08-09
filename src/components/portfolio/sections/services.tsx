"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { SectionHeading } from "../section-heading";
import { services } from "@/lib/portfolio-data";
import { useTilt } from "../use-tilt";
import { cn } from "@/lib/utils";

const colorMap: Record<string, { ring: string; bg: string; text: string; glow: string }> = {
  sky: {
    ring: "border-sky-500/30",
    bg: "from-sky-500/10 to-sky-500/5",
    text: "text-sky-600 dark:text-sky-400",
    glow: "group-hover:shadow-glow-sky",
  },
  pink: {
    ring: "border-pink-500/30",
    bg: "from-pink-500/10 to-pink-500/5",
    text: "text-pink-600 dark:text-pink-400",
    glow: "group-hover:shadow-glow-pink",
  },
  wood: {
    ring: "border-wood/30",
    bg: "from-wood/10 to-wood/5",
    text: "text-wood",
    glow: "group-hover:shadow-soft",
  },
};

export function Services() {
  return (
    <section id="services" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          emoji="⚡"
          title="What I"
          highlight="Offer"
          subtitle="Specialized services to bring your digital ideas to life with cutting-edge technology."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <ServiceCard key={s.title} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  service,
  index,
}: {
  service: (typeof services)[number];
  index: number;
}) {
  const { ref, style, glare, handleMove, handleLeave } = useTilt(8);
  const colors = colorMap[service.color];

  return (
    <div
      className="animate-fade-in-up perspective-1000"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={style}
        className={cn(
          "transform-3d group relative h-full overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-shadow",
          colors.ring,
          colors.bg,
          colors.glow
        )}
      >
        {/* glare */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.4), transparent 60%)`,
            opacity: glare.opacity,
          }}
        />

        {/* big emoji badge */}
        <div
          className={cn(
            "relative mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl border bg-white text-3xl shadow-soft",
            colors.ring
          )}
          style={{ transform: "translateZ(40px)" }}
        >
          {service.emoji}
        </div>

        <h3
          className="relative mb-2 text-xl font-bold"
          style={{ transform: "translateZ(30px)" }}
        >
          {service.title}
        </h3>
        <p
          className="relative mb-4 text-sm text-muted-foreground"
          style={{ transform: "translateZ(20px)" }}
        >
          {service.description}
        </p>

        <ul
          className="relative space-y-1.5"
          style={{ transform: "translateZ(25px)" }}
        >
          {service.tags.map((t) => (
            <li
              key={t}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Check className={cn("h-3.5 w-3.5", colors.text)} />
              <span>{t}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() =>
            document
              .querySelector("#contact")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className={cn(
            "relative mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:gap-2.5",
            colors.text
          )}
          style={{ transform: "translateZ(20px)" }}
        >
          Learn More
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
