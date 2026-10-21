import type { Metadata, Viewport } from "next";
import { Anton, Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

// Google Analytics 4 — activates only when NEXT_PUBLIC_GA_ID (G-XXXXXXXXXX)
// is set in the Vercel project env. No ID configured = no GA scripts served.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
import { CookieBanner } from "@/components/portfolio/cookie-banner";
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

const fontAnton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: ["400"],
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
    "Yaseen Ahmad (yaseenahmadexe) is a full-stack web developer and software engineer in Peshawar, Pakistan — building MERN/Next.js web apps and SaaS products. Explore project details, screenshots and public source code.",
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
      "Full-stack web developer & software engineer in Peshawar, Pakistan. Explore web applications, project details and public source code.",
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} ${fontAnton.variable} font-sans bg-[#FBFBF9] text-[#101410] antialiased`}
      >
        {children}
        <Toaster />
        <SonnerToaster richColors position="bottom-right" />
        <Analytics />
        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_ID}');`}
            </Script>
          </>
        ) : null}
        <CookieBanner />
      </body>
    </html>
  );
}
