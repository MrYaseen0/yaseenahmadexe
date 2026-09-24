"use client";

import { Briefcase, MapPin, Check, GraduationCap, Building2 } from "lucide-react";
import { SectionHeading } from "../section-heading";
import { Reveal } from "../reveal";
import { Editable, useContent } from "@/components/portfolio/content-editor";

interface ExperienceEntry {
  role: string;
  company: string;
  location: string;
  period: string;
  type: string;
  description: string;
  achievements: string[];
  tech: string[];
  current: boolean;
}

export function Experience() {
  const { tj } = useContent();
  const experiences = tj<ExperienceEntry[]>("experience.items");
  return (
    <section id="experience" className="relative border-t border-(--hairline) bg-(--alt) py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading ek="experience" />

        <Editable id="experience.items" json label="Timeline entries" />
        {/* Timeline — left hairline line, accent dots */}
        <div className="relative mt-14 pl-9">
          <div className="absolute bottom-2 left-[8px] top-2 w-px bg-(--hairline)" />

          <div className="space-y-8">
            {experiences.map((exp) => (
              <Reveal key={exp.role + exp.company}>
                <TimelineItem exp={exp} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="text-sm text-(--muted)">
            <Editable id="experience.ctaText" />{" "}
            <button
              onClick={() =>
                document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })
              }
              className="font-semibold text-(--ink) underline-offset-4 transition-colors hover:text-(--accent) hover:underline"
            >
              <Editable id="experience.ctaLink" />
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ exp }: { exp: ExperienceEntry }) {
  const Icon =
    exp.type === "Education" ? GraduationCap : exp.type === "Freelance" ? Briefcase : Building2;

  return (
    <div className="relative">
      {/* Accent dot on the line */}
      <span className="absolute -left-9 top-1.5 h-4 w-4 rounded-full border-[3px] border-white bg-(--accent)" />

      <div className="rounded-xl border border-(--hairline) bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(16,20,16,0.06)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-(--hairline) bg-white text-(--ink)">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              {/* Role — Fraunces */}
              <h3 className="font-display text-xl tracking-tight text-(--ink) sm:text-2xl">
                {exp.role}
              </h3>
              {/* Company + period — mono muted */}
              <p className="mt-1 font-mono text-xs uppercase tracking-wider text-(--muted)">
                {exp.company} · {exp.period}
              </p>
            </div>
          </div>
          {exp.current && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-(--accent-soft) px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-(--accent)">
              <span className="h-1.5 w-1.5 rounded-full bg-(--accent)" />
              Current
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-(--muted)">
            <MapPin className="h-3 w-3" />
            {exp.location}
          </span>
          <span className="rounded-full border border-(--hairline) bg-white px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-(--muted)">
            {exp.type}
          </span>
        </div>

        {/* Description */}
        <p className="mt-3 text-sm leading-relaxed text-(--muted) sm:text-base">
          {exp.description}
        </p>

        {/* Achievements */}
        {exp.achievements.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {exp.achievements.map((a) => (
              <li key={a} className="flex items-start gap-2 text-sm text-(--ink)">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--accent)" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Tech tags — mono pills */}
        {exp.tech.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {exp.tech.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-(--hairline) bg-white px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-(--muted)"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
