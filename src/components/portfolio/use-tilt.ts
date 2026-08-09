"use client";

import { useRef, useState, useCallback } from "react";

/**
 * 3D tilt hook — tracks pointer position over an element and returns
 * rotateX / rotateY motion values plus handlers.
 */
export function useTilt(max = 12) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
  });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const ry = (px - 0.5) * 2 * max; // rotateY
      const rx = -(py - 0.5) * 2 * max; // rotateX
      setStyle({
        transform: `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`,
        transition: "transform 0.08s ease-out",
      });
      setGlare({ x: px * 100, y: py * 100, opacity: 0.25 });
    },
    [max]
  );

  const handleLeave = useCallback(() => {
    setStyle({
      transform:
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
      transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
    });
    setGlare((g) => ({ ...g, opacity: 0 }));
  }, []);

  return { ref, style, glare, handleMove, handleLeave };
}
