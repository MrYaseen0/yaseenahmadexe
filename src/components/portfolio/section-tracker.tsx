"use client";

import { useSectionTracking } from "./use-section-tracking";

/**
 * Client wrapper to enable section tracking in a server component page.
 * Renders nothing — just activates the tracking hook.
 */
export function SectionTracker() {
  useSectionTracking();
  return null;
}
