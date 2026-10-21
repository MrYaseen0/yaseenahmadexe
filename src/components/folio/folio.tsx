"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, useInView } from "framer-motion";
import { developer, experiences, moreProjects, proof, projects, sections, socials, toolkit, type Project } from "./data";
import { ContentProvider } from "@/components/portfolio/content-editor";
import { HomeWidgets } from "@/components/portfolio/home-widgets";
import "./folio.css";
import { useHydratedReducedMotion as useReducedMotion } from "@/hooks/use-hydrated-reduced-motion";

type Id = "home" | "more" | (typeof sections)[number]["id"];

// Portrait pose per section: [x vw, y vh, scale, rotate deg, image, opacity] (desktop / mobile)
const POSES: Record<Id, { d: [number, number, number, number, 0 | 1, number]; m: [number, number, number, number, 0 | 1, number] }> = {
  home: { d: [-2, 0, 1, 0, 0, 1], m: [8, 0, 1, 0, 0, 1] },
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

function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  if (reduce) return null;
  return <motion.div className="f-prog" aria-hidden="true" style={{ scaleX }} />;
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
    const ids: Id[] = ["home", "about", "work", "journey", "toolkit", "proof", "contact", "more"];
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
    <motion.div
      className="f-portrait"
      aria-hidden="true"
      initial={false}
      style={reduce ? { transformOrigin: "bottom right", opacity: desktop ? 0.7 : 0.12 } : { x, y, scale, rotate, opacity, transformOrigin: "bottom right" }}
    >
      <div className="f-float"><div ref={parRef} className="f-par"><img src="/assets/cutouts/viridia.webp" alt="" width={645} height={1028} style={{ opacity: 1 }} />
      <img src="/assets/cutouts/fullbody.webp" alt="" width={658} height={1292} style={{ opacity: 0 }} />
      </div></div>
      {desktop && <Orbit show={active === "toolkit"} />}
    </motion.div>
  );
}

const WASH: Record<Id, string> = {
  home: "radial-gradient(60% 70% at 78% 40%, #ffd9d2 0%, #f6efe6 60%)",
  about: "radial-gradient(70% 80% at 20% 30%, #ffd2d8 0%, #f6efe6 62%)",
  work: "radial-gradient(60% 70% at 25% 60%, #ffe3cf 0%, #f6efe6 62%)",
  journey: "radial-gradient(70% 80% at 80% 40%, #ffd2d8 0%, #f6efe6 62%)",
  toolkit: "radial-gradient(50% 60% at 50% 50%, #ffc9c2 0%, #f6efe6 65%)",
  proof: "radial-gradient(70% 80% at 30% 40%, #ffe3cf 0%, #f6efe6 62%)",
  more: "linear-gradient(#f6efe6,#f6efe6)",
  contact: "linear-gradient(#e8231a,#e8231a)",
};
const NUM: Record<Id, string> = { home: "2026", about: "01", work: "02", journey: "2026", toolkit: "04", proof: "05", more: "", contact: "" };

function Backdrop({ active }: { active: Id }) {
  const reduce = useReducedMotion();
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; }, []);
  return (
    <div className="f-backdrop" aria-hidden="true">
      <motion.div className="f-wash" initial={false} animate={{ background: WASH[active] }} transition={{ duration: reduce ? 0 : 0.9 }} />
      <motion.span key={NUM[active]} className="f-numeral" initial={reduce || !mounted.current ? false : { opacity: 0, x: -40 }} animate={{ opacity: active === "contact" || active === "more" ? 0 : 1, x: 0 }} transition={{ duration: 0.7 }}>{NUM[active]}</motion.span>
      <i className="f-diag d1" /><i className="f-diag d2" />
    </div>
  );
}

function Intro() {
  const reduce = useReducedMotion();
  const [gone, setGone] = useState(false);
  if (reduce || gone) return null;
  return (
    <motion.div className="f-intro" aria-hidden="true" initial={{ clipPath: "inset(0 0 0 0)" }} animate={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 0.65, delay: 0.15, ease: [0.76, 0, 0.24, 1] }} onAnimationComplete={() => setGone(true)}>
      <span>YASEEN.</span>
    </motion.div>
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

function ProjectDetails({ project }: { project: Project }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <>
    <button className="f-btn ghost" type="button" onClick={() => dialog.current?.showModal()}>Project details ↗</button>
    <dialog ref={dialog} className="f-project-dialog" onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="f-dialog-head"><span className="f-label">Project overview</span><button type="button" className="f-dialog-close" onClick={() => dialog.current?.close()} autoFocus aria-label="Close project details">Close ×</button></div>
      <h2 className="f-h2">{project.title}</h2><p className="f-p">{project.blurb}</p>
      {(project.details || []).map((text) => <p className="f-p" key={text}>{text}</p>)}
      {project.gallery?.map((image) => <figure key={image.src}><img src={image.src} alt={`${project.title} interface`} width={1280} height={713} loading="lazy"/><figcaption>{image.caption}</figcaption></figure>)}
      {!project.gallery?.length && <p className="f-p">The repository contains the source and documentation. No verified live UI capture is available for this project.</p>}
      <ul className="f-chips">{project.tags.map(tag=><li className="f-chip" key={tag}>{tag}</li>)}</ul>
      <div className="f-project-actions"><a className="f-btn red" href={project.github} target="_blank" rel="noopener noreferrer">View Repo ↗</a>{project.live && <a className="f-btn ghost" href={project.live} target="_blank" rel="noopener noreferrer">Visit live site ↗</a>}</div>
    </dialog>
  </>;
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
        {(project.image.includes("game-booster") || project.image.includes("/ui/")) ? (
          <img src={project.image} alt={`${project.title} app screenshot`} loading="lazy" width={1200} height={630} />
        ) : (
          <div className="f-tcard" role="img" aria-label={`${project.title}: ${project.tags.join(", ")}`}>
            <b>{project.title}</b>
            <span>{project.tags.join(" / ")}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

const fade = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } };

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  return <div ref={ref} className={`f-reveal ${className}`} data-visible={visible}>{children}</div>;
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

// Swap this path for his own 4-second clip when he provides it (public/assets/hero/).
const DUO_VIDEO = ""; // empty until his own clip is added; the video frame stays hidden meanwhile

function Duo() {
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
    const v = ref.current; if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => {}); else { v.pause(); setPlaying(false); }
  };
  return (
    <div className={`f-duo${DUO_VIDEO ? "" : " solo"}`}>
      <figure className="f-duo-a">
        <img src="/assets/cutouts/viridia.webp" alt="Yaseen Ahmad wearing sunglasses, smiling" width={645} height={1028} loading="lazy" />
        <figcaption>Photo</figcaption>
      </figure>
      {DUO_VIDEO && <figure className="f-duo-b">
        <video ref={ref} src={DUO_VIDEO} poster="/assets/hero/reel-poster.jpg" muted loop playsInline preload="metadata" aria-label="Motion clip" />
        <button type="button" className="f-vbtn" onClick={toggle} aria-pressed={playing}>{playing ? "Pause motion" : "Play motion"}</button>
        <figcaption>Motion</figcaption>
      </figure>}
    </div>
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

export function Folio() {
  const active = useActive();
  const tools = [...toolkit, ...toolkit];
  return (
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

          <section id="about" className="f-sec">
            <div className="f-wrap"><div className="f-left">
              <Reveal>
                <p className="f-label">(01) - About</p>
                <h2 className="f-h2">{developer.aboutTitle.split(" ").slice(0, 2).join(" ")} <em>{developer.aboutTitle.split(" ").slice(2).join(" ")}</em></h2>
                <p className="f-p">{developer.aboutText}</p>
                <p className="f-p">{developer.aboutText2}</p>
                <ul className="f-chips" aria-label="Skills">
                  {developer.skills.map((s, i) => <li key={s} className={`f-chip${i % 3 === 0 ? " red" : ""}`}>{s}</li>)}
                </ul>
                <Duo />
                <dl className="f-facts">
                  <div><dt>Based in</dt><dd>{developer.location}</dd></div>
                  <div><dt>Status</dt><dd>{developer.status}</dd></div>
                  <div><dt>Role</dt><dd>{developer.jobTitle}</dd></div>
                  <div><dt>Studying</dt><dd>BS Software Engineering, CECOS</dd></div>
                </dl>
              </Reveal>
            </div></div>
          </section>

          <section id="work" className="f-sec" aria-label="Selected work">
            <div className="f-wrap"><div className="f-left">
              <Reveal><p className="f-label">(02) - Selected work</p><h2 className="f-h2">Selected <em>projects.</em></h2></Reveal>
            </div></div>
            {projects.map((p, i) => (
              <article key={p.title} className="f-slide">
                <div className="f-wrap"><Reveal className="f-left">
                  <p className="f-count">{String(i + 1).padStart(2, "0")} <span>/ {String(projects.length).padStart(2, "0")}</span></p>
                  <Mock project={p} />
                  <h3 className="f-title">{p.title}</h3>
                  <p className="f-p">{p.blurb}</p>
                  <ul className="f-chips" aria-label={`${p.title} stack`}>{p.tags.map((t) => <li key={t} className="f-chip">{t}</li>)}</ul>
                  <div className="f-project-actions"><ProjectDetails project={p} /><a className="f-link" href={p.github} target="_blank" rel="noopener noreferrer">View Repo <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a></div>
                </Reveal></div>
              </article>
            ))}
            <div className="f-wrap f-more-work">
              <motion.h3 className="f-also" {...fade}>More from my GitHub <em>({moreProjects.length})</em></motion.h3>
              <p className="f-p f-mnote">Public repositories and projects listed in my portfolio. Notes come from each repo&apos;s README or description.</p>
              <ul className="f-mgrid">
                {moreProjects.map((m, i) => (
                  <motion.li key={m.title} className="f-mcard" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-8% 0px" }} transition={{ duration: 0.45, delay: (i % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}>
                    <span className="f-mnum" aria-hidden="true">{String(i + 7).padStart(2, "0")}</span>
                    <h4>{m.title}</h4>
                    <p>{m.note}</p>
                    <span className="f-mtags">{m.tags.join(" / ")}</span>
                    {m.href && <a href={m.href} target="_blank" rel="noopener noreferrer">View on GitHub <span aria-hidden="true">↗</span><span className="sr-only"> ({m.title}, opens in a new tab)</span></a>}
                  </motion.li>
                ))}
              </ul>
            </div>
          </section>

          <section id="journey" className="f-sec">
            <div className="f-wrap"><div className="f-left">
              <Reveal><p className="f-label">(03) - Journey</p><h2 className="f-h2">Work and <em>study.</em></h2></Reveal>
              {experiences.map((e, i) => (
                <Reveal key={e.role} className="f-step">
                  <p className="f-bignum" aria-hidden="true">{String(i + 1).padStart(2, "0")}</p>
                  <span className="f-period">{e.period} - {e.type}</span>
                  <h3>{e.role}</h3>
                  <p className="f-hi"><b>{e.company}</b>, {e.location}</p>
                  <p className="f-p">{e.description}</p>
                  <ul>{e.achievements.map((a) => <li key={a}>{a}</li>)}</ul>
                  <ul className="f-chips" aria-label="Tech">{e.tech.map((t) => <li key={t} className="f-chip">{t}</li>)}</ul>
                </Reveal>
              ))}
            </div></div>
          </section>

          <section id="toolkit" className="f-sec f-tool">
            <div className="f-wrap"><div className="f-left">
              <Reveal>
                <p className="f-label">(04) - Toolkit</p>
                <h2 className="f-h2">Everything in <em>orbit.</em></h2>
                <p className="f-p">The languages, frameworks and tools I use day to day.</p>
                <ul className="f-chips f-static-tools" aria-label="Tools">
                  {toolkit.map((t, i) => <li key={t} className={`f-chip${i % 4 === 0 ? " red" : ""}`}>{t}</li>)}
                </ul>
              </Reveal>
            </div></div>
            <div className="f-strip" aria-hidden="true"><div>{tools.map((t, i) => <span key={i}>{t} •</span>)}</div></div>
          </section>

          <section id="proof" className="f-sec">
            <div className="f-wrap"><div className="f-left">
              <Reveal>
                <p className="f-label">(05) - Proof of work</p>
                <h2 className="f-h2">In <em>numbers.</em></h2>
                <p className="f-p">Figures come from my existing portfolio and GitHub profile.</p>
              </Reveal>
              <div className="f-stage" aria-hidden="true">
                <div className="f-ring">
                  {proof.map((t, i) => (
                    <div key={t.label} className="f-tile" style={{ ["--i" as string]: i }}>
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

          <section id="services" className="f-sec" aria-label="Freelance services">
            <div className="f-wrap"><div className="f-left">
              <Reveal>
                <p className="f-label">(06) - Freelance</p>
                <h2 className="f-h2">Working <em>with me.</em></h2>
                <p className="f-p" style={{ maxWidth: 420 }}>I take on freelance web projects as a full-stack developer, from a first brief to a deployed site or app.</p>
                <ul className="f-chips" aria-label="What I build" style={{ maxWidth: 420 }}>
                  {["Web apps", "Business and portfolio sites", "Dashboards and admin panels", "REST APIs", "Responsive UI"].map((t, i) => <li key={t} className={`f-chip${i % 3 === 0 ? " red" : ""}`}>{t}</li>)}
                </ul>
                <ol className="f-p" style={{ listStyle: "none", padding: 0, margin: "24px 0 0", display: "grid", gap: 10, maxWidth: 420 }}>
                  <li><b>01 Brief.</b> You email the goal and scope.</li>
                  <li><b>02 Scope.</b> Timing, cost and payment are agreed in writing for your specific project before work starts.</li>
                  <li><b>03 Build.</b> Next.js, React and Node.js, with the work kept in version control.</li>
                  <li><b>04 Handover.</b> You get the source code and the deployed result.</li>
                </ol>
                <p className="f-p" style={{ maxWidth: 420 }}><a href="mailto:yaseenahmad.exe@gmail.com?subject=Project%20enquiry" style={{ textDecoration: "underline" }}>Start with an email</a>. Examples above are in the selected projects section.</p>
              </Reveal>
            </div></div>
          </section>

          <section id="contact" className="f-contact" aria-label="Contact">
            <div className="f-wrap">
              <p className="f-small">(07) - Contact</p>
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
                    ["CV (PDF)", "/Yaseen-Ahmad-CV.pdf"],
                  ].map(([l, h]) => (
                    <li key={l}><a href={h} {...(h.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}><span>{l}</span><span aria-hidden="true">↗</span></a></li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </main>
        <section id="more" className="f-more" aria-label="More information" style={{position:"relative",zIndex:40}}>
          <div className="f-wrap"><p className="f-label">More information</p><h2 className="f-h2">Let&apos;s discuss <em>the scope.</em></h2><p className="f-p">For a project enquiry, share what you want to build. Scope, timing, cost and support need to be agreed for that project.</p><div className="f-project-actions"><a className="f-btn red" href={socials.email}>Email Yaseen</a><a className="f-btn ghost" href="/Yaseen-Ahmad-CV.pdf">Download CV (PDF)</a><a className="f-link" href="/freelance-software-engineer">Freelance software engineer</a><a className="f-link" href="/hire-web-developer-peshawar">Web developer in Peshawar</a><a className="f-link" href="/mern-stack-developer">React and Node.js developer</a><a className="f-link" href="/privacy">Privacy</a><a className="f-link" href="/terms">Terms</a></div></div>
        </section>
      </div>
      <HomeWidgets />
    </ContentProvider>
  );
}
