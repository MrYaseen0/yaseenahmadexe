"use client";

import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";
import { Editable, useContentOptional } from "./content-editor";

interface SectionHeadingProps {
  /** Required when `ek` is not set; optional otherwise (loaded from registry). */
  emoji?: string;
  /** Required when `ek` is not set; optional otherwise (loaded from registry). */
  title?: string;
  highlight?: string;
  subtitle?: string;
  className?: string;
  /**
   * Visual-editor key prefix (e.g. "services"). When set, the emoji / title /
   * highlight / subtitle are loaded from editable content keys
   * `${ek}.emoji`, `${ek}.title`, `${ek}.highlight`, `${ek}.subtitle`,
   * each with its own pencil in edit mode.
   */
  ek?: string;
}

export function SectionHeading({
  emoji,
  title,
  highlight,
  subtitle,
  className,
  ek,
}: SectionHeadingProps) {
  const content = useContentOptional();
  const editable = !!ek && !!content;

  return (
    <Reveal className={cn("mx-auto max-w-2xl text-center", className)}>
      <span className="mb-3 inline-block text-4xl">
        {editable ? <Editable id={`${ek}.emoji`} /> : emoji}
      </span>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        {editable ? <Editable id={`${ek}.title`} /> : title}{" "}
        {editable ? (
          <Editable
            id={`${ek}.highlight`}
            as="span"
            className="text-gradient-viridia"
          />
        ) : (
          highlight && (
            <span className="text-gradient-viridia">{highlight}</span>
          )
        )}
      </h2>
      {editable ? (
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          <Editable id={`${ek}.subtitle`} />
        </p>
      ) : (
        subtitle && (
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {subtitle}
          </p>
        )
      )}
      <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-gradient-to-r from-green-400 via-emerald-400 to-wood" />
    </Reveal>
  );
}
