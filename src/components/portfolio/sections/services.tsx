"use client";

import { ArrowRight, Check } from "lucide-react";
import { SectionHeading } from "../section-heading";
import { Reveal, Stagger } from "../reveal";
import { Editable, useContent } from "@/components/portfolio/content-editor";

interface Service {
  title: string;
  description: string;
  tags: string[];
}

export function Services() {
  const { tj } = useContent();
  const services = tj<Service[]>("services.items");
  return (
    <section id="services" className="relative border-t border-(--hairline) bg-(--alt) py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading ek="services" />

        <Editable id="services.items" json label="Services" />
        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal asChild key={s.title}>
              <ServiceCard service={s} index={i} />
            </Reveal>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-(--hairline) bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(16,20,16,0.06)]">
      {/* Mono index instead of emoji badge */}
      <span className="font-mono text-xs tracking-[0.2em] text-(--accent)">
        {String(index + 1).padStart(2, "0")}
      </span>

      <h3 className="font-display mt-4 text-xl tracking-tight text-(--ink)">
        {service.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-(--muted)">
        {service.description}
      </p>

      <ul className="mt-4 space-y-1.5">
        {service.tags.map((tag) => (
          <li key={tag} className="flex items-center gap-2 text-sm font-medium text-(--ink)">
            <Check className="h-3.5 w-3.5 text-(--accent)" />
            <span>{tag}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() =>
          document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })
        }
        className="mt-auto inline-flex items-center gap-1.5 self-start pt-5 text-sm font-semibold text-(--ink) underline-offset-4 transition-colors hover:text-(--accent) hover:underline"
      >
        <Editable id="services.cta" />
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
