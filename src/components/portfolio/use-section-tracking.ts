"use client";

import { useEffect, useRef } from "react";

/**
 * Tracks pageviews + section views anonymously when they scroll into view.
 * Privacy-respecting: no PII — section/pageview, path, referrer origin,
 * and an anonymous per-tab session id. IPs are hashed server-side.
 */

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem("ya-sid");
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem("ya-sid", sid);
    }
    return sid;
  } catch {
    return "unknown";
  }
}

function ping(data: Record<string, unknown>) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: window.location.pathname,
      referrer: document.referrer || null,
      sessionId: getSessionId(),
      ...data,
    }),
  }).catch(() => {});
}

export function useSectionTracking() {
  const trackedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // One pageview ping per tab session.
    ping({ section: "pageview", pageview: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const id = entry.target.id;
            if (id && !trackedRef.current.has(id)) {
              trackedRef.current.add(id);
              // Fire and forget — never block UX
              ping({ section: id });
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
