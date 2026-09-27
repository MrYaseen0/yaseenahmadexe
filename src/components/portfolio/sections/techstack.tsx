"use client";

import { SectionHeading } from "../section-heading";
import { Reveal, Stagger } from "../reveal";
import { Editable, useContent } from "@/components/portfolio/content-editor";

interface Skill {
  name: string;
  level: number;
}

export function TechStack() {
  const { tj } = useContent();
  const techStack = tj<Record<string, Skill[]>>("techstack.groups");
  return (
    <section id="techstack" className="relative border-t border-(--hairline) bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading ek="techstack" />

        <Editable id="techstack.groups" json label="Skill groups" />
        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.12}>
          {Object.entries(techStack).map(([category, skills]) => (
            <Reveal asChild key={category}>
              <SkillGroup category={category} skills={skills} />
            </Reveal>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function SkillGroup({ category, skills }: { category: string; skills: Skill[] }) {
  return (
    <div className="rounded-xl border border-(--hairline) bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(16,20,16,0.06)]">
      {/* Mono eyebrow label */}
      <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-(--accent)">
        {category}
      </h3>

      {/* Tech chips — static grid, no brand-color explosions */}
      <div className="mt-5 flex flex-wrap gap-2">
        {skills.map((s) => (
          <span
            key={s.name}
            className="rounded-full border border-(--hairline) bg-white px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-(--muted) transition-colors hover:border-[#101410] hover:text-(--ink)"
          >
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
