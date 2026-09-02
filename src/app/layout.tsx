import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/portfolio/theme-provider";

const SITE_URL = "https://yaseenahmadexe.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

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
    "Full-Stack Developer",
    "MERN stack",
    "SaaS",
    "Next.js",
    "React",
    "TypeScript",
    "3D portfolio",
    "Peshawar",
    "Pakistan",
    "Freelance Developer",
  ],
  authors: [{ name: "Yaseen Ahmad", url: SITE_URL }],
  creator: "Yaseen Ahmad",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
  openGraph: {
    title: "Yaseen Ahmad — Full-Stack Developer",
    description:
      "3D animated portfolio of Yaseen Ahmad — Full-Stack Developer building production-grade SaaS applications with modern web technologies.",
    url: SITE_URL,
    siteName: "Yaseen Ahmad",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/assets/og.png",
        width: 1200,
        height: 630,
        alt: "Yaseen Ahmad — Full-Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yaseen Ahmad — Full-Stack Developer",
    description: "3D animated portfolio — projects, hire me, real-time chat.",
    images: ["/assets/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-background text-foreground min-h-screen overflow-x-hidden`}
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
