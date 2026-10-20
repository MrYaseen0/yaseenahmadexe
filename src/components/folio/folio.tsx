"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { developer, experiences, proof, projects, sections, socials, toolkit, type Project } from "./data";
import { ContentProvider } from "@/components/portfolio/content-editor";
import { Contact } from "@/components/portfolio/sections/contact";
import { Footer } from "@/components/portfolio/footer";
import { HomeWidgets } from "@/components/portfolio/home-widgets";
import dynamic from "next/dynamic";
import "./folio.css";

const Services = dynamic(() => import("@/components/portfolio/sections/services").then((m) => m.Services), { ssr: true });
const Blog = dynamic(() => import("@/components/portfolio/sections/blog").then((m) => m.Blog), { ssr: true });
const Booking = dynamic(() => import("@/components/portfolio/sections/booking").then((m) => m.Booking), { ssr: true });
const Pricing = dynamic(() => import("@/components/portfolio/sections/pricing").then((m) => m.Pricing), { ssr: true });
const Testimonials = dynamic(() => import("@/components/portfolio/sections/testimonials").then((m) => m.Testimonials), { ssr: true });
const Faq = dynamic(() => import("@/components/portfolio/sections/faq").then((m) => m.Faq), { ssr: true });

type Id = "home" | "more" | (typeof sections)[number]["id"];

// Portrait pose per section: [x vw, y vh, scale, rotate deg, image, opacity] (desktop / mobile)
const POSES: Record<Id, { d: [number, number, number, number, 0 | 1, number]; m: [number, number, number, number, 0 | 1, number] }> = {
  home: { d: [0, 0, 1, 0, 0, 1], m: [8, 0, 1, 0, 0, 1] },
  about: { d: [-2, 0, 0.92, 0, 0, 1], m: [18, 6, 0.8, 0, 0, 0.16] },
  work: { d: [3, 4, 0.8, 2, 1, 1], m: [20, 8, 0.7, 0, 1, 0.12] },
  journey: { d: [0, 2, 0.88, -2, 0, 1], m: [18, 8, 0.75, 0, 0, 0.14] },
  toolkit: { d: [-20, 0, 0.9, 0, 0, 1], m: [18, 10, 0.75, 0, 0, 0.14] },
  proof: { d: [4, 6, 0.74, 0, 1, 1], m: [18, 10, 0.7, 0, 1, 0.14] },
  more: { d: [0, 0, 0.8, 0, 0, 0], m: [0, 0, 0.8, 0, 0, 0] },
  contact: { d: [-62, 0, 1, 0, 0, 0.32], m: [10, 0, 0.9, 0, 0, 0.28] },
};

function useActive(): Id {
  const [active, setActive] = useState<Id>("home");
  useEffect(() => {
    const ids: Id[] = ["home", ...sections.map((s) => s.id), "more"];
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

function Portrait({ active }: { active: Id }) {
  const desktop = useDesktop();
  const reduce = useReducedMotion();
  const p = POSES[active][desktop ? "d" : "m"];
  const [x, y, scale, rot, img, op] = p;
  return (
    <motion.div
      className="f-portrait"
      aria-hidden="true"
      initial={false}
      animate={{ x: `${x}vw`, y: `${y}vh`, scale, rotate: rot, opacity: op }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 18, mass: 0.9 }}
      style={{ transformOrigin: "bottom right" }}
    >
      <div className="f-float"><img src="/assets/cutouts/viridia.webp" alt="" width={645} height={1028} style={{ opacity: img === 0 ? 1 : 0 }} />
      <img src="/assets/cutouts/fullbody.webp" alt="" width={658} height={1292} style={{ opacity: img === 1 ? 1 : 0 }} />
      </div>
      {desktop && <Orbit show={active === "toolkit"} />}
    </motion.div>
  );
}

function Mock({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rx = useTransform(scrollYProgress, [0, 0.5, 1], [18, 0, -14]);
  const ry = useTransform(scrollYProgress, [0, 0.5, 1], [-16, -6, 8]);
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.setProperty("--tx", `${(-py * 10).toFixed(1)}deg`);
    e.currentTarget.style.setProperty("--ty", `${(px * 12).toFixed(1)}deg`);
  };
  return (
    <div className="f-mock" ref={ref} onPointerMove={onMove} onPointerLeave={(e) => { e.currentTarget.style.removeProperty("--tx"); e.currentTarget.style.removeProperty("--ty"); }}>
      <motion.div className="f-mock-in" style={reduce ? undefined : { rotateX: rx, rotateY: ry }}>
        <img src={project.image} alt={`${project.title} preview`} loading="lazy" width={1200} height={630} />
      </motion.div>
    </div>
  );
}

const fade = { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-10% 0px" }, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } };

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
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduce) { v.pause(); return; }
    v.play().catch(() => {});
  }, [reduce]);
  return (
    <div className="f-reel" aria-hidden="true">
      <video ref={ref} muted loop playsInline preload="none" autoPlay={!reduce} poster="/assets/hero/hero-poster.jpg" src="/assets/hero/hero-loop.mp4" tabIndex={-1} />
    </div>
  );
}

export function Folio() {
  const active = useActive();
  const tools = [...toolkit, ...toolkit];
  return (
    <ContentProvider>
      <div className="folio">
        <a className="f-skip" href="#about">Skip to content</a>
        <Cursor />
        <header className="f-header">
          <a className="f-logo" href="#home" aria-label="Yaseen Ahmad, home">YASEEN<i>.</i></a>
          <nav className="f-nav" aria-label="Sections">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} aria-current={active === s.id}>{s.label}</a>
            ))}
            <a href="#more" aria-current={active === "more"}>More</a>
          </nav>
        </header>
        <Portrait active={active} />

        <main id="main">
          <section id="home" className="f-hero" aria-label="Introduction">
            <p className="f-name" aria-hidden="true">{developer.firstName}</p>
            <Reel />
            <div className="f-wrap">
              <div className="f-left">
                <p className="f-hi">Hi, I&apos;m <b>{developer.name}</b> -</p>
                <h1 className="f-role">Full-stack <em>developer.</em></h1>
                <p className="f-p">{developer.tagline} Based in {developer.location}.</p>
                <div className="f-cta">
                  <a className="f-btn red" href="#work">See my work</a>
                  <a className="f-btn ghost" href="#contact">Get in touch</a>
                </div>
                <p className="f-scrollhint" aria-hidden="true">SCROLL (01 - 06)</p>
              </div>
            </div>
          </section>

          <section id="about" className="f-sec">
            <div className="f-wrap"><div className="f-left">
              <motion.div {...fade}>
                <p className="f-label">(01) - About</p>
                <h2 className="f-h2">{developer.aboutTitle.split(" ").slice(0, 2).join(" ")} <em>{developer.aboutTitle.split(" ").slice(2).join(" ")}</em></h2>
                <p className="f-p">{developer.aboutText}</p>
                <p className="f-p">{developer.aboutText2}</p>
                <ul className="f-chips" aria-label="Skills">
                  {developer.skills.map((s, i) => <li key={s} className={`f-chip${i % 3 === 0 ? " red" : ""}`}>{s}</li>)}
                </ul>
                <dl className="f-facts">
                  <div><dt>Based in</dt><dd>{developer.location}</dd></div>
                  <div><dt>Status</dt><dd>{developer.status}</dd></div>
                  <div><dt>Role</dt><dd>{developer.jobTitle}</dd></div>
                  <div><dt>Studying</dt><dd>BS Software Engineering, CECOS</dd></div>
                </dl>
              </motion.div>
            </div></div>
          </section>

          <section id="work" className="f-sec" aria-label="Selected work">
            <div className="f-wrap"><div className="f-left">
              <motion.div {...fade}><p className="f-label">(02) - Selected work</p><h2 className="f-h2">Things I <em>built.</em></h2></motion.div>
            </div></div>
            {projects.map((p, i) => (
              <article key={p.title} className="f-slide">
                <div className="f-wrap"><motion.div className="f-left" {...fade}>
                  <p className="f-count">{String(i + 1).padStart(2, "0")} <span>/ {String(projects.length).padStart(2, "0")}</span></p>
                  <Mock project={p} />
                  <h3 className="f-title">{p.title}</h3>
                  <p className="f-p">{p.blurb}</p>
                  <ul className="f-chips" aria-label={`${p.title} stack`}>{p.tags.map((t) => <li key={t} className="f-chip">{t}</li>)}</ul>
                  <a className="f-link" href={p.github} target="_blank" rel="noopener noreferrer">View on GitHub <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>
                </motion.div></div>
              </article>
            ))}
          </section>

          <section id="journey" className="f-sec">
            <div className="f-wrap"><div className="f-left">
              <motion.div {...fade}><p className="f-label">(03) - Journey</p><h2 className="f-h2">Work and <em>study.</em></h2></motion.div>
              {experiences.map((e, i) => (
                <motion.div key={e.role} className="f-step" {...fade}>
                  <p className="f-bignum" aria-hidden="true">{String(i + 1).padStart(2, "0")}</p>
                  <span className="f-period">{e.period} - {e.type}</span>
                  <h3>{e.role}</h3>
                  <p className="f-hi"><b>{e.company}</b>, {e.location}</p>
                  <p className="f-p">{e.description}</p>
                  <ul>{e.achievements.map((a) => <li key={a}>{a}</li>)}</ul>
                  <ul className="f-chips" aria-label="Tech">{e.tech.map((t) => <li key={t} className="f-chip">{t}</li>)}</ul>
                </motion.div>
              ))}
            </div></div>
          </section>

          <section id="toolkit" className="f-sec f-tool">
            <div className="f-wrap"><div className="f-left">
              <motion.div {...fade}>
                <p className="f-label">(04) - Toolkit</p>
                <h2 className="f-h2">Everything in <em>orbit.</em></h2>
                <p className="f-p">The languages, frameworks and tools I use day to day.</p>
                <ul className="f-chips f-static-tools" aria-label="Tools">
                  {toolkit.map((t, i) => <li key={t} className={`f-chip${i % 4 === 0 ? " red" : ""}`}>{t}</li>)}
                </ul>
              </motion.div>
            </div></div>
            <div className="f-strip" aria-hidden="true"><div>{tools.map((t, i) => <span key={i}>{t} •</span>)}</div></div>
          </section>

          <section id="proof" className="f-sec">
            <div className="f-wrap"><div className="f-left">
              <motion.div {...fade}>
                <p className="f-label">(05) - Proof of work</p>
                <h2 className="f-h2">In <em>numbers.</em></h2>
                <p className="f-p">Figures come from my existing portfolio and GitHub profile.</p>
              </motion.div>
              <div className="f-stage" aria-hidden="true">
                <div className="f-ring">
                  {proof.map((t, i) => (
                    <div key={t.label} className="f-tile" style={{ ["--ry" as string]: `${i * (360 / proof.length)}deg` }}>
                      <b>{t.value}</b><span>{t.label}</span><small>{t.note}</small>
                    </div>
                  ))}
                </div>
              </div>
              <div className="f-grid-proof">
                {proof.map((t) => (
                  <div key={t.label} className="f-tile"><b>{t.value}</b><span>{t.label}</span><small>{t.note}</small></div>
                ))}
              </div>
            </div></div>
          </section>

          <section id="contact" className="f-contact" aria-label="Contact">
            <div className="f-wrap">
              <p className="f-small">(06) - Contact</p>
              <h2 className="f-lets">Let&apos;s talk.</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 30, justifyContent: "space-between", alignItems: "flex-end" }}>
                <p className="f-small" style={{ maxWidth: 260 }}>{developer.location}<br />{developer.status}</p>
                <ul className="f-links" style={{ width: "min(100%,420px)" }}>
                  {[
                    ["Email", socials.email],
                    ["WhatsApp", socials.whatsapp],
                    ["GitHub", socials.github],
                    ["LinkedIn", socials.linkedin],
                    ["X", socials.twitter],
                    ["Instagram", socials.instagram],
                  ].map(([l, h]) => (
                    <li key={l}><a href={h} {...(h.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}><span>{l}</span><span aria-hidden="true">↗</span></a></li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </main>
        <section id="more" className="f-more" aria-label="More from this site" style={{ position: "relative", zIndex: 40 }}>
          <div className="f-wrap">
            <p className="f-label">(07) - More</p>
            <h2 className="f-h2">Services, blog, <em>pricing, FAQ.</em></h2>
            <ul className="f-chips" aria-label="Jump to">
              {[["Services", "#services"], ["Blog", "#blog"], ["Booking", "#booking"], ["Pricing", "#pricing"], ["Testimonials", "#testimonials"], ["FAQ", "#faq"], ["Message form", "#contact-form"]].map(([l, h]) => (
                <li key={l}><a className="f-chip red" href={h} style={{ textDecoration: "none", display: "inline-flex", minHeight: 44, alignItems: "center" }}>{l}</a></li>
              ))}
            </ul>
          </div>
        </section>
        <div style={{ position: "relative", zIndex: 40, background: "#fbfbf9" }}>
          <Services />
          <Blog />
          <Booking />
          <Pricing />
          <Testimonials />
          <Faq />
          <div id="contact-form"><Contact /></div>
          <Footer />
        </div>
      </div>
      <HomeWidgets />
    </ContentProvider>
  );
}
