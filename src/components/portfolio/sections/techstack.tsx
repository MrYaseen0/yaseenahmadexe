"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "../section-heading";
import { Reveal, Stagger } from "../reveal";
import { Editable, useContent } from "@/components/portfolio/content-editor";

export function TechStack() {
  const { tj } = useContent();
  const techStack = tj<Record<string, { name: string; level: number }[]>>("techstack.groups");
  return (
    <section id="techstack" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading ek="techstack" />

        <Editable id="techstack.groups" json label="Skill groups" />
        <Stagger className="mt-14 grid gap-6 lg:grid-cols-3" gap={0.12}>
          {Object.entries(techStack).map(([category, skills]) => (
            <SkillColumn key={category} category={category} skills={skills} />
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function SkillColumn({
  category,
  skills,
}: {
  category: string;
  skills: { name: string; level: number }[];
}) {
  return (
    <Reveal
      asChild
      className="glass rounded-2xl border border-green-500/15 p-6 shadow-soft"
    >
      <div className="mb-5 flex items-center gap-2">
        <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-green-400 to-emerald-400" />
        <h3 className="text-lg font-bold">{category}</h3>
      </div>

      <div className="space-y-4">
        {skills.map((s, i) => (
          <SkillBar key={s.name} skill={s} delay={i * 0.08} />
        ))}
      </div>
    </Reveal>
  );
}

function SkillBar({
  skill,
  delay,
}: {
  skill: { name: string; level: number };
  delay: number;
}) {
  const reduced = useReducedMotion() ?? false;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium">{skill.name}</span>
        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
          {skill.level}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="relative h-full rounded-full bg-gradient-to-r from-green-400 via-emerald-400 to-wood"
          style={{ transformOrigin: "left" }}
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{
            duration: reduced ? 0.2 : 1.1,
            delay: reduced ? 0 : delay,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="absolute inset-0 animate-gradient bg-gradient-to-r from-transparent via-white/40 to-transparent bg-[length:200%_100%]" />
        </motion.div>
      </div>
    </div>
  );
}
