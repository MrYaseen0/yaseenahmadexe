"use client";

import { motion } from "framer-motion";
import { GraduationCap, Heart, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "../section-heading";
import { Reveal } from "../reveal";
import dynamic from "next/dynamic";
import { developer } from "@/lib/portfolio-data";

// Decorative 3D scene floating behind the About content (desktop, client-only).
const Cube3D = dynamic(() => import("@/components/portfolio/three/cube3d"), {
  ssr: false,
  loading: () => null,
});

const skillChips = developer.skills;

export function About() {
  return (
    <section id="about" className="relative py-20 sm:py-28">
      {/* 3D accent */}
      <div className="absolute -right-24 top-10 hidden h-64 w-64 lg:block">
        <Cube3D />
      </div>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          emoji="👋"
          title="About"
          highlight="Me"
          subtitle="Get to know the developer behind the code."
        />

        <div className="mt-14 grid items-center gap-8 md:gap-10 lg:grid-cols-2">
          {/* Left: photo + floating tags */}
          <Reveal direction="right" className="perspective-1000 relative overflow-hidden">
            <div className="relative mx-auto max-w-md">
              {/* Wooden frame accent */}
              <div className="absolute -inset-3 rounded-[2rem] border-2 border-wood/30 bg-wood/5" />
              <div className="absolute -inset-3 rounded-[2rem] border border-pink-500/20" />

              <motion.div
                whileHover={{ rotateY: 5, rotateX: -3, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="transform-3d relative overflow-hidden rounded-[1.75rem] shadow-card-hover"
              >
                <img
                  src="/assets/dev-photo.jpg"
                  alt={developer.name}
                  className="aspect-[4/5] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-900/60 via-transparent to-pink-500/10" />

                {/* Name plate */}
                <div className="absolute inset-x-3 bottom-3 glass rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {developer.name}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {developer.role} · Software Engineering Student
                  </p>
                </div>
              </motion.div>

              {/* Floating skill badges */}
              <FloatingChip
                className="-left-6 top-10"
                delay={0.4}
                color="sky"
              >
                ⚛️ React
              </FloatingChip>
              <FloatingChip
                className="-right-6 top-1/3"
                delay={0.6}
                color="pink"
              >
                🚀 Next.js
              </FloatingChip>
              <FloatingChip
                className="-left-4 bottom-24"
                delay={0.8}
                color="wood"
              >
                📘 TypeScript
              </FloatingChip>
              <FloatingChip
                className="-right-4 bottom-12"
                delay={1}
                color="sky"
              >
                ⚡ Node.js
              </FloatingChip>
            </div>
          </Reveal>

          {/* Right: text + code card */}
          <Reveal direction="left" delay={0.1} className="space-y-6">
            <h3 className="text-2xl font-bold sm:text-3xl md:text-4xl">
              Turning Ideas Into{" "}
              <span className="text-gradient-sky-pink">Digital Reality</span>
            </h3>

            <p className="text-base text-muted-foreground sm:text-lg">
              {developer.aboutText}
            </p>
            <p className="text-base text-muted-foreground sm:text-lg">
              {developer.aboutText2}
            </p>

            {/* Skill chips */}
            <div className="flex flex-wrap gap-2">
              {skillChips.map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Badge
                    variant="secondary"
                    className="rounded-full border border-sky-500/20 bg-gradient-to-r from-sky-500/10 to-pink-500/10 px-3 py-1.5 text-sm font-medium"
                  >
                    {s}
                  </Badge>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  document
                    .querySelector("#techstack")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-full bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-soft"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                View Experience
              </Button>
            </div>

            {/* Info cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoCard
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value="Peshawar, PK"
              />
              <InfoCard
                icon={<GraduationCap className="h-4 w-4" />}
                label="Education"
                value="Software Eng."
              />
              <InfoCard
                icon={<Heart className="h-4 w-4" />}
                label="Status"
                value="Available"
              />
            </div>
          </Reveal>
        </div>

        {/* Code snippet card (full width below) */}
        <Reveal className="mt-14">
          <CodeCard />
        </Reveal>
      </div>
    </section>
  );
}

function FloatingChip({
  children,
  className,
  delay,
  color,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
  color: "sky" | "pink" | "wood";
}) {
  const colors = {
    sky: "border-sky-500/40 bg-white/90 text-sky-700 shadow-glow-sky",
    pink: "border-pink-500/40 bg-white/90 text-pink-700 shadow-glow-pink",
    wood: "border-wood/40 bg-white/90 text-wood shadow-soft",
  };
  return (
    <div
      className={`animate-fade-in-scale absolute z-10 rounded-xl border px-3 py-1.5 text-xs font-bold backdrop-blur ${colors[color]} ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="animate-float inline-block" style={{ animationDelay: `${delay}s`, animationDuration: "3s" }}>
        {children}
      </span>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass rounded-xl p-3 shadow-soft">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <span className="text-sky-500">{icon}</span>
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function CodeCard() {
  return (
    <motion.div
      whileHover={{ rotateX: 1, rotateY: -1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="transform-3d perspective-1000 overflow-hidden rounded-2xl border border-sky-500/20 bg-slate-900 shadow-card-hover"
    >
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-800/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <span className="ml-2 font-mono text-xs text-slate-300">
            developer.tsx
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">TypeScript</span>
      </div>

      {/* Code */}
      <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
        <code className="font-mono">
          {developer.codeSnippet.split("\n").map((line, i) => (
            <div key={i} className="flex">
              <span className="mr-4 inline-block w-6 select-none text-right text-slate-600">
                {i + 1}
              </span>
              <span className="text-slate-200">{highlightLine(line)}</span>
            </div>
          ))}
        </code>
      </pre>
    </motion.div>
  );
}

// Very light syntax highlighting
function highlightLine(line: string) {
  // keywords
  const parts: React.ReactNode[] = [];
  const tokens = line.split(/(\s+|[{}[\]():,;])/);
  tokens.forEach((tok, i) => {
    if (/^(const|export|default|return)$/.test(tok)) {
      parts.push(
        <span key={i} className="font-bold text-pink-400">
          {tok}
        </span>
      );
    } else if (/^["'`].*["'`]$/.test(tok)) {
      parts.push(
        <span key={i} className="text-amber-300">
          {tok}
        </span>
      );
    } else if (/^[A-Z][a-zA-Z]+$/.test(tok)) {
      parts.push(
        <span key={i} className="text-sky-300">
          {tok}
        </span>
      );
    } else if (/^(name|role|location|skills|passion|status)$/.test(tok)) {
      parts.push(
        <span key={i} className="text-sky-200">
          {tok}
        </span>
      );
    } else {
      parts.push(<span key={i}>{tok}</span>);
    }
  });
  return parts;
}
