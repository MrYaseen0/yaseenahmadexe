import dynamic from "next/dynamic";
import { ScrollProgress } from "@/components/portfolio/scroll-progress";
import { Navbar } from "@/components/portfolio/navbar";
import { ContentProvider } from "@/components/portfolio/content-editor";
import { Hero } from "@/components/portfolio/sections/hero";
import { Marquee } from "@/components/portfolio/sections/marquee";
import { AchievementStats } from "@/components/portfolio/sections/achievement-stats";
import { About } from "@/components/portfolio/sections/about";
import { Services } from "@/components/portfolio/sections/services";
import { Projects } from "@/components/portfolio/sections/projects";
import { TechStack } from "@/components/portfolio/sections/techstack";
import { Experience } from "@/components/portfolio/sections/experience";
import { GithubProfile } from "@/components/portfolio/sections/github-profile";
import { Contact } from "@/components/portfolio/sections/contact";
import { Footer } from "@/components/portfolio/footer";
import { HomeWidgets } from "@/components/portfolio/home-widgets";

// Below-the-fold sections: code-split so their JS (embla carousel,
// react-day-picker, forms, etc.) doesn't bloat the initial bundle.
// SSR stays on so the HTML is still fully rendered for SEO.
const Blog = dynamic(
  () => import("@/components/portfolio/sections/blog").then((m) => m.Blog),
  { ssr: true }
);
const Newsletter = dynamic(
  () =>
    import("@/components/portfolio/sections/newsletter").then(
      (m) => m.Newsletter
    ),
  { ssr: true }
);
const Booking = dynamic(
  () => import("@/components/portfolio/sections/booking").then((m) => m.Booking),
  { ssr: true }
);
const Pricing = dynamic(
  () => import("@/components/portfolio/sections/pricing").then((m) => m.Pricing),
  { ssr: true }
);
const Testimonials = dynamic(
  () =>
    import("@/components/portfolio/sections/testimonials").then(
      (m) => m.Testimonials
    ),
  { ssr: true }
);
const Faq = dynamic(
  () => import("@/components/portfolio/sections/faq").then((m) => m.Faq),
  { ssr: true }
);

export default function Home() {
  return (
    <ContentProvider>
      <ScrollProgress />
      <Navbar />
      <main className="relative flex min-h-screen flex-col">
        <Hero />
        <Marquee />
        <AchievementStats />
        <About />
        <Services />
        <Projects />
        <TechStack />
        <Experience />
        <GithubProfile />
        <Blog />
        <Newsletter />
        <Booking />
        <Pricing />
        <Testimonials />
        <Faq />
        <Contact />
        <Footer />
      </main>
      <HomeWidgets />
    </ContentProvider>
  );
}
