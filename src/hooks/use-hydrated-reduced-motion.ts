"use client";
import { useEffect, useState } from "react";
// Match the server on the first render; media preference updates after hydration.
// CSS applies reduced-motion rules immediately, before this effect runs.
export function useHydratedReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update(); mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduce;
}

