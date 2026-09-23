import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/portfolio/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Desktop mirror (Option B): force a fixed 1280px layout viewport on mobile so
// phones render the exact desktop layout, zoomed out to fit. `initialScale:
// undefined` is required — Next.js merges the viewport export per-key over its
// default { width: "device-width", initialScale: 1 }, so without this the tag
// would emit `initial-scale=1` and render 1:1 (horizontal scroll) instead of
// scaling to fit. Desktop browsers ignore this meta, so the desktop view is
// unchanged. Pinch-zoom stays enabled (no user-scalable / maximum-scale set).
export const viewport: Viewport = {
  width: 1280,
  initialScale: undefined,
};

const SITE_URL = "https://yaseenahmadexe.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Yaseen Ahmad — Full-Stack Developer | MERN & SaaS Specialist",
    template: "%s | Yaseen Ahmad",
  },
  description:
    "I'm Yaseen Ahmad, a Full-Stack Developer from Peshawar, Pakistan specializing in MERN stack, SaaS architecture, and modern cloud solutions. View my projects, hire me, or chat in real-time.",
  keywords: [
    "Yaseen Ahmad",
    "yaseenahmadexe",
    "Full-Stack Developer",
    "MERN stack",
    "SaaS",
    "Next.js",
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "Flask",
    "Peshawar",
    "Pakistan",
    "Freelance Developer",
    "Software Engineer",
  ],
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
    title: "Yaseen Ahmad — Full-Stack Developer",
    description:
      "Full-Stack Developer building production-grade SaaS applications with modern web technologies. View projects, hire me, or chat in real-time.",
    url: SITE_URL,
    siteName: "Yaseen Ahmad",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yaseen Ahmad — Full-Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yaseen Ahmad — Full-Stack Developer",
    description: "Full-Stack Developer building production-grade SaaS applications.",
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
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen overflow-x-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
