"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, LazyMotion, domAnimation, m, useScroll, useSpring, useTransform } from "framer-motion";
import { developer, sections, toolkit } from "./data";
import { ContentProvider } from "@/components/portfolio/content-editor";
import { HomeWidgets } from "@/components/portfolio/home-widgets";
import "./folio.css";

const BelowFold = dynamic(() => import("./below-fold"), { loading: () => null });
import { useHydratedReducedMotion as useReducedMotion } from "@/hooks/use-hydrated-reduced-motion";

type Id = "home" | "more" | "services" | (typeof sections)[number]["id"];

// Portrait pose per section: [x vw, y vh, scale, rotate deg, image, opacity] (desktop / mobile)
const POSES: Record<Id, { d: [number, number, number, number, 0 | 1, number]; m: [number, number, number, number, 0 | 1, number] }> = {
  home: { d: [-2, 0, 1, 0, 0, 1], m: [8, 0, 1, 0, 0, 1] },
  about: { d: [-2, 0, 0.92, 0, 0, 1], m: [18, 6, 0.8, 0, 0, 0.16] },
  work: { d: [3, 4, 0.8, 2, 1, 1], m: [20, 8, 0.7, 0, 1, 0.12] },
  journey: { d: [0, 2, 0.88, -2, 0, 1], m: [18, 8, 0.75, 0, 0, 0.14] },
  toolkit: { d: [-20, 0, 0.9, 0, 0, 1], m: [18, 10, 0.75, 0, 0, 0.14] },
  proof: { d: [4, 6, 0.74, 0, 1, 1], m: [18, 10, 0.7, 0, 1, 0.14] },
  services: { d: [4, 6, 0.74, 0, 1, 1], m: [18, 10, 0.7, 0, 1, 0.14] },
  more: { d: [0, 0, 0.8, 0, 0, 0], m: [0, 0, 0.8, 0, 0, 0] },
  contact: { d: [-62, 0, 1, 0, 0, 0.32], m: [10, 0, 0.9, 0, 0, 0.28] },
};

function useActive(): Id {
  const [active, setActive] = useState<Id>("home");
  useEffect(() => {
    const ids: Id[] = ["home", ...sections.map((s) => s.id), "services", "more"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id as Id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

function useDesktop() {
  const [d, setD] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const f = () => setD(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return d;
}

function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current!;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const move = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; el.style.opacity = "1"; };
    const loop = () => { x += (tx - x) * 0.2; y += (ty - y) * 0.2; el.style.transform = `translate(${x - 7}px,${y - 7}px)`; raf = requestAnimationFrame(loop); };
    window.addEventListener("pointermove", move);
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="f-dot" aria-hidden="true" />;
}

function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  if (reduce) return null;
  return <m.div className="f-prog" aria-hidden="true" style={{ scaleX }} />;
}

function Portrait({ active }: { active: Id }) {
  const desktop = useDesktop();
  const reduce = useReducedMotion();
  const parRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!desktop || reduce) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = parRef.current;
    if (!el) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const move = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 14;
      ty = (e.clientY / window.innerHeight - 0.5) * 10;
    };
    const loop = () => {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move);
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, [desktop, reduce]);
  // One continuous track: section midpoints are measured, never guessed from page height.
  const { scrollY } = useScroll();
  const [track, setTrack] = useState({ stops: [0, 1], poses: [POSES.home.d, POSES.home.d] });
  useEffect(() => {
    const ids: Id[] = ["home", "about", "work", "journey", "toolkit", "proof", "services", "contact", "more"];
    const measure = () => {
      const stops: number[] = [], poses: typeof POSES.home.d[] = [];
      ids.forEach((id) => {
        const el = document.getElementById(id); if (!el) return;
        const top = Math.max(0, el.offsetTop - window.innerHeight * 0.25);
        stops.push(stops.length ? Math.max(top, stops[stops.length - 1] + 1) : 0);
        poses.push(POSES[id][desktop ? "d" : "m"]);
      });
      setTrack({ stops, poses });
    };
    measure();
    const ro = new ResizeObserver(measure);
    const main = document.querySelector("main"); if (main) ro.observe(main);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [desktop]);
  const smoothY = useSpring(scrollY, { stiffness: 240, damping: 36, mass: 0.3 });
  const x = useTransform(smoothY, track.stops, track.poses.map(p => `${p[0]}vw`));
  const y = useTransform(smoothY, track.stops, track.poses.map(p => `${p[1]}vh`));
  const scale = useTransform(smoothY, track.stops, track.poses.map(p => p[2]));
  const rotate = useTransform(smoothY, track.stops, track.poses.map(p => p[3]));
  const opacity = useTransform(smoothY, track.stops, track.poses.map(p => p[5]));
  return (
    <m.div
      className="f-portrait"
      aria-hidden="true"
      initial={false}
      style={reduce ? { transformOrigin: "bottom right", opacity: desktop ? 0.7 : 0.12 } : { x, y, scale, rotate, opacity, transformOrigin: "bottom right" }}
    >
      <div className="f-float"><div ref={parRef} className="f-par"><img src="/assets/cutouts/viridia.webp" alt="" width={645} height={1028} style={{ opacity: 1 }} />
      <img src="/assets/cutouts/fullbody.webp" alt="" width={658} height={1292} style={{ opacity: 0 }} />
      </div></div>
      {desktop && <Orbit show={active === "toolkit"} />}
    </m.div>
  );
}

const WASH: Record<Id, string> = {
  home: "radial-gradient(60% 70% at 78% 40%, #ffd9d2 0%, #f6efe6 60%)",
  about: "radial-gradient(70% 80% at 20% 30%, #ffd2d8 0%, #f6efe6 62%)",
  work: "radial-gradient(60% 70% at 25% 60%, #ffe3cf 0%, #f6efe6 62%)",
  journey: "radial-gradient(70% 80% at 80% 40%, #ffd2d8 0%, #f6efe6 62%)",
  toolkit: "radial-gradient(50% 60% at 50% 50%, #ffc9c2 0%, #f6efe6 65%)",
  proof: "radial-gradient(70% 80% at 30% 40%, #ffe3cf 0%, #f6efe6 62%)",
  services: "radial-gradient(70% 80% at 70% 40%, #ffe3cf 0%, #f6efe6 62%)",
  more: "linear-gradient(#f6efe6,#f6efe6)",
  contact: "linear-gradient(#e8231a,#e8231a)",
};
const NUM: Record<Id, string> = { home: "2026", about: "01", work: "02", journey: "2026", toolkit: "04", proof: "05", services: "06", more: "", contact: "" };

function Backdrop({ active }: { active: Id }) {
  const reduce = useReducedMotion();
  return (
    <div className="f-backdrop" aria-hidden="true">
      <m.div className="f-wash" initial={false} animate={{ background: WASH[active] }} transition={{ duration: reduce ? 0 : 0.9 }} />
      <AnimatePresence initial={false}>
        <m.span key={NUM[active]} className="f-numeral" initial={reduce ? false : { opacity: 0, x: -40 }} animate={{ opacity: active === "contact" || active === "more" ? 0 : 1, x: 0 }} transition={{ duration: 0.7 }}>{NUM[active]}</m.span>
      </AnimatePresence>
      <i className="f-diag d1" /><i className="f-diag d2" />
    </div>
  );
}

function Intro() {
  const reduce = useReducedMotion();
  const [gone, setGone] = useState(false);
  if (reduce || gone) return null;
  return (
    <m.div className="f-intro" aria-hidden="true" initial={{ clipPath: "inset(0 0 0 0)" }} animate={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 0.65, delay: 0.15, ease: [0.76, 0, 0.24, 1] }} onAnimationComplete={() => setGone(true)}>
      <span>YASEEN.</span>
    </m.div>
  );
}

function ReelSection() {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v || reduce) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      else { v.pause(); setPlaying(false); }
    }, { threshold: 0.5 });
    io.observe(v);
    return () => io.disconnect();
  }, [reduce]);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { v.play().then(() => setPlaying(true)).catch(() => {}); } else { v.pause(); setPlaying(false); }
  };
  return (
    <section id="reel" className="f-reelsec" aria-label="Showreel">
      <div className="f-wrap">
        <p className="f-label" style={{ color: "#fff" }}>(00) - Showreel</p>
        <div className="f-vid">
          <video ref={ref} muted loop playsInline preload="metadata" poster="/assets/hero/reel-poster.jpg" aria-label="Short showreel of this portfolio, no sound">
            <source src="/assets/hero/reel-mobile.mp4" type="video/mp4" media="(max-width: 899px)" />
            <source src="/assets/hero/reel-desktop.mp4" type="video/mp4" />
          </video>
          <button type="button" className="f-vbtn" onClick={toggle} aria-pressed={playing}>{playing ? "Pause reel" : "Play reel"}</button>
        </div>
      </div>
    </section>
  );
}


function Orbit({ show }: { show: boolean }) {
  const reduce = useReducedMotion();
  const items = useMemo(() => toolkit.slice(0, 16), []);
  const n1 = 8;
  return (
    <>
      <div className="f-orbit" aria-hidden="true" style={{ opacity: show && !reduce ? 1 : 0, display: reduce ? "none" : undefined }}>
        {items.map((t, i) => {
          const ring = i < n1 ? 0 : 1;
          const count = ring === 0 ? n1 : items.length - n1;
          const idx = ring === 0 ? i : i - n1;
          const a = (360 / count) * idx + (ring ? 20 : 0);
          return (
            <span
              key={t}
              className={`f-pill${ring ? " dark" : ""}`}
              style={{ ["--a" as string]: `${a}deg`, ["--r" as string]: ring ? "calc(var(--w) * 1.02)" : "calc(var(--w) * 0.66)", ["--t" as string]: ring ? "46s" : "32s", animationDirection: ring ? "reverse" : "normal" }}
            >
              {t}
            </span>
          );
        })}
      </div>
    </>
  );
}
function Reel() {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v || reduce) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      else { v.pause(); setPlaying(false); }
    }, { threshold: 0.4 });
    io.observe(v);
    return () => io.disconnect();
  }, [reduce]);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => {}); else { v.pause(); setPlaying(false); }
  };
  return (
    <div id="reel" className="f-reel">
      <video ref={ref} muted loop playsInline preload="metadata" poster="/assets/hero/reel-poster.jpg" aria-label="Short showreel of this portfolio, no sound">
        <source src="/assets/hero/reel-mobile.mp4" type="video/mp4" media="(max-width: 899px)" />
        <source src="/assets/hero/reel-desktop.mp4" type="video/mp4" />
      </video>
      <button type="button" className="f-vbtn" onClick={toggle} aria-pressed={playing}>{playing ? "Pause reel" : "Play reel"}</button>
    </div>
  );
}

// Under 768px the two-row pill nav becomes one menu button; the panel reuses the pill styling.
function MobileMenu({ active }: { active: Id }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const items = [...sections.map((s) => ({ id: s.id as Id, label: s.label })), { id: "more" as Id, label: "More" }];
  const current = items.find((i) => i.id === active)?.label;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onDown = (e: PointerEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    const onScroll = () => setOpen(false);
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); window.removeEventListener("scroll", onScroll); };
  }, [open]);
  return (
    <div className="f-mnav" ref={wrap}>
      <a className="f-mnav-logo" href="#home" aria-label="Yaseen Ahmad, home">YASEEN<i>.</i></a>
      <button type="button" className="f-mnav-btn" aria-expanded={open} aria-controls="f-mnav-panel" onClick={() => setOpen((o) => !o)}>
        <span className="f-mnav-cur">{open ? "Close" : current && active !== "home" ? current : "Menu"}</span>
        <span className={`f-burger${open ? " x" : ""}`} aria-hidden="true"><i /><i /></span>
      </button>
      <AnimatePresence>
        {open && (
          <m.nav
            id="f-mnav-panel"
            className="f-mnav-panel"
            aria-label="Sections"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: reduce ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {items.map((it, i) => (
              <m.a
                key={it.id}
                href={`#${it.id}`}
                aria-current={active === it.id}
                onClick={() => setOpen(false)}
                initial={reduce ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduce ? 0 : 0.04 + i * 0.03, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                {it.label}
              </m.a>
            ))}
          </m.nav>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Folio() {
  const active = useActive();
  return (
    <LazyMotion features={domAnimation}>
    <ContentProvider>
      <div className="folio">
        <a className="f-skip" href="#about">Skip to content</a>
        <ScrollProgress />
        <Cursor />
        <header className="f-header">
          <a className="f-logo" href="#home" aria-label="Yaseen Ahmad, home">YASEEN<i>.</i></a>
          <nav className="f-nav" aria-label="Sections">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} aria-current={active === s.id}>{s.label}</a>
            ))}
            <a href="#more" aria-current={active === "more"}>More</a>
          </nav>
          <MobileMenu active={active} />
        </header>
        <Backdrop active={active} />
        <Intro />
        <Portrait active={active} />

        <main id="main">
          <section id="home" className="f-hero" aria-label="Introduction">
            <p className="f-name" data-t={developer.firstName} aria-hidden="true">{developer.firstName.split("").map((c, i) => <span key={i} className="f-ch" style={{ animationDelay: `${0.42 + i * 0.045}s` }}>{c}</span>)}</p>
            <div className="f-wrap">
              <div className="f-left">
                <p className="f-hi">Hi, I&apos;m <b>{developer.name}</b> -</p>
                <h1 className="f-role">Full-stack <em>developer.</em></h1>
                <p className="f-p">{developer.tagline} Based in {developer.location}.</p>
                <div className="f-cta">
                  <a className="f-btn red" href="#work">See my work</a>
                  <a className="f-btn ghost" href="#reel">Watch reel</a>
                  <a className="f-btn ghost" href="#contact">Get in touch</a>
                </div>
                <Reel />
                <p className="f-scrollhint" aria-hidden="true">SCROLL (01 - 06)</p>
              </div>
            </div>
          </section>

          <BelowFold />

        </main>
              </div>
      <HomeWidgets />
    </ContentProvider>
    </LazyMotion>
  );
}
