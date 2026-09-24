"use client";

import Image from "next/image";
import { GraduationCap, Heart, MapPin, Briefcase } from "lucide-react";
import { SectionHeading } from "../section-heading";
import { Reveal } from "../reveal";
import { Editable, useContent } from "@/components/portfolio/content-editor";

export function About() {
  const { t, tj } = useContent();
  const skillChips = tj<string[]>("about.skills");
  const infoCards = tj<{ label: string; value: string }[]>("about.infoCards");
  return (
    <section id="about" className="relative border-t border-(--hairline) bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading ek="about" />

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Left: photo + nameplate */}
          <Reveal direction="right">
            <div className="relative mx-auto max-w-md">
              <div className="relative overflow-hidden rounded-xl border border-(--hairline)">
                <Image
                  src="/assets/dev-photo.jpg"
                  alt={t("brand.name")}
                  width={640}
                  height={800}
                  sizes="(max-width: 1024px) 100vw, 512px"
                  className="aspect-[4/5] w-full object-cover"
                />

                {/* Nameplate — simple, no glass, static availability dot */}
                <div className="absolute inset-x-4 bottom-4 rounded-xl border border-(--hairline) bg-white p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-(--accent)" />
                    <span className="text-sm font-semibold text-(--ink)">
                      <Editable id="brand.name" />
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-(--muted)">
                    <Editable id="about.nameplateRole" />
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: text + skills + CTA + info cards */}
          <Reveal direction="left" delay={0.1} className="space-y-6">
            <h2 className="font-display text-4xl tracking-tight text-(--ink) sm:text-5xl">
              <Editable id="about.h1a" /> <Editable id="about.h1b" />
            </h2>

            <p className="text-base leading-relaxed text-(--muted) sm:text-lg">
              <Editable id="brand.aboutText1" />
            </p>
            <p className="text-base leading-relaxed text-(--muted) sm:text-lg">
              <Editable id="brand.aboutText2" />
            </p>

            {/* Skill chips — mono pills */}
            <Editable id="about.skills" json label="Skill chips" />
            <div className="flex flex-wrap gap-2">
              {skillChips.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-(--hairline) bg-white px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-(--muted)"
                >
                  {s}
                </span>
              ))}
            </div>

            <div>
              <a
                href="#techstack"
                className="inline-flex items-center gap-2 rounded-full bg-[#101410] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
              >
                <Briefcase className="h-4 w-4" />
                <Editable id="about.cta" />
              </a>
            </div>

            {/* Info cards — white hairline, lucide icons */}
            <Editable id="about.infoCards" json label="Info cards" />
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: <MapPin className="h-4 w-4" /> },
                { icon: <GraduationCap className="h-4 w-4" /> },
                { icon: <Heart className="h-4 w-4" /> },
              ].map((c, i) => (
                <InfoCard
                  key={infoCards[i]?.label ?? i}
                  icon={c.icon}
                  label={infoCards[i]?.label ?? ""}
                  value={infoCards[i]?.value ?? ""}
                />
              ))}
            </div>
          </Reveal>
        </div>

        {/* Code snippet card (full width below) — light editor card */}
        <Reveal className="mt-14">
          <Editable id="about.code" buttonOnly label="Code snippet" />
          <CodeCard />
        </Reveal>
      </div>
    </section>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-(--hairline) bg-white p-4">
      <div className="flex items-center gap-2 text-(--muted)">
        <span className="text-(--ink)">{icon}</span>
        <span className="font-mono text-[11px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-1.5 text-sm font-semibold text-(--ink)">{value}</div>
    </div>
  );
}

function CodeCard() {
  const { t } = useContent();
  const codeLines = t("about.code").split("\n");
  return (
    <div className="overflow-hidden rounded-xl border border-(--hairline) bg-white">
      {/* Title bar — simple */}
      <div className="flex items-center justify-between border-b border-(--hairline) px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E6E8E2]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#E6E8E2]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#E6E8E2]" />
          </div>
          <span className="ml-2 font-mono text-xs text-(--muted)">
            <Editable id="about.codeFile" />
          </span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-wider text-(--muted)">
          <Editable id="about.codeLang" />
        </span>
      </div>

      {/* Code */}
      <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
        <code className="font-mono">
          {codeLines.map((line, i) => (
            <div key={i} className="flex">
              <span className="mr-4 inline-block w-6 select-none text-right text-(--muted) opacity-60">
                {i + 1}
              </span>
              <span className="text-(--ink)">{highlightLine(line)}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

// Very light syntax highlighting (light theme)
function highlightLine(line: string) {
  const parts: React.ReactNode[] = [];
  const tokens = line.split(/(\s+|[{}[\]():,;])/);
  tokens.forEach((tok, i) => {
    if (/^(const|export|default|return)$/.test(tok)) {
      parts.push(
        <span key={i} className="font-semibold text-(--ink)">
          {tok}
        </span>
      );
    } else if (/^["'`].*["'`]$/.test(tok)) {
      // Status value: render a CSS green dot instead of any emoji so the
      // code block never shows emoji (DB overrides may still carry one).
      if (tok.replace(/\s/g, "").includes("Availableforwork")) {
        const quote = tok[0];
        const inner = tok
          .slice(1, -1)
          .replace(/\u{1F7E2}/gu, "")
          .trim();
        parts.push(
          <span key={i} className="text-(--accent)">
            {quote}
            <span
              aria-hidden="true"
              className="mx-1 inline-block h-2 w-2 rounded-full bg-green-500 align-middle"
            />
            {inner}
            {quote}
          </span>
        );
      } else {
        parts.push(
          <span key={i} className="text-(--accent)">
            {tok}
          </span>
        );
      }
    } else if (/^(name|role|location|skills|passion|status)$/.test(tok)) {
      parts.push(
        <span key={i} className="text-(--ink)">
          {tok}
        </span>
      );
    } else {
      parts.push(<span key={i}>{tok}</span>);
    }
  });
  return parts;
}
