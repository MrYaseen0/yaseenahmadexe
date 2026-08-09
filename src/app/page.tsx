import { AnimatedBackground } from "@/components/portfolio/animated-background";
import { ScrollProgress } from "@/components/portfolio/scroll-progress";
import { Navbar } from "@/components/portfolio/navbar";
import { Hero } from "@/components/portfolio/sections/hero";
import { Marquee } from "@/components/portfolio/sections/marquee";
import { About } from "@/components/portfolio/sections/about";
import { Services } from "@/components/portfolio/sections/services";
import { Projects } from "@/components/portfolio/sections/projects";
import { TechStack } from "@/components/portfolio/sections/techstack";
import { GithubProfile } from "@/components/portfolio/sections/github-profile";
import { Pricing } from "@/components/portfolio/sections/pricing";
import { Testimonials } from "@/components/portfolio/sections/testimonials";
import { Contact } from "@/components/portfolio/sections/contact";
import { Footer } from "@/components/portfolio/footer";
import { ChatWidget } from "@/components/portfolio/chat-widget";

export default function Home() {
  return (
    <>
      <AnimatedBackground />
      <ScrollProgress />
      <Navbar />
      <main className="relative flex min-h-screen flex-col">
        <Hero />
        <Marquee />
        <About />
        <Services />
        <Projects />
        <TechStack />
        <GithubProfile />
        <Pricing />
        <Testimonials />
        <Contact />
        <Footer />
      </main>
      <ChatWidget />
    </>
  );
}
