"use client";

import { Editable, useContent } from "@/components/portfolio/content-editor";

export function Marquee() {
  const { tj } = useContent();
  const items = tj<string[]>("marquee.items");
  return (
    <section aria-label="Highlights" className="border-y border-(--hairline) bg-white py-4">
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      <Editable id="marquee.items" json label="Marquee items" />
      <div className="flex overflow-hidden">
        <div
          className="flex shrink-0 items-center motion-reduce:animate-none"
          style={{ animation: "marquee 40s linear infinite" }}
        >
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {items.map((item) => (
                <span key={`${copy}-${item}`} className="flex shrink-0 items-center">
                  <span className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.2em] text-(--muted)">
                    {item}
                  </span>
                  <span className="mx-6 inline-block h-1 w-1 shrink-0 rounded-full bg-(--accent)" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
