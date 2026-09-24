"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Play, Facebook, Linkedin, Instagram, MessageCircle } from "lucide-react";
import { useContent } from "@/components/portfolio/content-editor";

/**
 * VIRIDIA-inspired hero.
 * Dark field-green full-screen hero: huge wide-tracked title, field tagline,
 * Discover / Connect actions, photo bleeding in from the right, and a bottom
 * bar with showreel + mission/vision + socials.
 *
 * The desktop photo carries a "move the light to reveal" spotlight: the photo
 * sits dark by default and a radial spotlight mask follows the cursor (smoothed
 * via rAF), revealing the bright photo only inside the light circle.
 */

type LightPos = { x: number; y: number };

const SPOTLIGHT_HOME = { xPct: 0.62, yPct: 0.38 };
const SPOTLIGHT_CSS =
  "radial-gradient(circle 260px at var(--mx, 62%) var(--my, 38%), black 0%, transparent 70%)";

function setLightVars(photo: HTMLDivElement, glow: HTMLDivElement, x: number, y: number): void {
  photo.style.setProperty("--mx", `${x.toFixed(1)}px`);
  photo.style.setProperty("--my", `${y.toFixed(1)}px`);
  glow.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
}

/**
 * Tracks the cursor across the whole hero section and drives the spotlight
 * with a smoothed rAF loop. Direct DOM style updates only — no re-renders
 * on mousemove. On touch devices the light drifts on its own; with
 * prefers-reduced-motion it stays parked at a static position.
 */
function useLightReveal() {
  const photoRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const target = useRef<LightPos>({ x: 0, y: 0 });
  const smooth = useRef<LightPos>({ x: 0, y: 0 });
  const started = useRef(false);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    const photo = photoRef.current;
    const glow = glowRef.current;
    if (!photo || !glow) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rect = photo.getBoundingClientRect();
    const home: LightPos = {
      x: rect.width * SPOTLIGHT_HOME.xPct,
      y: rect.height * SPOTLIGHT_HOME.yPct,
    };
    target.current = { ...home };
    smooth.current = { ...home };

    if (reduced) {
      setLightVars(photo, glow, home.x, home.y);
      return;
    }

    const coarse = window.matchMedia("(hover: none)").matches;
    const t0 = performance.now();
    let raf = 0;

    const tick = (now: number): void => {
      let tx = target.current.x;
      let ty = target.current.y;
      if (coarse && !started.current) {
        // touch: drift the light on a slow lissajous path
        const r = photo.getBoundingClientRect();
        const t = (now - t0) / 1000;
        tx = r.width * (0.5 + 0.32 * Math.sin(t * 0.7));
        ty = r.height * (0.5 + 0.3 * Math.sin(t * 1.05 + 1.3));
      }
      const s = smooth.current;
      s.x += (tx - s.x) * 0.12;
      s.y += (ty - s.y) * 0.12;
      setLightVars(photo, glow, s.x, s.y);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    let hintTimer = 0;
    if (coarse) {
      // no cursor on touch, so retire the hint on its own
      hintTimer = window.setTimeout(() => setHintVisible(false), 6000);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (hintTimer) window.clearTimeout(hintTimer);
    };
  }, []);

  const onSectionMouseMove = (e: ReactMouseEvent<HTMLElement>): void => {
    const photo = photoRef.current;
    if (!photo) return;
    const rect = photo.getBoundingClientRect();
    target.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (!started.current) {
      started.current = true;
      setHintVisible(false);
    }
  };

  return { photoRef, glowRef, hintVisible, onSectionMouseMove };
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Hero() {
  const { tj } = useContent();
  const socials = tj<Record<string, string>>("socials.links");
  const { photoRef, glowRef, hintVisible, onSectionMouseMove } = useLightReveal();

  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

  const socialItems = [
    { label: "Facebook", href: socials.facebook, Icon: Facebook },
    { label: "LinkedIn", href: socials.linkedin, Icon: Linkedin },
    { label: "Instagram", href: "https://instagram.com/yaseenahmadexe", Icon: Instagram },
    { label: "X", href: socials.twitter, Icon: XIcon },
  ];

  return (
    <section
      id="home"
      onMouseMove={onSectionMouseMove}
      className="viridia-hero relative flex min-h-screen flex-col overflow-hidden bg-[#0a0f0a] text-white"
    >
      {/* ---- Background: dark field-green gradients ---- */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,#0a0f0a_0%,#0d140d_35%,#16241a_70%,#1a2a1a_100%)]" />
        <div className="viridia-drift absolute -left-40 top-1/4 h-[34rem] w-[34rem] rounded-full bg-green-500/10 blur-[140px]" />
        <div className="viridia-drift absolute bottom-0 right-1/4 h-[28rem] w-[28rem] rounded-full bg-emerald-400/[0.07] blur-[120px]" style={{ animationDelay: "-7s" }} />
        {/* low green light wrapping the frame */}
        <div className="viridia-frame absolute inset-0" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-green-400/[0.06] to-transparent" />
      </div>

      {/* ---- Photo: right side, fading into the field, with light-reveal spotlight ---- */}
      <motion.div
        ref={photoRef}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] md:block [mask-image:linear-gradient(to_right,transparent_0%,black_28%,black_100%)]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 28%, black 100%)",
        }}
      >
        {/* dark base layer: low-light default state */}
        <img
          src="/assets/yaseen-viridia.png"
          alt="Yaseen Ahmad"
          className="h-full w-full object-cover object-top [filter:brightness(0.22)_saturate(0.35)]"
          loading="eager"
        />
        {/* bright reveal layer: visible only inside the spotlight circle */}
        <img
          src="/assets/yaseen-viridia.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-top"
          style={{ maskImage: SPOTLIGHT_CSS, WebkitMaskImage: SPOTLIGHT_CSS }}
          loading="eager"
        />
        {/* soft green glow that travels with the cursor */}
        <div ref={glowRef} className="absolute left-0 top-0 h-0 w-0">
          <div className="h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400/[0.13] blur-[100px]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0a] via-transparent to-[#0a0f0a]/40" />
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#0d140d] to-transparent" />
        {/* one-time hint, fades forever after the first mousemove */}
        <div
          className={`absolute bottom-28 left-8 transition-opacity duration-700 ${
            hintVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/40">
            ○ Move the light to reveal
          </p>
        </div>
      </motion.div>

      {/* ---- Main content ---- */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-40 pt-32 sm:px-8 md:pb-44 md:pt-36">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-green-300/80"
        >
          <span className="h-px w-10 bg-green-400/60" />
          Full-Stack Developer
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(3.8rem,13vw,11rem)] font-black leading-[0.95] tracking-[0.06em] text-white drop-shadow-[0_0_40px_rgba(74,222,128,0.25)]"
        >
          YASEEN
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
        >
          I Build. I Ship. I Scale. Step into the field with full-stack built for
          low light and high stakes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-9 flex flex-wrap items-center gap-5"
        >
          {/* Discover pill */}
          <button
            onClick={() => scrollTo("#projects")}
            className="group flex items-center gap-3 rounded-full border border-white/20 bg-white/[0.04] py-2 pl-7 pr-2 backdrop-blur transition-all duration-300 hover:border-green-400/50 hover:bg-white/[0.08]"
          >
            <span className="text-sm font-semibold tracking-wide text-white">Discover</span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 transition-all duration-300 group-hover:bg-green-400 group-hover:text-black">
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </button>

          {/* Connect */}
          <button
            onClick={() => scrollTo("#contact")}
            className="group flex items-center gap-3 rounded-full py-2 pl-1 pr-4 transition-colors"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] backdrop-blur transition-all duration-300 group-hover:border-green-400/50 group-hover:bg-green-400/15">
              <MessageCircle className="h-4 w-4 text-green-300" />
            </span>
            <span className="text-sm font-semibold tracking-wide text-white/85 transition-colors group-hover:text-white">
              Connect With Us
            </span>
          </button>
        </motion.div>

        {/* Mobile photo */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mt-10 md:hidden"
        >
          <div className="overflow-hidden rounded-3xl border border-green-400/20 shadow-[0_0_60px_rgba(74,222,128,0.15)]">
            <img
              src="/assets/yaseen-viridia.png"
              alt="Yaseen Ahmad"
              className="h-72 w-full object-cover object-top"
              loading="eager"
            />
          </div>
        </motion.div>
      </div>

      {/* ---- Bottom bar ---- */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.7 }}
        className="absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-black/45 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8 md:flex-row md:items-center md:gap-6 md:py-5">
          {/* Showreel */}
          <button
            onClick={() => scrollTo("#projects")}
            className="group flex shrink-0 items-center gap-3"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/[0.04] transition-all duration-300 group-hover:border-green-400/60 group-hover:bg-green-400/15">
              <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/80 transition-colors group-hover:text-white">
              Play Showreel
            </span>
          </button>

          <div className="hidden h-10 w-px bg-white/10 md:block" />

          {/* Point 1 */}
          <div className="flex flex-1 items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 text-[10px] font-bold text-white/60">
              1
            </span>
            <p className="text-xs leading-relaxed text-white/55">
              To build full-stack products that move with the business — engineered for
              low light, hard deadlines and long days in production.
            </p>
          </div>

          <div className="hidden h-10 w-px bg-white/10 md:block" />

          {/* Point 2 */}
          <div className="flex flex-1 items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 text-[10px] font-bold text-white/60">
              2
            </span>
            <p className="text-xs leading-relaxed text-white/55">
              To be the standard in field-ready software, turning clean architecture
              into products you would use anywhere — not just anywhere hostile.
            </p>
          </div>

          {/* Arrow + socials */}
          <div className="flex shrink-0 items-center gap-4">
            <button
              onClick={() => scrollTo("#about")}
              aria-label="Scroll to about section"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/[0.04] transition-all duration-300 hover:border-green-400/60 hover:bg-green-400/15"
            >
              <ArrowUpRight className="h-4 w-4 text-white" />
            </button>
            <div className="flex items-center gap-3">
              {socialItems.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-white/50 transition-all duration-200 hover:scale-110 hover:text-green-300"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
