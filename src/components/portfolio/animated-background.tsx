"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  drift: number;
  duration: number;
  delay: number;
  color: string;
}

/** VIRIDIA field palette: greens only, no off-theme hues. */
const PARTICLE_COLORS = ["#4ade80", "#34d399", "#86efac", "#22c55e"];

/**
 * Animated field-green background with floating gradient blobs, grid, and
 * particles. Purely decorative. Matches the VIRIDIA dark-green hero in both
 * themes (pale field wash in light mode, deep field in dark mode).
 * Particles are generated client-side to avoid hydration mismatch.
 */
export function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate random particle positions client-side to avoid hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(
      Array.from({ length: 18 }).map((_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 4 + Math.random() * 8,
        drift: (Math.random() - 0.5) * 60,
        duration: 6 + Math.random() * 10,
        delay: Math.random() * 5,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      }))
    );
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-[#0a0f0a] dark:via-[#0d140d] dark:to-[#101a10]" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-60" />

      {/* Floating blobs */}
      <motion.div
        className="absolute -top-32 -left-32 h-[32rem] w-[32rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(74,222,128,0.45), transparent 70%)",
        }}
        animate={{
          x: [0, 60, -30, 0],
          y: [0, 40, 80, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-40 h-[34rem] w-[34rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(52,211,153,0.4), transparent 70%)",
        }}
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 60, -40, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/4 h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(34,197,94,0.3), transparent 70%)",
        }}
        animate={{
          x: [0, 40, -50, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.2, 0.85, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating particles (client-only) */}
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute block rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: 0.5,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, p.drift, 0],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-white/20 dark:from-black/30 dark:to-black/10" />
    </div>
  );
}
