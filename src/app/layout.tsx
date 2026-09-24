import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { faqs } from "@/lib/portfolio-data";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const fontDisplay = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Responsive mobile viewport: render at the device width so phones get the
// real mobile layout (the codebase is fully responsive — sm:/lg: Tailwind
// breakpoints, max-w containers, no fixed pixel widths). The previous
// fixed `width: 1280` "desktop mirror" rendered a zoomed-out miniature
// desktop on phones and was flagged by PageSpeed ("Optimize viewport for
// mobile"). Desktop browsers are unaffected by this meta tag.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const SITE_URL = "https://yaseenahmadexe.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Yaseen Ahmad (yaseenahmadexe) — Web Developer & Software Engineer in Peshawar, Pakistan",
    template: "%s | Yaseen Ahmad",
  },
  description:
    "Yaseen Ahmad (yaseenahmadexe) is a full-stack web developer and software engineer in Peshawar, Pakistan — building MERN/Next.js web apps and SaaS products. Hire a freelance developer or partner with a software house in Peshawar, KPK. Available for work worldwide.",
  keywords: [
    "Yaseen Ahmad",
    "yaseenahmadexe",
    "Full-Stack Developer",
    "Web Developer Peshawar",
    "Web Developer in Pakistan",
    "Software Engineer Pakistan",
    "Software Engineer Peshawar",
    "Software House Peshawar",
    "Software House in KPK",
    "Software House in Pakistan",
    "Software House Khyber Pakhtunkhwa",
    "Hire Web Developer",
    "Hire Web Developer Pakistan",
    "Freelance Web Developer",
    "Freelance Software Engineer",
    "MERN stack",
    "MERN Stack Developer",
    "Next.js Developer",
    "SaaS",
    "SaaS Development",
    "Web Development Services",
    "Next.js",
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "Flask",
    "Object Oriented Programming",
    "Peshawar",
    "Khyber Pakhtunkhwa",
    "Pakistan",
    "Software Engineer",
  ],
  other: {
    "geo.region": "PK-KP",
    "geo.placename": "Peshawar, Khyber Pakhtunkhwa, Pakistan",
    "geo.position": "34.0151;71.5249",
    ICBM: "34.0151, 71.5249",
  },
  authors: [{ name: "Yaseen Ahmad", url: SITE_URL }],
  creator: "Yaseen Ahmad",
  publisher: "Yaseen Ahmad",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
  openGraph: {
    title: "Yaseen Ahmad (yaseenahmadexe) — Web Developer & Software Engineer | Peshawar, Pakistan",
    description:
      "Full-stack web developer & software engineer in Peshawar, Pakistan. I build production-grade web apps and SaaS — hire me or partner with my software house.",
    url: SITE_URL,
    siteName: "Yaseen Ahmad",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yaseen Ahmad (yaseenahmadexe) — Web Developer & Software Engineer in Peshawar, Pakistan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yaseen Ahmad (yaseenahmadexe) — Web Developer & Software Engineer | Peshawar, Pakistan",
    description:
      "Full-stack web developer & software engineer in Peshawar, Pakistan. Web apps, SaaS, APIs — available for hire.",
    creator: "@yaseencecosian",
    images: ["/og-image.png"],
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Yaseen Ahmad",
  alternateName: "yaseenahmadexe",
  url: SITE_URL,
  image: `${SITE_URL}/assets/dev-photo.jpg`,
  jobTitle: "Full-Stack Developer",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Peshawar",
    addressCountry: "PK",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "CECOS University of IT and Emerging Sciences",
  },
  sameAs: [
    "https://github.com/MrYaseen0",
    "https://www.instagram.com/yaseenahmadexe/",
    "https://www.linkedin.com/in/yaseen-ahmad-489967280",
    "https://x.com/yaseencecosian",
    "https://www.tiktok.com/@mryaseen.exe",
  ],
  knowsAbout: [
    "Next.js",
    "React",
    "TypeScript",
    "Node.js",
    "MERN stack",
    "Python",
    "Flask",
    "SaaS architecture",
    "Web development",
    "Software engineering",
    "Object-oriented programming",
    "REST APIs",
    "Database design",
  ],
  seeks: {
    "@type": "Demand",
    name: "Freelance web development projects and remote software engineering roles",
  },
};

// Local-business schema: lets Google show this as a software house /
// professional service in Peshawar, Pakistan (Maps + local search panels).
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#business`,
  name: "Yaseen Ahmad — Web Development Services (yaseenahmadexe)",
  alternateName: "yaseenahmadexe",
  url: SITE_URL,
  image: `${SITE_URL}/og-image.png`,
  description:
    "Software-house-grade web development services in Peshawar, Pakistan: custom web applications, SaaS products, REST APIs, and UI/UX — for clients in Peshawar, KPK, Pakistan, and worldwide.",
  priceRange: "$$",
  telephone: "+92-318-9370042",
  email: "yaseenahmad.exe@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Peshawar",
    addressRegion: "Khyber Pakhtunkhwa",
    addressCountry: "PK",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 34.0151,
    longitude: 71.5249,
  },
  areaServed: [
    { "@type": "City", name: "Peshawar" },
    { "@type": "AdministrativeArea", name: "Khyber Pakhtunkhwa" },
    { "@type": "Country", name: "Pakistan" },
    "Worldwide",
  ],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "09:00",
    closes: "21:00",
  },
  founder: {
    "@type": "Person",
    name: "Yaseen Ahmad",
    url: SITE_URL,
  },
  sameAs: [
    "https://github.com/MrYaseen0",
    "https://www.instagram.com/yaseenahmadexe/",
    "https://www.linkedin.com/in/yaseen-ahmad-489967280",
    "https://x.com/yaseencecosian",
    "https://www.tiktok.com/@mryaseen.exe",
  ],
  knowsAbout: [
    "Web development",
    "SaaS development",
    "MERN stack",
    "Next.js",
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "Object-oriented programming",
    "Software engineering",
  ],
  makesOffer: [
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Custom web application development",
        description:
          "Full-stack web apps built with Next.js, React, TypeScript, and Node.js — from landing pages to complex platforms.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "SaaS product development",
        description:
          "End-to-end SaaS builds: auth, billing, dashboards, APIs, and cloud deployment.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "API development & integrations",
        description:
          "REST APIs, database design, and third-party integrations (payments, maps, AI).",
      },
    },
  ],
};

// FAQ schema: feeds Google/AI answers for "who is Yaseen Ahmad",
// "software house in Peshawar", "hire web developer" style queries.
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} font-sans bg-[#FBFBF9] text-[#101410] antialiased`}
      >
        {children}
        <Toaster />
        <SonnerToaster richColors position="bottom-right" />
        <Analytics />
      </body>
    </html>
  );
}
