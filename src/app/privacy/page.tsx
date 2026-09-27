import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for yaseenahmadexe.vercel.app — how contact form data and analytics are handled.",
};

const sections = [
  {
    h: "Data you share",
    p: "When you use the contact form, you provide your name, email address, subject, and message. This information is used only to read and respond to your inquiry. It is never sold, rented, or shared with third parties for marketing.",
  },
  {
    h: "Analytics",
    p: "This site uses Vercel Analytics to understand aggregate traffic (page views, referrers, device types). Analytics data is anonymized and contains no personally identifying information.",
  },
  {
    h: "Cookies",
    p: "A single local cookie (or localStorage entry) remembers your cookie-consent choice. No advertising or cross-site tracking cookies are used.",
  },
  {
    h: "Data retention",
    p: "Contact messages are kept only as long as needed to handle your request. You may ask for your message to be deleted at any time by emailing yaseenahmad.exe@gmail.com.",
  },
  {
    h: "Your rights",
    p: "You can request a copy of the personal data held about you, or ask for it to be corrected or deleted, by contacting the email above.",
  },
];

export default function PrivacyPage() {
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
          Privacy Policy
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
