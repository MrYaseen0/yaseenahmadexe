import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";

const SITE = "https://yaseenahmadexe.vercel.app";
const PAGE = `${SITE}/mern-stack-developer`;
const WHATSAPP = "https://wa.me/923189370042";

export const metadata: Metadata = {
  title: "MERN Stack Developer for Hire — Yaseen Ahmad",
  description:
    "Hire a MERN stack developer (MongoDB, Express, React, Node.js) for your next project. Yaseen Ahmad builds production-grade MERN & Next.js applications — APIs, dashboards, SaaS. Fixed price, worldwide availability.",
  keywords: [
    "MERN stack developer",
    "hire MERN developer",
    "MERN developer for hire",
    "freelance MERN developer",
    "MERN stack developer Pakistan",
    "React Node developer",
    "Next.js developer for hire",
    "yaseenahmadexe",
  ],
  alternates: { canonical: "/mern-stack-developer" },
  openGraph: {
    title: "MERN Stack Developer for Hire — Yaseen Ahmad",
    description:
      "MongoDB · Express · React · Node.js — production-grade apps, APIs and SaaS builds. Fixed price, on-time delivery.",
    url: PAGE,
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Hire Yaseen Ahmad — MERN Stack Developer",
      },
    ],
  },
};

const faqs = [
  {
    q: "What is the MERN stack, and is it right for my project?",
    a: "MERN stands for MongoDB, Express.js, React, and Node.js — a full JavaScript stack for building modern web applications. It's ideal for dashboards, SaaS products, marketplaces, booking systems, and any app that needs a fast interactive frontend with a scalable API backend.",
  },
  {
    q: "Do you also work with Next.js and TypeScript?",
    a: "Yes — Next.js with TypeScript is my daily driver for production work. I use pure MERN when the project calls for it, and Next.js when SEO, performance, and server rendering matter.",
  },
  {
    q: "Can you take over or extend my existing MERN codebase?",
    a: "Absolutely. I onboard to existing codebases quickly: I review the architecture, follow your patterns, add features, fix bugs, and improve performance without rewriting everything.",
  },
  {
    q: "How do we communicate during the project?",
    a: "WhatsApp for quick messages, Google Meet for demos, and a shared preview link you can open anytime. Weekly progress demos are standard on every project.",
  },
  {
    q: "What does a MERN project cost?",
    a: "Small MERN apps start around $1,500, mid-size platforms with dashboards and roles run $3,000–$6,000, and full SaaS products are quoted custom. You always get a fixed quote before work begins.",
  },
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "MERN Stack Developer for Hire",
  url: PAGE,
  provider: {
    "@type": "Person",
    name: "Yaseen Ahmad",
    alternateName: "yaseenahmadexe",
    url: SITE,
    image: `${SITE}/assets/dev-photo.jpg`,
    jobTitle: "Full-Stack Developer",
  },
  areaServed: "Worldwide",
  description:
    "Hire Yaseen Ahmad, a MERN stack developer (MongoDB, Express, React, Node.js), for production-grade web applications, APIs, dashboards, and SaaS products.",
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

const stack = [
  { h: "MongoDB", p: "Flexible document database — schemas designed for your queries, indexed for speed, backed up." },
  { h: "Express.js", p: "Clean REST APIs with auth (JWT), validation, rate limiting, and proper error handling." },
  { h: "React", p: "Fast, interactive UIs — dashboards, data tables, real-time updates with clean component architecture." },
  { h: "Node.js", p: "Scalable JavaScript backend, background jobs, file uploads, and third-party integrations." },
  { h: "Next.js + TypeScript", p: "My production default when SEO and performance matter — server rendering, type safety." },
  { h: "Deployment", p: "Vercel, Docker, or VPS — CI/CD pipelines, environment configs, and monitoring included." },
];

export default function MernStackDeveloper() {
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

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#166534]">
              MongoDB · Express · React · Node.js
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[#101410] sm:text-5xl">
              MERN Stack Developer for Hire
            </h1>
            <p className="mt-5 text-base leading-relaxed text-[#5F665F] sm:text-lg">
              I&apos;m <strong className="text-[#101410]">Yaseen Ahmad</strong> — I build
              production-grade applications on the MERN stack: customer portals, admin
              dashboards, booking systems, marketplaces, and SaaS products. Clean
              architecture, secure APIs, and interfaces your users will actually enjoy.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#101410] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
              >
                <MessageCircle className="h-4 w-4" /> Discuss your project
              </a>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-full border border-[#E2E5E0] bg-white px-6 py-3 text-sm font-medium text-[#101410] transition-colors hover:border-[#101410]"
              >
                Contact form
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xs">
            <div className="overflow-hidden rounded-2xl border border-[#E2E5E0]">
              <Image
                src="/assets/dev-photo.avif"
                alt="Yaseen Ahmad — MERN Stack Developer for hire"
                width={480}
                height={600}
                sizes="(max-width: 640px) 100vw, 320px"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="absolute inset-x-4 bottom-4 rounded-xl border border-[#E2E5E0] bg-white p-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                <span className="text-sm font-semibold text-[#101410]">Yaseen Ahmad</span>
              </div>
              <p className="mt-1 text-xs text-[#5F665F]">MERN & Next.js Developer · Available</p>
            </div>
          </div>
        </div>

        <section className="mt-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#101410]">
            The stack, end to end
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stack.map((s) => (
              <div key={s.h} className="rounded-2xl border border-[#E2E5E0] bg-white p-6">
                <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-[#101410]">{s.h}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5F665F]">{s.p}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#101410]">
            What you get
          </h2>
          <ul className="mt-8 space-y-4">
            {[
              "Full-stack delivery: database, API, frontend, auth, and deployment — one person, no handoffs.",
              "Secure by default: JWT auth, role-based access, input validation, rate limiting.",
              "Admin dashboards to manage users, content, orders, or whatever your business runs on.",
              "Real-time features where they matter: chats, notifications, live dashboards (Socket.io).",
              "You own the code, the repo, and the deployment. Handover docs included.",
              "30–90 days of free post-launch support on every build.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#166534]" />
                <span className="text-sm leading-relaxed text-[#3A403A] sm:text-base">{t}</span>
              </li>
            ))}
          </ul>
        </section>

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

        <section className="mt-20 rounded-2xl bg-[#101410] p-8 text-center sm:p-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white">
            Let&apos;s scope your MERN project
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#B9BFB9] sm:text-base">
            Send me a 2-minute description of what you want to build. You&apos;ll get a
            fixed quote and timeline — usually within a day.
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
