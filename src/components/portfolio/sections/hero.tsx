"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowDown,
  Github,
  MapPin,
  Sparkles,
  Code2,
  Star,
  GitFork,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { developer, socials, keyStats } from "@/lib/portfolio-data";
import { PuzzlePhoto } from "@/components/portfolio/puzzle-photo";
import dynamic from "next/dynamic";

// Real WebGL 3D scene — loaded client-side only (no SSR, no hydration risk).
const Hero3D = dynamic(() => import("@/components/portfolio/three/hero3d"), {
  ssr: false,
  loading: () => null,
});

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yPhoto = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="home"
      ref={ref}
      className="relative flex min-h-screen items-start overflow-hidden pt-24 pb-16 md:items-center"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-start gap-8 md:items-center md:gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Left: text */}
          <motion.div
            style={{ y: yText }}
            className="md:col-span-1 lg:col-span-7"
          >
            <div className="animate-fade-in-up">
              <Badge
                variant="secondary"
                className="mb-5 gap-1.5 rounded-full border-sky-500/30 bg-sky-500/10 px-3 py-1 text-sky-700 dark:text-sky-300"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                {developer.status}
              </Badge>
            </div>

            <h1 className="animate-fade-in-up delay-100 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl">
              <span className="block text-muted-foreground">Hi, I&apos;m</span>
              <span className="mt-2 block text-gradient-sky-pink">
                {developer.name}
              </span>
            </h1>

            <p className="animate-fade-in-up delay-200 mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
              {developer.tagline}{" "}
              <span className="font-semibold text-foreground">
                {developer.role}
              </span>{" "}
              specializing in{" "}
              <span className="font-semibold text-pink-600 dark:text-pink-400">
                MERN stack
              </span>
              , SaaS architecture, and modern cloud solutions.
            </p>

            <div className="animate-fade-in-up delay-300 mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-sky-500" />
                {developer.location}
              </span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span className="flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-pink-500" />
                {developer.jobTitle}
              </span>
            </div>

            <div className="animate-fade-in-up delay-400 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              {/* Primary actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => scrollTo("#contact")}
                  size="lg"
                  className="group rounded-full bg-gradient-to-r from-sky-500 to-pink-500 px-8 text-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow-pink"
                >
                  <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
                  Hire Me
                </Button>
                <Button
                  onClick={() => scrollTo("#projects")}
                  size="lg"
                  variant="outline"
                  className="rounded-full border-sky-500/50 px-7 font-semibold hover:border-pink-500/60 hover:bg-sky-500/5"
                >
                  View Work
                </Button>
              </div>

              {/* Divider */}
              <div className="hidden h-8 w-px bg-gradient-to-b from-sky-500/30 to-pink-500/30 sm:block" />

              {/* Utility links */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => scrollTo("#pricing")}
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-muted-foreground hover:text-foreground"
                >
                  Pricing
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-muted-foreground hover:text-foreground"
                >
                  <a href={socials.github} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-1.5 h-4 w-4" />
                    GitHub
                  </a>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-wood hover:bg-wood/5"
                >
                  <a href="/api/resume" target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-1.5 h-4 w-4" />
                    Resume
                  </a>
                </Button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="animate-fade-in-up delay-500 mt-10 grid grid-cols-3 gap-3">
              {[
                { v: keyStats.projects, l: "Projects Built" },
                { v: "MERN", l: "Stack Specialist" },
                { v: keyStats.satisfaction, l: "Client Focused" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="glass rounded-2xl p-3 text-center shadow-soft"
                >
                  <div className="text-xl font-bold text-gradient-sky-pink sm:text-2xl">
                    {s.v}
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium text-muted-foreground sm:text-xs">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: 3D photo card */}
          <motion.div
            style={{ y: yPhoto }}
            className="relative md:col-span-1 lg:col-span-5"
          >
            {/* Real WebGL 3D scene behind the photo card (desktop only) */}
            <div className="pointer-events-none absolute inset-0 hidden sm:block">
              <Hero3D />
            </div>
            <div className="relative z-10">
              <HeroPhotoCard />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={() => scrollTo("#about")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { duration: 0.6, delay: 1.2 }, y: { duration: 2, repeat: Infinity } }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground sm:flex"
        aria-label="Scroll down"
      >
        <span className="text-xs font-medium uppercase tracking-widest">
          Scroll Down
        </span>
        <ArrowDown className="h-4 w-4" />
      </motion.button>
    </section>
  );
}

function HeroPhotoCard() {
  return (
    <>
      {/* Mobile: clean simple card — no decorations, no 3D */}
      <div className="sm:hidden">
        <div className="overflow-hidden rounded-2xl border border-white/40 bg-white shadow-glow-sky">
          <div className="flex items-center justify-between border-b border-sky-500/10 bg-gradient-to-r from-sky-50 to-pink-50 px-4 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <span className="font-mono text-[11px] font-medium text-muted-foreground">
              {developer.name} — Developer
            </span>
            <span className="text-sm">⚛️</span>
          </div>
          <div className="relative aspect-[3/4] overflow-hidden">
            <PuzzlePhoto
              src="/assets/dev-photo.jpg"
              alt={`${developer.name} — ${developer.role}`}
              className="h-full w-full"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-sky-900/50 via-transparent to-transparent" />
            <div className="animate-slide-in-left delay-700 absolute left-3 top-3 glass rounded-xl px-3 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300">
              ⚛️ React & Next.js
            </div>
            <div className="animate-slide-in-right delay-700 absolute bottom-3 right-3 glass rounded-xl px-3 py-1.5 text-xs font-semibold text-pink-700 dark:text-pink-300">
              Full-Stack Dev
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-sky-500/10 bg-white/80 text-center">
            <GithubStat icon={<Code2 className="h-3.5 w-3.5" />} label="Stack" value="MERN" />
            <GithubStat icon={<Star className="h-3.5 w-3.5" />} label="Focus" value="SaaS" />
            <GithubStat icon={<GitFork className="h-3.5 w-3.5" />} label="Status" value="Open" />
          </div>
        </div>
      </div>

      {/* Desktop: full fancy card with decorations and 3D */}
      <div className="hidden animate-fade-in-scale delay-300 relative mx-auto perspective-2000 sm:block sm:max-w-sm">
        <motion.div
          className="absolute -left-6 -top-6 h-20 w-20 rounded-full border-2 border-dashed border-sky-500/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full border-2 border-pink-500/40"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        {/* Dimensional dashed ring spinning around the card */}
        <div
          aria-hidden
          className="absolute -inset-5 rounded-[2.5rem] border-2 border-dashed border-sky-500/30"
          style={{ animation: "spin-3d-y 18s linear infinite", transformStyle: "preserve-3d" }}
        />
        <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-sky-500/30 via-pink-500/20 to-wood/20 blur-2xl" />

        {/* Crazy flipping chips orbiting the card */}
        <FloatingChip className="-left-10 top-8" delay="0s">
          ⚛️ React &amp; Next.js
        </FloatingChip>
        <FloatingChip className="-right-8 top-1/3" delay="1.2s">
          🚀 SaaS Expert
        </FloatingChip>
        <FloatingChip className="-bottom-6 left-8" delay="2.4s">
          ☁️ Cloud Native
        </FloatingChip>

        <motion.div
          whileHover={{ rotateY: 8, rotateX: -4, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          style={{ transformStyle: "preserve-3d" }}
          className="transform-3d relative overflow-hidden rounded-[2rem] border border-white/40 bg-white shadow-glow-sky"
        >
          <div className="flex items-center justify-between border-b border-sky-500/10 bg-gradient-to-r from-sky-50 to-pink-50 px-4 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <span className="font-mono text-[11px] font-medium text-muted-foreground">
              {developer.name} — Developer
            </span>
            <span className="text-sm">⚛️</span>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden">
            <PuzzlePhoto
              src="/assets/dev-photo.jpg"
              alt={`${developer.name} — ${developer.role}`}
              className="h-full w-full"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-sky-900/50 via-transparent to-transparent" />
            {/* Depth layers: badges flip above the photo plane */}
            <div
              className="absolute left-3 top-3"
              style={{ animation: "flutter-3d 9s ease-in-out infinite" }}
            >
              <div className="glass rounded-xl px-3 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300" style={{ transform: "perspective(400px) rotateY(-10deg)" }}>
                ⚛️ React &amp; Next.js
              </div>
            </div>
            <div
              className="absolute bottom-3 right-3"
              style={{ animation: "flutter-3d 11s ease-in-out infinite", animationDelay: "1.4s" }}
            >
              <div className="glass rounded-xl px-3 py-1.5 text-xs font-semibold text-pink-700 dark:text-pink-300" style={{ transform: "perspective(400px) rotateY(12deg)" }}>
                Full-Stack Dev
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-sky-500/10 bg-white/80 text-center">
            <GithubStat icon={<Code2 className="h-3.5 w-3.5" />} label="Stack" value="MERN" />
            <GithubStat icon={<Star className="h-3.5 w-3.5" />} label="Focus" value="SaaS" />
            <GithubStat icon={<GitFork className="h-3.5 w-3.5" />} label="Status" value="Open" />
          </div>
        </motion.div>
      </div>
    </>
  );
}

/** Flipping 3D chip that floats around the photo card. */
function FloatingChip({
  children,
  className,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  delay: string;
}) {
  return (
    <div
      aria-hidden
      className={`absolute z-20 ${className || ""}`}
      style={{ animation: `flutter-3d 8s ease-in-out infinite`, animationDelay: delay }}
    >
      <div
        className="glass rounded-xl px-3 py-1.5 text-xs font-semibold shadow-soft"
        style={{ transform: "perspective(500px) rotateY(-12deg)" }}
      >
        {children}
      </div>
    </div>
  );
}

function GithubStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-2 py-2.5">
      <span className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}
