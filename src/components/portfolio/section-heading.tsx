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

export function SectionHeading({
  emoji,
  title,
  highlight,
  subtitle,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal className={cn("mx-auto max-w-2xl text-center", className)}>
      <span className="mb-3 inline-block text-4xl">{emoji}</span>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        {title}{" "}
        {highlight && <span className="text-gradient-sky-pink">{highlight}</span>}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
      <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-gradient-to-r from-sky-400 via-pink-400 to-wood" />
    </Reveal>
  );
}
