"use client";

import dynamic from "next/dynamic";

// Floating client-only widgets: no SSR needed, hydrate after first paint.
// Lives in a client component because `ssr: false` is not allowed with
// next/dynamic inside Server Components.
const ChatWidget = dynamic(
  () => import("@/components/portfolio/chat-widget").then((m) => m.ChatWidget),
  { ssr: false }
);
const CommandPalette = dynamic(
  () =>
    import("@/components/portfolio/command-palette").then(
      (m) => m.CommandPalette
    ),
  { ssr: false }
);
const BackToTop = dynamic(
  () => import("@/components/portfolio/back-to-top").then((m) => m.BackToTop),
  { ssr: false }
);
const SectionTracker = dynamic(
  () =>
    import("@/components/portfolio/section-tracker").then(
      (m) => m.SectionTracker
    ),
  { ssr: false }
);

export function HomeWidgets() {
  return (
    <>
      <SectionTracker />
      <ChatWidget />
      <CommandPalette />
      <BackToTop />
    </>
  );
}
