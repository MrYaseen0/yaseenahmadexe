import { AnimatedBackground } from "@/components/portfolio/animated-background";
import { Ambient3DBackground } from "@/components/portfolio/ambient3d-client";
import { ScrollProgress } from "@/components/portfolio/scroll-progress";
import { Navbar } from "@/components/portfolio/navbar";
import { Hero } from "@/components/portfolio/sections/hero";
import { Marquee } from "@/components/portfolio/sections/marquee";
import { AchievementStats } from "@/components/portfolio/sections/achievement-stats";
import { About } from "@/components/portfolio/sections/about";
import { Services } from "@/components/portfolio/sections/services";
import { Projects } from "@/components/portfolio/sections/projects";
import { TechStack } from "@/components/portfolio/sections/techstack";
import { Experience } from "@/components/portfolio/sections/experience";
import { GithubProfile } from "@/components/portfolio/sections/github-profile";
import { Blog } from "@/components/portfolio/sections/blog";
import { Newsletter } from "@/components/portfolio/sections/newsletter";
import { Booking } from "@/components/portfolio/sections/booking";
import { Pricing } from "@/components/portfolio/sections/pricing";
import { Testimonials } from "@/components/portfolio/sections/testimonials";
import { Faq } from "@/components/portfolio/sections/faq";
import { Contact } from "@/components/portfolio/sections/contact";
import { Footer } from "@/components/portfolio/footer";
import { ChatWidget } from "@/components/portfolio/chat-widget";
import { CommandPalette } from "@/components/portfolio/command-palette";
import { BackToTop } from "@/components/portfolio/back-to-top";
import { StatsWidget } from "@/components/portfolio/stats-widget";
import { SectionTracker } from "@/components/portfolio/section-tracker";

export default function Home() {
  return (
    <>
      <AnimatedBackground />
      {/* Full-page ambient WebGL 3D scene — client-only, desktop, zero SSR risk */}
      <Ambient3DBackground />
      <ScrollProgress />
      <Navbar />
      <SectionTracker />
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
      <ChatWidget />
      <CommandPalette />
      <BackToTop />
      <StatsWidget />
    </>
  );
}
