"use client";

import { useEffect, useRef } from "react";

/**
 * Tracks section views anonymously when they scroll into view.
 * Privacy-respecting: only records section name + path, no PII.
 *
 * Dedup strategy: a section is recorded at most ONCE per browser session
 * (in-memory Set + sessionStorage key). Reloading the page refreshes the
 * session, so repeat visits are still counted, but scrolling up/down within
 * a visit never floods the Visit table.
 */
export function useSectionTracking() {
  const trackedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Restore this session's already-tracked sections.
    try {
      const stored = sessionStorage.getItem("ya-tracked-sections");
      if (stored) {
        JSON.parse(stored).forEach((id: unknown) => {
          if (typeof id === "string") trackedRef.current.add(id);
        });
      }
    } catch {
      // sessionStorage unavailable — in-memory dedupe still applies
    }

    const mark = (id: string) => {
      trackedRef.current.add(id);
      try {
        sessionStorage.setItem(
          "ya-tracked-sections",
          JSON.stringify(Array.from(trackedRef.current))
        );
      } catch {
        // best-effort
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const id = entry.target.id;
            if (id && !trackedRef.current.has(id)) {
              mark(id);
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
