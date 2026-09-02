"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";

/**
 * Real WebGL 3D hero scene (react-three-fiber).
 *
 * - Animated, distorted torus knot in brand colors (sky/pink)
 * - Orbiting gem spheres + sparkle field
 * - Mouse parallax driven by a window listener (canvas stays
 *   pointer-events:none so hero buttons remain clickable)
 * - Lazy-loaded by the parent with ssr:false; renders nothing until
 *   WebGL is confirmed available, then falls back to a CSS orb.
 */

type MouseRef = { x: number; y: number };

const mouse: MouseRef = { x: 0, y: 0 };
let listenerAttached = false;

function attachMouseListener() {
  if (listenerAttached || typeof window === "undefined") return;
  listenerAttached = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true }
  );
}

function Scene() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    // Gentle spin + mouse parallax (lerped for smoothness)
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      t * 0.18 + mouse.x * 0.45,
      3,
      delta
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      mouse.y * 0.3,
      3,
      delta
    );
  });

  return (
    <group ref={group}>
      {/* Main distorted knot */}
      <Float speed={2} rotationIntensity={0.6} floatIntensity={1.1}>
        <mesh>
          <torusKnotGeometry args={[1, 0.3, 200, 32]} />
          <MeshDistortMaterial
            color="#38bdf8"
            emissive="#0c4a6e"
            emissiveIntensity={0.45}
            roughness={0.18}
            metalness={0.55}
            distort={0.38}
            speed={2.2}
          />
        </mesh>
      </Float>

      {/* Orbiting gems */}
      <Float speed={3} rotationIntensity={1} floatIntensity={1.6}>
        <mesh position={[2.1, 0.9, -0.6]}>
          <icosahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial color="#ec4899" roughness={0.2} metalness={0.6} />
        </mesh>
      </Float>
      <Float speed={2.4} rotationIntensity={1.2} floatIntensity={1.4}>
        <mesh position={[-2.2, -0.8, 0.4]}>
          <octahedronGeometry args={[0.26, 0]} />
          <meshStandardMaterial color="#b08968" roughness={0.25} metalness={0.5} />
        </mesh>
      </Float>
      <Float speed={2.8} rotationIntensity={0.9} floatIntensity={1.8}>
        <mesh position={[1.6, -1.3, 1.1]}>
          <dodecahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color="#7dd3fc" roughness={0.15} metalness={0.65} />
        </mesh>
      </Float>

      {/* Sparkles */}
      <Sparkles count={70} scale={9} size={3} speed={0.35} color="#ec4899" opacity={0.7} />
      <Sparkles count={50} scale={7} size={2} speed={0.25} color="#38bdf8" opacity={0.6} />

      {/* Ambient 3D particle field */}
      <Stars radius={45} depth={35} count={1400} factor={2.6} saturation={0.4} fade speed={0.7} />
    </group>
  );
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export default function Hero3D() {
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    attachMouseListener();
    // rAF callback = not a synchronous setState inside the effect body.
    const id = requestAnimationFrame(() => {
      setReady(true);
      setWebgl(supportsWebGL());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Server + first client render: nothing (avoids hydration mismatch).
  if (!ready) return null;

  if (!webgl) {
    // Graceful fallback: CSS gradient orb
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="relative h-[26rem] w-[26rem] max-w-[80vw] animate-pulse-slow rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.45),rgba(236,72,153,0.28),transparent_65%)] blur-md" />
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <ambientLight intensity={0.55} />
        <pointLight position={[4, 4, 4]} intensity={55} color="#38bdf8" />
        <pointLight position={[-4, -2, 3]} intensity={45} color="#ec4899" />
        <pointLight position={[0, -4, -4]} intensity={30} color="#b08968" />
        <Scene />
      </Canvas>
    </div>
  );
}
