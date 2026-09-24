"use client";

import { useEffect, useRef, useState } from "react";
import { Editable, useContent } from "@/components/portfolio/content-editor";

interface Stat {
  value: number;
  suffix: string;
  label: string;
  icon: string;
  color: string;
}

function useCountUp(target: number, duration = 1600, start: boolean) {
  const [count, setCount] = useState(target);

  const animKey = `${start}:${target}:${duration}`;
  const [prevAnimKey, setPrevAnimKey] = useState(animKey);
  if (animKey !== prevAnimKey) {
    setPrevAnimKey(animKey);
    if (start) setCount(0);
  }

  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);

  return count;
}

function useInViewObserver<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export function AchievementStats() {
  const { ref, inView } = useInViewObserver<HTMLDivElement>(0.2);
  const { tj } = useContent();
  const stats = tj<Stat[]>("stats.items");

  return (
    <section className="relative border-t border-(--hairline) bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Editable id="stats.items" json label="Stat counters" />
        <div
          ref={ref}
          className="grid grid-cols-2 gap-y-10 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <StatCell key={stat.label} stat={stat} start={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCell({ stat, start }: { stat: Stat; start: boolean }) {
  const count = useCountUp(stat.value, 1600, start);

  return (
    <div className="flex flex-col items-center px-6 text-center lg:border-l lg:border-(--hairline) lg:first:border-l-0">
      <div className="font-display text-5xl tracking-tight text-(--ink) sm:text-6xl">
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-(--muted)">
        {stat.label}
      </div>
    </div>
  );
}
