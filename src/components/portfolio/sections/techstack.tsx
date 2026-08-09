"use client";

import { SectionHeading } from "../section-heading";
import { techStack } from "@/lib/portfolio-data";

export function TechStack() {
  return (
    <section id="techstack" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          emoji="🛠️"
          title="My"
          highlight="Skills"
          subtitle="Technologies and tools I work with to build amazing products."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {Object.entries(techStack).map(([category, skills], ci) => (
            <SkillColumn key={category} category={category} skills={skills} index={ci} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillColumn({
  category,
  skills,
  index,
}: {
  category: string;
  skills: { name: string; level: number }[];
  index: number;
}) {
  return (
    <div
      className="animate-fade-in-up glass rounded-2xl border border-sky-500/15 p-6 shadow-soft"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <div className="mb-5 flex items-center gap-2">
        <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-sky-400 to-pink-400" />
        <h3 className="text-lg font-bold">{category}</h3>
      </div>

      <div className="space-y-4">
        {skills.map((s, i) => (
          <SkillBar key={s.name} skill={s} delay={i * 0.1 + index * 0.15} />
        ))}
      </div>
    </div>
  );
}

function SkillBar({
  skill,
  delay,
}: {
  skill: { name: string; level: number };
  delay: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium">{skill.name}</span>
        <span className="font-mono text-xs font-bold text-pink-600 dark:text-pink-400">
          {skill.level}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-sky-400 via-pink-400 to-wood"
          style={{
            width: `${skill.level}%`,
            animation: `grow-width 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both`,
            transformOrigin: "left",
          }}
        >
          <div className="absolute inset-0 animate-gradient bg-gradient-to-r from-transparent via-white/40 to-transparent bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  );
}
