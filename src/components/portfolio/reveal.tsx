"use client";

import { motion, useReducedMotion, type Variant } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const OFFSET = 32;

/**
 * 3D scroll entrance — every section, card and heading now flips in from
 * depth (rotateX/rotateY + translateZ) instead of a flat slide. Honors
 * prefers-reduced-motion (plain fade, no travel).
 */
function hiddenFor(direction: Direction, reduced: boolean, depth: number): Variant {
  if (reduced) return { opacity: 0 };
  switch (direction) {
    case "up":
      return { opacity: 0, y: OFFSET, rotateX: 14 * depth, scale: 0.94, z: -60 };
    case "down":
      return { opacity: 0, y: -OFFSET, rotateX: -14 * depth, scale: 0.94, z: -60 };
    case "left":
      return { opacity: 0, x: OFFSET, rotateY: -12 * depth, scale: 0.95, z: -40 };
    case "right":
      return { opacity: 0, x: -OFFSET, rotateY: 12 * depth, scale: 0.95, z: -40 };
    case "none":
      return { opacity: 0, scale: 0.9, rotateX: 10 * depth, z: -50 };
  }
}

/**
 * Reveal — single source of truth for scroll-triggered 3D entrances.
 * Animates once when scrolled into view; wraps children with a
 * perspective-3D transform so rotateX/rotateY look truly dimensional.
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.7,
  depth = 1,
  className,
  once = true,
  amount = 0.2,
  asChild = false,
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  /** 0–1.5: how crazy the 3D flip is. */
  depth?: number;
  className?: string;
  once?: boolean;
  amount?: number;
  asChild?: boolean;
}) {
  const reduced = useReducedMotion() ?? false;

  const variants = {
    hidden: hiddenFor(direction, reduced, depth),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      z: 0,
      transition: {
        duration: reduced ? 0.2 : duration,
        delay,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const style = reduced ? undefined : { transformPerspective: 1200 };

  if (asChild) {
    return (
      <motion.div variants={variants} style={style} className={className}>
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
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger — scroll-triggered container that cascades `<Reveal asChild>`
 * children with 3D flips.
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
