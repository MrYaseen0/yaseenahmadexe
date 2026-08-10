"use client";

import { useEffect, useRef, useState } from "react";
import {
  Rocket,
  Users,
  Clock,
  Star,
  Heart,
  Code,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket,
  Users,
  Clock,
  Star,
  Heart,
  Code,
};

interface CounterProps {
  value: number;
  suffix?: string;
  duration?: number;
}

function useCountUp(target: number, duration = 2000, start: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // easeOutExpo
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

  return (
    <section className="relative py-16 sm:py-20">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div
          ref={ref}
          className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/5 via-white/60 to-pink-500/5 p-6 shadow-soft dark:from-sky-500/5 dark:via-slate-900/60 dark:to-pink-500/5 sm:p-10"
        >
          {/* decorative grid */}
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-pink-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: 15, suffix: "+", label: "Projects Built", icon: "Rocket", color: "text-sky-500" },
              { value: 3, suffix: "+", label: "Years Experience", icon: "Clock", color: "text-wood" },
              { value: 100, suffix: "%", label: "Learning Focus", icon: "Heart", color: "text-pink-500" },
              { value: 10, suffix: "K+", label: "Lines of Code", icon: "Code", color: "text-wood" },
            ].map((stat, i) => (
              <StatCard key={stat.label} stat={stat} start={inView} delay={i * 100} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  stat,
  start,
  delay,
}: {
  stat: { value: number; suffix: string; label: string; icon: string; color: string };
  start: boolean;
  delay: number;
}) {
  const count = useCountUp(stat.value, 2000, start);
  const Icon = iconMap[stat.icon] || Rocket;

  return (
    <div
      className="group relative flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-soft ring-1 ring-sky-500/10 transition-all group-hover:ring-pink-500/30 dark:bg-slate-800 ${stat.color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-extrabold text-gradient-sky-pink sm:text-3xl">
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
        {stat.label}
      </div>
    </div>
  );
}
