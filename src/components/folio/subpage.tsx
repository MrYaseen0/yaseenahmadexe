import Link from "next/link";

const SITE = "https://yaseenahmadexe.vercel.app";
export const SUBPAGES = [
  { href: "/cecos-qec-portal", label: "QEC case study" },
  { href: "/freelance-software-engineer", label: "Freelance software engineer" },
  { href: "/hire-web-developer-peshawar", label: "Web developer in Peshawar" },
  { href: "/mern-stack-developer", label: "MERN stack developer" },
  { href: "/uncensored-llm", label: "Uncensored LLM" },
];

export function breadcrumbSchema(path: string, name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name, item: `${SITE}${path}` },
    ],
  };
}

export function SubNav({ current }: { current: string }) {
  return (
    <nav className="f-subnav" aria-label="Site pages">
      <Link href="/" className="f-subnav-logo">YASEEN<span>.</span></Link>
      <ul>
        <li><Link href="/#work">Work</Link></li>
        {SUBPAGES.map((p) => (
          <li key={p.href}>
            <Link href={p.href} aria-current={p.href === current ? "page" : undefined}>{p.label}</Link>
          </li>
        ))}
        <li><Link href="/#contact">Contact</Link></li>
      </ul>
    </nav>
  );
}

export function SubRelated({ current }: { current: string }) {
  const others = SUBPAGES.filter((p) => p.href !== current);
  return (
    <aside className="f-subrel" aria-label="Related pages">
      <h2>Also see</h2>
      <ul>
        {others.map((p) => (
          <li key={p.href}><Link href={p.href}>{p.label} <span aria-hidden="true">→</span></Link></li>
        ))}
        <li><Link href="/#work">Selected projects <span aria-hidden="true">→</span></Link></li>
        <li><Link href="/">Home <span aria-hidden="true">→</span></Link></li>
      </ul>
    </aside>
  );
}
