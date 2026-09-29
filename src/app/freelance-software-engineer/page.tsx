import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";

const SITE = "https://yaseenahmadexe.vercel.app";
const PAGE = `${SITE}/freelance-software-engineer`;
const WHATSAPP = "https://wa.me/923189370042";

export const metadata: Metadata = {
  title: "Freelance Software Engineer for Hire — Yaseen Ahmad",
  description:
    "Hire Yaseen Ahmad, a freelance software engineer for web apps, SaaS, APIs, and automation. Next.js, React, TypeScript, Node.js, Python. Fixed quotes, weekly demos, worldwide remote availability.",
  keywords: [
    "freelance software engineer",
    "hire freelance developer",
    "freelance web developer for hire",
    "remote software engineer",
    "hire software engineer Pakistan",
    "freelance programmer",
    "contract web developer",
    "yaseenahmadexe",
  ],
  alternates: { canonical: "/freelance-software-engineer" },
  openGraph: {
    title: "Freelance Software Engineer for Hire — Yaseen Ahmad",
    description:
      "Web apps, SaaS, APIs & automation. Fixed quotes, weekly demos, 30–90 days free support. Available worldwide.",
    url: PAGE,
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Hire Yaseen Ahmad — Freelance Software Engineer",
      },
    ],
  },
};

const faqs = [
  {
    q: "Why hire a freelancer instead of an agency?",
    a: "Lower cost, direct communication with the person writing your code, and faster decisions. You skip account managers and overhead — and still get production-grade engineering with contracts, milestones, and support.",
  },
  {
    q: "How do payments work?",
    a: "Fixed quote agreed upfront. Typically 50% to start and 50% on delivery; larger projects split across milestones. I accept Stripe, PayPal, Wise, and bank transfer, and every payment comes with an invoice.",
  },
  {
    q: "What if I already have a team or codebase?",
    a: "I slot in as a contract engineer: I follow your Git workflow, join your standups, take tickets, and ship. I've onboarded to existing Next.js, MERN, and Flask codebases without disrupting the team.",
  },
  {
    q: "Do you sign NDAs?",
    a: "Yes — I regularly sign NDAs before seeing sensitive code or business logic, and all contracts include IP assignment: everything I build for you is 100% yours.",
  },
  {
    q: "What happens after launch?",
    a: "Every project includes 30–90 days of free support for bugs and small fixes. After that, affordable monthly maintenance retainers (from $99/month) cover updates, monitoring, and new features.",
  },
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Freelance Software Engineer for Hire",
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
    "Hire Yaseen Ahmad, a freelance software engineer, for web applications, SaaS products, REST APIs, and automation — Next.js, React, TypeScript, Node.js, Python.",
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

const engagements = [
  {
    h: "Fixed-scope projects",
    p: "You describe the outcome; I deliver it for a fixed price on a fixed date. Best for websites, MVPs, dashboards, and stores.",
  },
  {
    h: "Monthly retainer",
    p: "Ongoing development capacity each month — new features, fixes, and improvements, with priority turnaround.",
  },
  {
    h: "Contract / team embed",
    p: "I join your team as a remote engineer for a few weeks or months — tickets, reviews, standups, shipping.",
  },
  {
    h: "Rescue & optimization",
    p: "Slow site? Broken app? I audit, fix, and harden existing projects — performance, security, and stability.",
  },
];

export default function FreelanceSoftwareEngineer() {
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
              Available worldwide · Remote
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[#101410] sm:text-5xl">
              Freelance Software Engineer for Hire
            </h1>
            <p className="mt-5 text-base leading-relaxed text-[#5F665F] sm:text-lg">
              I&apos;m <strong className="text-[#101410]">Yaseen Ahmad</strong> — a freelance
              software engineer specializing in web applications, SaaS products, APIs, and
              automation. One engineer from idea to launch: planning, building, deploying,
              and supporting what I ship.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#101410] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
              >
                <MessageCircle className="h-4 w-4" /> Start a project
              </a>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-full border border-[#E2E5E0] bg-white px-6 py-3 text-sm font-medium text-[#101410] transition-colors hover:border-[#101410]"
              >
                Contact form
              </Link>
            </div>
            <p className="mt-4 font-mono text-xs text-[#5F665F]">
              Avg. reply time: 2–4 hours · Free 30-min discovery call
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-xs">
            <div className="overflow-hidden rounded-2xl border border-[#E2E5E0]">
              <Image
                src="/assets/dev-photo.jpg"
                alt="Yaseen Ahmad — Freelance Software Engineer available for hire"
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
              <p className="mt-1 text-xs text-[#5F665F]">Freelance Software Engineer · Available</p>
            </div>
          </div>
        </div>

        <section className="mt-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#101410]">
            Ways to work with me
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {engagements.map((s) => (
              <div key={s.h} className="rounded-2xl border border-[#E2E5E0] bg-white p-6">
                <h3 className="text-lg font-semibold text-[#101410]">{s.h}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5F665F]">{s.p}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#101410]">
            What working with me looks like
          </h2>
          <ul className="mt-8 space-y-4">
            {[
              "Fixed quote and timeline in writing before anything starts.",
              "Weekly live demos — you see real progress, not status reports.",
              "Direct line to me on WhatsApp. No layers, no waiting days for answers.",
              "Clean, documented code you (or any developer) can maintain.",
              "Launch checklist: SEO basics, analytics, backups, and handover docs.",
              "Support after launch — 30–90 days free, then optional retainer.",
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
            Ready when you are
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#B9BFB9] sm:text-base">
            One message is enough to start. Describe your project and get a fixed quote —
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
