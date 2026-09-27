"use client";

import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";
import { Editable, useContentOptional } from "./content-editor";

interface SectionHeadingProps {
  /** Optional mono eyebrow label above the headline. Defaults to the `ek` key. */
  eyebrow?: string;
  /** Required when `ek` is not set; optional otherwise (loaded from registry). */
  title?: string;
  highlight?: string;
  subtitle?: string;
  className?: string;
  /**
   * Visual-editor key prefix (e.g. "services"). When set, the title /
   * highlight / subtitle are loaded from editable content keys
   * `${ek}.title`, `${ek}.highlight`, `${ek}.subtitle`,
   * each with its own pencil in edit mode.
   */
  ek?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  className,
  ek,
}: SectionHeadingProps) {
  const content = useContentOptional();
  const editable = !!ek && !!content;
  const eyebrowText = eyebrow ?? ek;

  return (
    <Reveal className={cn("max-w-2xl text-left", className)}>
      {eyebrowText && (
        <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">
          {eyebrowText}
        </p>
      )}
      <h2 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        {editable ? <Editable id={`${ek}.title`} /> : title}{" "}
        {editable ? (
          <Editable
            id={`${ek}.highlight`}
            as="span"
            className="text-accent"
          />
        ) : (
          highlight && <span className="text-accent">{highlight}</span>
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
      <span
        aria-hidden="true"
        className="mt-5 block h-[3px] w-8 rounded-full bg-accent"
      />
    </Reveal>
  );
}
