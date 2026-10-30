import type { Metadata } from "next";
import Link from "next/link";
import "@/components/folio/subpage.css";
import { SubNav, SubRelated, breadcrumbSchema } from "@/components/folio/subpage";

export const metadata: Metadata = {
  title: "CECOS QEC Portal - university website case study",
  description:
    "Case study: Yaseen Ahmad designed and built the Quality Enhancement Cell website for CECOS University, Peshawar - Next.js, TypeScript, Tailwind CSS and Supabase, with a custom admin CMS and a complete search and AI-visibility setup.",
  alternates: { canonical: "/cecos-qec-portal" },
};

const LIVE = "https://qec-page.vercel.app/qec";

const publicFeatures = [
  {
    title: "Focal persons directory",
    body: "A searchable directory of QEC focal persons across the university's faculties, with faculty filters so visitors reach the right contact quickly.",
  },
  {
    title: "Events",
    body: "Workshops, trainings and conferences, browsable in tabs, with a dedicated page for every event.",
  },
  {
    title: "Reports library",
    body: "Program review, performance and quality-policy documents with search, tabs and document links.",
  },
  {
    title: "Team, director and achievements",
    body: "The people behind the cell, the director's message and the university's quality-assurance milestones.",
  },
  {
    title: "Activity calendar",
    body: "The cell's official activity calendar, published for faculty and students.",
  },
  {
    title: "FAQ and contact",
    body: "Answers to common questions about QEC processes, plus a contact section for visitors.",
  },
];

const cmsPoints = [
  "A visual page editor - staff edit page content in the browser, without touching code.",
  "Managers for events, reports, team members and achievements, stored in Supabase.",
  "Secure sign-in with email, password and a two-step verification code.",
  "Rate-limited login that blocks repeated failed attempts.",
  "Admin routes hidden from search engines through noindex and robots rules.",
];

const seoPoints = [
  "Unique title, description and canonical URL on all 23 pages, with Open Graph and Twitter cards.",
  "JSON-LD structured data: university, organization, breadcrumbs, FAQ, individual events and reports.",
  "sitemap.xml covering every page, and a robots.txt that welcomes both search engines and AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended).",
  "llms.txt so AI answer engines can describe the cell and its work accurately.",
  "Verified in Google Search Console and Bing Webmaster Tools, with instant indexing submissions through IndexNow.",
];

const stats = [
  { value: "23", label: "Pages in the sitemap" },
  { value: "100", label: "Lighthouse SEO (mobile)" },
  { value: "96", label: "Lighthouse performance (mobile)" },
];

export default function Page() {
  return (
    <main className="f-subpage">
      <SubNav current="/cecos-qec-portal" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema("/cecos-qec-portal", "CECOS QEC Portal case study")),
        }}
      />
      <div className="f-case">
        <header>
          <p className="f-case-label">Case study</p>
          <h1>
            CECOS <em>QEC</em> Portal
          </h1>
          <p className="f-case-lede">
            The website of the Quality Enhancement Cell (QEC) at CECOS University, Peshawar: a public
            information hub plus a private admin CMS, designed and built end to end and shipped to
            production on Vercel.
          </p>
          <dl className="f-case-meta">
            <div>
              <dt>Client</dt>
              <dd>Quality Enhancement Cell, CECOS University</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>University website + custom CMS</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>Design, development, SEO</dd>
            </div>
            <div>
              <dt>Stack</dt>
              <dd>Next.js · TypeScript · Tailwind CSS · Supabase</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>Live on Vercel</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>2026</dd>
            </div>
          </dl>
          <div className="f-case-actions">
            <a className="f-case-btn red" href={LIVE} target="_blank" rel="noopener noreferrer">
              Visit the live site ↗
            </a>
            <Link className="f-case-btn ghost" href="/#work">
              All projects →
            </Link>
          </div>
        </header>

        <section aria-labelledby="cs-brief">
          <h2 id="cs-brief">
            The <em>brief.</em>
          </h2>
          <p className="body">
            The Quality Enhancement Cell is the university department responsible for academic quality:
            program reviews, faculty training, HEC compliance and performance reporting. It needed a
            public home for its team, focal persons, events, reports and policies - and a way for staff
            to keep all of it current without depending on a developer.
          </p>
          <p className="body">
            I designed and built the portal as my summer internship project at CECOS University: the
            public pages, the admin CMS that manages them, and the search and AI-visibility setup that
            makes the content findable.
          </p>
        </section>

        <section aria-labelledby="cs-public">
          <h2 id="cs-public">
            The public <em>site.</em>
          </h2>
          <p className="body">
            The public site covers everything a visitor, faculty member or reviewer needs:
          </p>
          <ul className="f-case-grid">
            {publicFeatures.map((f) => (
              <li className="f-case-card" key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="cs-cms">
          <div className="f-case-dark">
            <h2 id="cs-cms">
              The admin <em>CMS.</em>
            </h2>
            <p>
              The QEC team runs the site itself. A private admin portal gives staff full control of the
              public content:
            </p>
            <ul className="f-case-list">
              {cmsPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <p style={{ marginTop: 18 }}>
              The admin area stays private; the screenshots below show the public site only.
            </p>
          </div>
        </section>

        <section aria-labelledby="cs-seo">
          <h2 id="cs-seo">
            Search and AI <em>visibility.</em>
          </h2>
          <p className="body">
            A university site only works if people - and now AI assistants - can find and read it. The
            portal shipped with a complete technical SEO and AI-search setup:
          </p>
          <ul className="f-case-list">
            {seoPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <ul className="f-case-stats">
            {stats.map((s) => (
              <li className="f-case-stat" key={s.label}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="cs-media">
          <h2 id="cs-media">
            See it <em>live.</em>
          </h2>
          <p className="body">
            Every capture below is a real recording or screenshot of the live site. Public pages only -
            no admin or private data.
          </p>
          <figure>
            <video controls playsInline preload="none" poster="/assets/projects/qec/qec-poster.jpg" width={1280} height={720} aria-label="CECOS QEC promo video: the live site's home, director's message, team, achievements, events and FAQ pages">
              <source src="/assets/projects/qec/qec-promo-720p.mp4" type="video/mp4" />
            </video>
            <figcaption>Promo video with sound. Every screen is a real recording of the live site.</figcaption>
          </figure>
          <figure>
            <img src="/assets/projects/ui/1-qec.webp" alt="CECOS QEC Portal public homepage" width={1280} height={713} loading="lazy" />
            <figcaption>Live public homepage, captured 21 October 2026.</figcaption>
          </figure>
        </section>

        <section aria-labelledby="cs-visit">
          <h2 id="cs-visit">
            Visit the <em>portal.</em>
          </h2>
          <p className="body">
            The site is live and maintained by the QEC team through the admin portal. If your
            organization needs a website with a CMS your staff can run themselves, let&apos;s talk.
          </p>
          <div className="f-case-actions">
            <a className="f-case-btn red" href={LIVE} target="_blank" rel="noopener noreferrer">
              Visit the live site ↗
            </a>
            <a className="f-case-btn ghost" href="mailto:yaseenahmad.exe@gmail.com">
              Email Yaseen →
            </a>
          </div>
        </section>
      </div>
      <SubRelated current="/cecos-qec-portal" />
    </main>
  );
}
