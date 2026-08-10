"use client";

import { motion, useReducedMotion, type Variant } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const OFFSET = 24;

function hiddenFor(direction: Direction, reduced: boolean): Variant {
  if (reduced) return { opacity: 0 };
  switch (direction) {
    case "up":
      return { opacity: 0, y: OFFSET };
    case "down":
      return { opacity: 0, y: -OFFSET };
    case "left":
      return { opacity: 0, x: OFFSET };
    case "right":
      return { opacity: 0, x: -OFFSET };
    case "none":
      return { opacity: 0 };
  }
}

/**
 * Reveal — the single source of truth for scroll-triggered entrances.
 *
 * Animates once, when the element scrolls into view (not on page load), so
 * sections below the fold animate when the visitor actually reaches them.
 * Honors prefers-reduced-motion (fades only, no travel). Wrap a group with
 * `stagger` and give children `<Reveal asChild>` to cascade them.
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className,
  once = true,
  amount = 0.2,
  asChild = false,
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
  asChild?: boolean;
}) {
  const reduced = useReducedMotion() ?? false;

  const variants = {
    hidden: hiddenFor(direction, reduced),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: reduced ? 0.2 : duration,
        delay,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  // asChild: participate in a parent Stagger's orchestration (no own trigger).
  if (asChild) {
    return (
      <motion.div variants={variants} className={className}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger — a scroll-triggered container that cascades its `<Reveal asChild>`
 * children. Trigger lives here; children inherit the reveal timing.
 */
export function Stagger({
  children,
  className,
  gap = 0.08,
  delay = 0,
  once = true,
  amount = 0.2,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  delay?: number;
  once?: boolean;
  amount?: number;
}) {
  const reduced = useReducedMotion() ?? false;

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : gap,
        delayChildren: delay,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
