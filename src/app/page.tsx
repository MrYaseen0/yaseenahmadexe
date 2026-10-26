import { faqs } from "@/lib/portfolio-data";
import { Folio } from "@/components/folio/folio";

// Folio redesign (local review build). The previous home composition is kept
// in src/components/portfolio/legacy-home.tsx so it can be restored by
// swapping this file back.
export default function Home() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: faqs.map(({q, a}) => ({"@type":"Question", name:q, acceptedAnswer:{"@type":"Answer", text:a}})),
    }).replace(/</g, "\\u003c") }} />
    <Folio />
  </>;
}
