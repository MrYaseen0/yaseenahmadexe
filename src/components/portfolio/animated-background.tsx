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

const PARTICLE_COLORS = ["#38bdf8", "#ec4899", "#b08968", "#0ea5e9"];

/**
 * Animated 3D background with floating gradient blobs, grid, and particles.
 * Uses CSS 3D perspective for depth. Purely decorative.
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
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-rose-950/40" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-60" />

      {/* Floating blobs */}
      <motion.div
        className="absolute -top-32 -left-32 h-[32rem] w-[32rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.45), transparent 70%)",
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
            "radial-gradient(circle, rgba(236,72,153,0.4), transparent 70%)",
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
            "radial-gradient(circle, rgba(176,137,104,0.3), transparent 70%)",
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

      {/* Crazy 3D wireframe shapes — perspective + preserve-3d, pure CSS */}
      <div className="perspective-800 absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        <div
          className="bg-3d-square"
          style={{ left: "8%", top: "18%", ["--size" as any]: "110px", ["--spin" as any]: "22s", ["--face" as any]: "rgba(56,189,248,0.45)", ["--glow" as any]: "rgba(56,189,248,0.45)" }}
        />
        <div
          className="bg-3d-ring"
          style={{ right: "10%", top: "12%", ["--size" as any]: "150px", ["--spin" as any]: "16s", ["--face" as any]: "rgba(236,72,153,0.4)" }}
        />
        <div
          className="bg-3d-coin"
          style={{ right: "22%", bottom: "16%", ["--size" as any]: "90px", ["--spin" as any]: "8s", ["--face" as any]: "rgba(176,137,104,0.5)" }}
        />
        <div
          className="bg-3d-square"
          style={{ left: "16%", bottom: "10%", ["--size" as any]: "74px", ["--spin" as any]: "30s", ["--face" as any]: "rgba(236,72,153,0.4)", ["--glow" as any]: "rgba(236,72,153,0.4)" }}
        />
        <div
          className="bg-3d-ring"
          style={{ left: "45%", top: "6%", ["--size" as any]: "64px", ["--spin" as any]: "12s", ["--face" as any]: "rgba(56,189,248,0.35)" }}
        />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-white/20 dark:from-black/30 dark:to-black/10" />
    </div>
  );
}
