"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * Small decorative 3D scene (spinning wireframe cube + orbiting torus ring)
 * used inside content sections. Lazy-loaded ssr:false, desktop only,
 * pointer-events none. Falls back to nothing when WebGL is unavailable.
 */

function Cube() {
  const group = useRef<THREE.Group>(null);
  const torus = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.x += delta * 0.35;
      group.current.rotation.y += delta * 0.5;
    }
    if (torus.current) {
      torus.current.rotation.y += delta * 0.8;
      torus.current.rotation.z += delta * 0.3;
    }
    void state;
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh ref={group}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial
            color="#38bdf8"
            wireframe
            transparent
            opacity={0.5}
          />
        </mesh>
        <mesh ref={torus} scale={1.9}>
          <torusGeometry args={[1.1, 0.06, 12, 60]} />
          <meshStandardMaterial
            color="#ec4899"
            roughness={0.3}
            metalness={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      </Float>
      <mesh>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color="#b08968" roughness={0.25} metalness={0.6} />
      </mesh>
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

export default function Cube3D() {
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setReady(true);
      setWebgl(supportsWebGL());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (!ready || !webgl) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[4, 4, 4]} intensity={45} color="#38bdf8" />
        <pointLight position={[-4, -2, 3]} intensity={35} color="#ec4899" />
        <Cube />
      </Canvas>
    </div>
  );
}
