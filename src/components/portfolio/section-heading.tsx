"use client";

import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

interface SectionHeadingProps {
  emoji: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  className?: string;
}

/**
 * SectionHeading — 3D-fixed title with a spinning dimensional ring behind it
 * and a flipping emoji. The whole block still flips in via <Reveal>.
 */
export function SectionHeading({
  emoji,
  title,
  highlight,
  subtitle,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal direction="down" depth={1.1} className={cn("relative mx-auto max-w-3xl text-center", className)}>
      {/* 3D ornament ring behind the heading */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 opacity-40"
        style={{ transformStyle: "preserve-3d", perspective: "900px" } as React.CSSProperties}
      >
        <div
          className="absolute inset-0 rounded-full border-2 border-dashed border-sky-500/50"
          style={{ animation: "spin-3d-y 14s linear infinite", transformStyle: "preserve-3d" }}
        />
        <div
          className="absolute inset-8 rounded-full border border-pink-500/40"
          style={{ animation: "spin-3d-x 20s linear infinite", transformStyle: "preserve-3d" }}
        />
      </div>

      <span
        className="mb-3 inline-block text-4xl"
        style={{ animation: "flutter-3d 7s ease-in-out infinite", display: "inline-block" }}
      >
        {emoji}
      </span>
      <h2 className="gradient-anim text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        {title}{" "}
        {highlight && <span className="text-gradient-sky-pink">{highlight}</span>}
      </h2>
      {subtitle && (
        <p className="mt-4 font-sans text-base text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
      <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-gradient-to-r from-sky-400 via-pink-400 to-wood" />
    </Reveal>
  );
}
