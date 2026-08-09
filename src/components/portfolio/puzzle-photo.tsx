"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PuzzlePhoto — profile picture that cracks apart, collapses, then
 * reconnects like a puzzle on page load. Works on mobile + desktop.
 *
 * Animation sequence (quick form, ~3.5s total):
 *   1. Image shows intact (0-0.5s)
 *   2. Crack lines appear across the image (0.5-0.8s)
 *   3. Pieces scatter outward + fade (0.8-1.6s) — "collapse"
 *   4. Pieces fly back in from scattered positions, reconnecting (1.6-2.8s)
 *   5. Crack lines fade out, image is whole again (2.8-3.5s)
 */
export function PuzzlePhoto({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [phase, setPhase] = useState<"intact" | "cracking" | "scattered" | "reassembling" | "done">("intact");
  const [showCracks, setShowCracks] = useState(false);
  const [scatter, setScatter] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const t1 = setTimeout(() => {
      setPhase("cracking");
      setShowCracks(true);
    }, 500);
    const t2 = setTimeout(() => {
      setPhase("scattered");
      setScatter(true);
    }, 900);
    const t3 = setTimeout(() => {
      setPhase("reassembling");
      setScatter(false);
    }, 1700);
    const t4 = setTimeout(() => {
      setPhase("done");
      setShowCracks(false);
    }, 2900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // 6 puzzle pieces in a 3x2 grid, each with a scatter target
  const pieces = [
    { id: 0, row: 0, col: 0, dx: -120, dy: -80, rot: -25 },
    { id: 1, row: 0, col: 1, dx: 0, dy: -140, rot: 15 },
    { id: 2, row: 0, col: 2, dx: 130, dy: -70, rot: -20 },
    { id: 3, row: 1, col: 0, dx: -110, dy: 90, rot: 30 },
    { id: 4, row: 1, col: 1, dx: 0, dy: 130, rot: -10 },
    { id: 5, row: 1, col: 2, dx: 120, dy: 100, rot: 22 },
  ];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* The full image (visible when not animating) */}
      <motion.img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        initial={{ opacity: 1 }}
        animate={{
          opacity: phase === "scattered" || phase === "reassembling" ? 0 : 1,
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Puzzle pieces overlay (visible during scatter + reassemble) */}
      <AnimatePresence>
        {(phase === "scattered" || phase === "reassembling") && (
          <div className="absolute inset-0">
            {pieces.map((p) => (
              <motion.div
                key={p.id}
                className="absolute overflow-hidden"
                style={{
                  width: "33.333%",
                  height: "50%",
                  left: `${p.col * 33.333}%`,
                  top: `${p.row * 50}%`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{
                  x: scatter ? p.dx : 0,
                  y: scatter ? p.dy : 0,
                  opacity: scatter ? 0.3 : 1,
                  rotate: scatter ? p.rot : 0,
                }}
                transition={{
                  duration: scatter ? 0.7 : 1.0,
                  ease: scatter ? "easeIn" : [0.22, 1, 0.36, 1],
                }}
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{
                    width: "300%",
                    height: "200%",
                    marginLeft: `${-p.col * 100}%`,
                    marginTop: `${-p.row * 100}%`,
                    objectFit: "cover",
                  }}
                />
                {/* piece border for puzzle feel */}
                <div className="absolute inset-0 border border-white/30 shadow-inner" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Crack lines overlay */}
      <AnimatePresence>
        {showCracks && (
          <motion.svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "scattered" ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Diagonal crack 1 */}
            <motion.path
              d="M 10 20 L 35 45 L 30 55 L 55 75 L 50 90"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="0.4"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
            {/* Diagonal crack 2 */}
            <motion.path
              d="M 90 15 L 65 40 L 70 50 L 45 70 L 55 95"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="0.4"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
            />
            {/* Horizontal crack */}
            <motion.path
              d="M 0 48 L 25 50 L 50 47 L 75 51 L 100 49"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="0.3"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
            />
            {/* Branch crack */}
            <motion.path
              d="M 35 45 L 50 35 L 60 30"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="0.25"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.25, ease: "easeOut", delay: 0.15 }}
            />
            <motion.path
              d="M 65 40 L 80 55 L 88 65"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="0.25"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.25, ease: "easeOut", delay: 0.18 }}
            />
          </motion.svg>
        )}
      </AnimatePresence>

      {/* Flash effect at moment of crack */}
      <AnimatePresence>
        {phase === "cracking" && (
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
