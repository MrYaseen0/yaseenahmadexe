import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of service for yaseenahmadexe.vercel.app — the portfolio of Yaseen Ahmad.",
};

const sections = [
  {
    h: "Purpose of this site",
    p: "This website is the professional portfolio of Yaseen Ahmad. Project listings are fetched live from public GitHub repositories and are shown for demonstration of skills and experience.",
  },
  {
    h: "Intellectual property",
    p: "All original content on this site — text, design, and images — belongs to Yaseen Ahmad unless stated otherwise. Open-source projects linked from the portfolio are governed by their own licenses on GitHub.",
  },
  {
    h: "Contact form",
    p: "By submitting the contact form you agree to be contacted about your inquiry. Do not submit unlawful, abusive, or spam content; such messages may be ignored and blocked.",
  },
  {
    h: "No warranties",
    p: "Content is provided as-is for informational purposes. While efforts are made to keep information accurate, no guarantees are made about completeness or availability.",
  },
  {
    h: "Changes",
    p: "These terms may be updated from time to time. Continued use of the site after changes constitutes acceptance of the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <main className="bg-white px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5F665F] transition-colors hover:text-[#101410]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.25em] text-[#166534]">
          Legal
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[#101410] sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-[#5F665F]">
          Last updated: September 2026
        </p>
        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-semibold text-[#101410]">{s.h}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5F665F]">
                {s.p}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
