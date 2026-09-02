"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

/**
 * Full-page ambient 3D background (WebGL).
 *
 * Fixed behind the whole site: slowly drifting wireframe shapes + starfield
 * + soft light beams, with gentle mouse parallax. Purely decorative:
 * pointer-events none, desktop only (hidden < md), lazy-loaded ssr:false so
 * it can never break SSR/hydration or mobile performance.
 */

type MouseRef = { x: number; y: number };
const mouse: MouseRef = { x: 0, y: 0 };
let attached = false;

function attach() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true }
  );
}

function Drift({
  position,
  scale = 1,
  speed = 0.4,
  color = "#38bdf8",
  wire = true,
  kind = "octa",
}: {
  position: [number, number, number];
  scale?: number;
  speed?: number;
  color?: string;
  wire?: boolean;
  kind?: "octa" | "torus" | "icosa";
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    ref.current.rotation.x += delta * 0.12;
    ref.current.rotation.y += delta * 0.18;
    ref.current.position.y = position[1] + Math.sin(t) * 0.35;
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      {kind === "torus" ? (
        <torusGeometry args={[1, 0.32, 12, 40]} />
      ) : kind === "icosa" ? (
        <icosahedronGeometry args={[1, 0]} />
      ) : (
        <octahedronGeometry args={[1, 0]} />
      )}
      <meshStandardMaterial
        color={color}
        wireframe={wire}
        transparent
        opacity={0.22}
        roughness={0.4}
        metalness={0.3}
      />
    </mesh>
  );
}

function Scene() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      mouse.x * 0.18,
      2,
      delta
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      mouse.y * 0.12,
      2,
      delta
    );
  });

  return (
    <group ref={group}>
      <Drift position={[-5.5, 1.6, -4]} scale={1.4} color="#ec4899" kind="torus" />
      <Drift position={[5.8, -1.2, -6]} scale={1.1} color="#38bdf8" kind="icosa" />
      <Drift position={[3.6, 3.1, -8]} scale={0.9} color="#b08968" kind="octa" />
      <Drift position={[-4.2, -2.8, -7]} scale={0.8} color="#7dd3fc" kind="octa" />
      <Drift position={[0.4, 4.2, -9]} scale={1.3} color="#f9a8d4" kind="torus" />
      <Stars radius={60} depth={40} count={2200} factor={3} saturation={0.35} fade speed={0.5} />
    </group>
  );
}

function supportsWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

export default function Ambient3D() {
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    attach();
    const id = requestAnimationFrame(() => {
      setReady(true);
      setWebgl(supportsWebGL());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (!ready || !webgl) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 hidden md:block"
    >
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[6, 4, 6]} intensity={40} color="#38bdf8" />
        <pointLight position={[-6, -4, 4]} intensity={35} color="#ec4899" />
        <Scene />
      </Canvas>
    </div>
  );
}
