import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";

const SITE = "https://yaseenahmadexe.vercel.app";
const PAGE = `${SITE}/hire-web-developer-peshawar`;
const WHATSAPP = "https://wa.me/923189370042";

export const metadata: Metadata = {
  title: "Hire a Web Developer in Peshawar, Pakistan — Yaseen Ahmad",
  description:
    "Looking to hire a web developer in Peshawar, Pakistan? Yaseen Ahmad (yaseenahmadexe) builds fast, production-grade websites and web apps with Next.js, React & Node.js. Freelance & software-house-grade services — message on WhatsApp today.",
  keywords: [
    "hire web developer Peshawar",
    "web developer in Peshawar",
    "web developer Peshawar Pakistan",
    "freelance web developer Pakistan",
    "hire web developer Pakistan",
    "website developer Peshawar",
    "software house Peshawar",
    "yaseenahmadexe",
  ],
  alternates: { canonical: "/hire-web-developer-peshawar" },
  openGraph: {
    title: "Hire a Web Developer in Peshawar, Pakistan — Yaseen Ahmad",
    description:
      "Production-grade websites & web apps from Peshawar. Next.js, React, Node.js. Available for freelance projects worldwide.",
    url: PAGE,
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Hire Yaseen Ahmad — Web Developer in Peshawar, Pakistan",
      },
    ],
  },
};

const faqs = [
  {
    q: "How much does it cost to hire a web developer in Peshawar?",
    a: "My starter websites begin at $499, full web applications with backend and database start at $1,500, and larger SaaS builds are quoted custom. You get a fixed quote before work starts — no hourly surprises.",
  },
  {
    q: "How long does a website take to build?",
    a: "Landing pages take 5–7 days, small business websites 2–3 weeks, and full web applications 4–8 weeks depending on scope. You get a timeline with weekly milestones in the proposal.",
  },
  {
    q: "Do you work with clients outside Pakistan?",
    a: "Yes. I work with clients worldwide across all timezones. Communication is in English over WhatsApp, email, or Google Meet, and I reply within a few hours during business hours (9 AM – 9 PM PKT).",
  },
  {
    q: "What technologies do you use?",
    a: "My core stack is Next.js, React, TypeScript, Node.js, and Tailwind CSS, with PostgreSQL or MongoDB databases. I also work with Python (Flask/FastAPI) for backends and automation.",
  },
  {
    q: "Will I own the website and the code?",
    a: "100%. You own the code, the domain, and everything built. I hand over the full repository and deployment, and I regularly sign NDAs for confidential projects.",
  },
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Hire a Web Developer in Peshawar, Pakistan",
  url: PAGE,
  provider: {
    "@type": "Person",
    name: "Yaseen Ahmad",
    alternateName: "yaseenahmadexe",
    url: SITE,
    image: `${SITE}/assets/dev-photo.jpg`,
    jobTitle: "Full-Stack Developer",
  },
  areaServed: ["Peshawar", "Khyber Pakhtunkhwa", "Pakistan", "Worldwide"],
  description:
    "Hire Yaseen Ahmad, a full-stack web developer in Peshawar, Pakistan, for production-grade websites and web applications built with Next.js, React, TypeScript, and Node.js.",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const services = [
  {
    h: "Business websites",
    p: "Fast, mobile-friendly websites for shops, clinics, restaurants, and local businesses in Peshawar and across Pakistan — with WhatsApp ordering, maps, and contact forms built in.",
  },
  {
    h: "Custom web applications",
    p: "Dashboards, booking systems, portals, and internal tools with secure login, databases, and admin panels — built on Next.js and Node.js.",
  },
  {
    h: "E-commerce stores",
    p: "Online stores with product catalogs, cart, checkout, and payment integration (Stripe, bank transfer) — ready to take orders from day one.",
  },
  {
    h: "Landing pages that convert",
    p: "High-converting landing pages for ads and launches — 5–7 day delivery, SEO-ready, analytics included.",
  },
];

const steps = [
  {
    h: "1. Free discovery call",
    p: "You tell me what you need on WhatsApp or a 30-minute Google Meet. I ask sharp questions and tell you honestly if I'm the right fit.",
  },
  {
    h: "2. Fixed quote & timeline",
    p: "You get a written proposal: scope, fixed price, and delivery date with weekly milestones. 50% upfront to start.",
  },
  {
    h: "3. Build & weekly demos",
    p: "I build in the open — you see progress every week on a live preview link and can request changes as we go.",
  },
  {
    h: "4. Launch & handover",
    p: "Final payment on delivery. You get the full code, deployment, and 30–90 days of free support depending on the plan.",
  },
];

export default function HireWebDeveloperPeshawar() {
  return (
    <main className="bg-[#FBFBF9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5F665F] transition-colors hover:text-[#101410]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        {/* Hero */}
        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#166534]">
              Peshawar · Pakistan · Worldwide
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[#101410] sm:text-5xl">
              Hire a Web Developer in Peshawar, Pakistan
            </h1>
            <p className="mt-5 text-base leading-relaxed text-[#5F665F] sm:text-lg">
              I&apos;m <strong className="text-[#101410]">Yaseen Ahmad</strong> (yaseenahmadexe) —
              a full-stack web developer based in Peshawar. I design and build fast,
              production-grade websites and web applications for businesses in Pakistan
              and clients worldwide — fixed price, on-time delivery, no agency overhead.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#101410] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
              >
                <MessageCircle className="h-4 w-4" /> Message on WhatsApp
              </a>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-full border border-[#E2E5E0] bg-white px-6 py-3 text-sm font-medium text-[#101410] transition-colors hover:border-[#101410]"
              >
                Contact form
              </Link>
            </div>
            <p className="mt-4 font-mono text-xs text-[#5F665F]">
              Avg. reply time: 2–4 hours · Free consultation
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-xs">
            <div className="overflow-hidden rounded-2xl border border-[#E2E5E0]">
              <Image
                src="/assets/dev-photo.jpg"
                alt="Yaseen Ahmad — Web Developer in Peshawar, Pakistan, available for hire"
                width={480}
                height={600}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="absolute inset-x-4 bottom-4 rounded-xl border border-[#E2E5E0] bg-white p-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                <span className="text-sm font-semibold text-[#101410]">Yaseen Ahmad</span>
              </div>
              <p className="mt-1 text-xs text-[#5F665F]">Full-Stack Developer · Available for work</p>
            </div>
          </div>
        </div>

        {/* Services */}
        <section className="mt-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#101410]">
            What I build for clients
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {services.map((s) => (
              <div key={s.h} className="rounded-2xl border border-[#E2E5E0] bg-white p-6">
                <h3 className="text-lg font-semibold text-[#101410]">{s.h}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5F665F]">{s.p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why me */}
        <section className="mt-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#101410]">
            Why hire me instead of an agency
          </h2>
          <ul className="mt-8 space-y-4">
            {[
              "You talk directly to the developer — no account managers, no telephone game.",
              "Fixed quote before work starts. The price we agree is the price you pay.",
              "Production-grade code: clean architecture, SEO-ready, fast on mobile.",
              "You own 100% of the code and can take it anywhere.",
              "Weekly live previews — you watch the site grow and steer it.",
              "30–90 days of free post-launch support on every project.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#166534]" />
                <span className="text-sm leading-relaxed text-[#3A403A] sm:text-base">{t}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Process */}
        <section className="mt-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#101410]">
            How hiring works
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {steps.map((s) => (
              <div key={s.h} className="rounded-2xl border border-[#E2E5E0] bg-white p-6">
                <h3 className="text-base font-semibold text-[#101410]">{s.h}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5F665F]">{s.p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="mt-20 rounded-2xl border border-[#E2E5E0] bg-white p-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#101410]">
            Simple, honest pricing
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {[
              { p: "Starter", v: "$499", d: "Landing pages & small business websites. 5–7 day delivery." },
              { p: "Professional", v: "$1,499", d: "Full web apps with backend, database & admin dashboard." },
              { p: "Enterprise", v: "Custom", d: "SaaS products, microservices, ongoing support." },
            ].map((t) => (
              <div key={t.p}>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#5F665F]">{t.p}</p>
                <p className="mt-1 font-display text-3xl font-semibold text-[#101410]">{t.v}</p>
                <p className="mt-2 text-sm text-[#5F665F]">{t.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#101410]">
            Common questions
          </h2>
          <div className="mt-8 space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-2xl border border-[#E2E5E0] bg-white p-6">
                <h3 className="text-base font-semibold text-[#101410]">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5F665F]">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-20 rounded-2xl bg-[#101410] p-8 text-center sm:p-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white">
            Have a project in mind?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#B9BFB9] sm:text-base">
            Tell me what you want to build. You&apos;ll get a fixed quote and a timeline —
            usually within a day.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[#101410] transition-colors hover:bg-[#EDEFEA]"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp: +92 318 9370042
            </a>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 rounded-full border border-[#3A403A] px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white"
            >
              Use the contact form
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
