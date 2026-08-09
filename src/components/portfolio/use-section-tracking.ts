"use client";

import { useEffect, useRef } from "react";

/**
 * Tracks section views anonymously when they scroll into view.
 * Privacy-respecting: only records section name + path, no PII.
 */
export function useSectionTracking() {
  const trackedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const id = entry.target.id;
            if (id && !trackedRef.current.has(id)) {
              trackedRef.current.add(id);
              // Fire and forget — never block UX
              fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  section: id,
                  path: window.location.pathname,
                  referrer: document.referrer || null,
                }),
              }).catch(() => {});
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe all sections with IDs
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, []);
}
