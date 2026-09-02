"use client";

import { useRef, useState, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * TiltCard — wrap ANY card to give it an interactive 3D tilt + glare.
 * Pointer-driven rotateX/rotateY with perspective, springy return and a
 * moving light sheen. Honors prefers-reduced-motion.
 */
export function TiltCard({
  children,
  className,
  max = 10,
  scale = 1.03,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [hovered, setHovered] = useState(false);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 2 * max;
    const rx = -(py - 0.5) * 2 * max;
    setStyle({
      transform: `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`,
      transition: "transform 90ms ease-out",
    });
    setGlarePos({ x: px * 100, y: py * 100, opacity: 0.35 });
  };

  const onLeave = () => {
    setStyle({
      transform: "perspective(1100px) rotateX(0deg) rotateY(0deg) scale(1)",
      transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
    });
    setGlarePos((g) => ({ ...g, opacity: 0 }));
    setHovered(false);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseEnter={() => setHovered(true)}
      style={style}
      className={cn("relative transform-3d", className)}
    >
      {children}
      {glare && hovered && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.35), transparent 60%)`,
          }}
        />
      )}
    </div>
  );
}
