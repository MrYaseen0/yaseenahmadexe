"use client";

import dynamic from "next/dynamic";

// Client wrapper: ssr:false dynamic imports are not allowed in Server
// Components (page.tsx), so the WebGL ambient scene mounts here instead.
const Ambient3D = dynamic(() => import("@/components/portfolio/three/ambient3d"), {
  ssr: false,
  loading: () => null,
});

export function Ambient3DBackground() {
  return <Ambient3D />;
}
