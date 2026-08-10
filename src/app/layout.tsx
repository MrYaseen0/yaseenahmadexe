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

export const metadata: Metadata = {
  title: "Yaseen Ahmad — Full-Stack Developer | MERN & SaaS Specialist",
  description:
    "I'm Yaseen Ahmad, a Full-Stack Developer from Peshawar, Pakistan specializing in MERN stack, SaaS architecture, and modern cloud solutions. View my projects, hire me, or chat in real-time.",
  keywords: [
    "Yaseen Ahmad",
    "Full-Stack Developer",
    "MERN stack",
    "SaaS",
    "Next.js",
    "React",
    "TypeScript",
    "Peshawar",
    "Pakistan",
    "Freelance Developer",
  ],
  authors: [{ name: "Yaseen Ahmad" }],
  creator: "Yaseen Ahmad",
  icons: {
    icon: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
  openGraph: {
    title: "Yaseen Ahmad — Full-Stack Developer",
    description:
      "Full-Stack Developer building production-grade SaaS applications with modern web technologies. View projects, hire me, or chat in real-time.",
    url: "https://yaseenahmadexe.vercel.app",
    siteName: "Yaseen Ahmad",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yaseen Ahmad — Full-Stack Developer",
    description: "Full-Stack Developer building production-grade SaaS applications.",
  },
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
