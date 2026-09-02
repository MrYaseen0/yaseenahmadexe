"use client";

import {
  Briefcase,
  MapPin,
  Calendar,
  Check,
  GraduationCap,
  Building2,
} from "lucide-react";
import { SectionHeading } from "../section-heading";
import { Reveal } from "../reveal";
import { TiltCard } from "../tilt-card";
import { experiences } from "@/lib/portfolio-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const colorMap: Record<
  string,
  { dot: string; ring: string; bg: string; text: string; line: string }
> = {
  sky: {
    dot: "bg-sky-500",
    ring: "ring-sky-500/30",
    bg: "from-sky-500/5 to-transparent",
    text: "text-sky-600 dark:text-sky-400",
    line: "from-sky-500 to-pink-500",
  },
  pink: {
    dot: "bg-pink-500",
    ring: "ring-pink-500/30",
    bg: "from-pink-500/5 to-transparent",
    text: "text-pink-600 dark:text-pink-400",
    line: "from-pink-500 to-wood",
  },
  wood: {
    dot: "bg-wood",
    ring: "ring-wood/30",
    bg: "from-wood/5 to-transparent",
    text: "text-wood",
    line: "from-wood to-sky-500",
  },
};

export function Experience() {
  return (
    <section id="experience" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading
          emoji="📈"
          title="Career"
          highlight="Timeline"
          subtitle="My professional journey building products, leading teams, and growing as a developer."
        />

        {/* Timeline */}
        <div className="relative mt-16">
          {/* Vertical line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-sky-500 via-pink-500 to-wood sm:left-1/2 sm:-translate-x-1/2" />

          <div className="space-y-10 sm:space-y-16">
            {experiences.map((exp, i) => (
              <TimelineItem key={exp.role + exp.company} exp={exp} index={i} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="text-sm text-muted-foreground">
            Want to know more about my journey?{" "}
            <button
              onClick={() =>
                document
                  .querySelector("#contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="font-semibold text-pink-600 underline-offset-4 hover:underline dark:text-pink-400"
            >
              Let&apos;s connect →
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({
  exp,
  index,
}: {
  exp: (typeof experiences)[number];
  index: number;
}) {
  const colors = colorMap[exp.color];
  const isLeft = index % 2 === 0;
  const Icon =
    exp.type === "Education" ? GraduationCap : exp.type === "Freelance" ? Briefcase : Building2;

  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 sm:flex-row sm:items-center",
        isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
      )}
    >
      {/* Dot on the line */}
      <div className="absolute left-4 top-6 z-10 -translate-x-1/2 sm:left-1/2">
        <span
          className={cn(
            "relative flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-background",
            colors.dot
          )}
        >
          {exp.current && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: "currentColor" }} />
          )}
        </span>
      </div>

      {/* Spacer for alternating layout on desktop */}
      <div className="hidden sm:block sm:w-1/2" />

      {/* Card */}
      <Reveal
        direction={isLeft ? "right" : "left"}
        className={cn(
          "ml-12 sm:ml-0 sm:w-1/2",
          isLeft ? "sm:pr-12" : "sm:pl-12"
        )}
      >
        <TiltCard max={7} scale={1.03}>
        <div
          className={cn(
            "group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-soft transition-shadow duration-300 hover:shadow-card-hover sm:p-6",
            "border-sky-500/15",
            colors.bg
          )}
        >
          {/* top accent */}
          <div className={cn("absolute left-0 top-0 h-full w-1 bg-gradient-to-b", colors.line)} />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-soft ring-1 dark:bg-slate-800",
                  colors.ring,
                  colors.text
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold leading-tight sm:text-lg">
                  {exp.role}
                </h3>
                <p className={cn("text-sm font-semibold", colors.text)}>
                  {exp.company}
                </p>
              </div>
            </div>
            {exp.current && (
              <Badge className="shrink-0 bg-green-500/15 text-green-600 hover:bg-green-500/20 dark:text-green-400">
                Current
              </Badge>
            )}
          </div>

          {/* Meta */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {exp.period}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {exp.location}
            </span>
            <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px]">
              {exp.type}
            </Badge>
          </div>

          {/* Description */}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {exp.description}
          </p>

          {/* Achievements */}
          <ul className="mt-4 space-y-1.5">
            {exp.achievements.map((a) => (
              <li key={a} className="flex items-start gap-2 text-xs text-foreground/80 sm:text-sm">
                <Check className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", colors.text)} />
                <span>{a}</span>
              </li>
            ))}
          </ul>

          {/* Tech tags */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {exp.tech.map((t) => (
              <span
                key={t}
                className="rounded-md border border-sky-500/15 bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        </TiltCard>
      </Reveal>
    </div>
  );
}
