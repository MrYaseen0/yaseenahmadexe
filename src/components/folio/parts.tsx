"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { m, useInView, useScroll, useTransform } from "framer-motion";
import { type Project } from "./data";
import { useHydratedReducedMotion as useReducedMotion } from "@/hooks/use-hydrated-reduced-motion";

export const fade = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } };

export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  return <div ref={ref} className={`f-reveal ${className}`} data-visible={visible}>{children}</div>;
}

export function ProjectDetails({ project }: { project: Project }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <>
    <button className="f-btn ghost" type="button" onClick={() => dialog.current?.showModal()}>Project details ↗</button>
    <dialog ref={dialog} className="f-project-dialog" onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="f-dialog-head"><span className="f-label">Project overview</span><button type="button" className="f-dialog-close" onClick={() => dialog.current?.close()} autoFocus aria-label="Close project details">Close ×</button></div>
      <h2 className="f-h2">{project.title}</h2><p className="f-p">{project.blurb}</p>
      {(project.details || []).map((text) => <p className="f-p" key={text}>{text}</p>)}
      {project.video && <figure><video controls playsInline preload="none" poster={project.video.poster} width={1280} height={720} aria-label={project.video.label}>{project.video.webm && <source src={project.video.webm} type="video/webm" />}<source src={project.video.mp4} type="video/mp4" /></video><figcaption>Promo video with sound. Every screen is a real recording of the app.</figcaption></figure>}
      {project.gallery?.map((image) => <figure key={image.src}><img src={image.src} alt={`${project.title} interface`} width={1280} height={713} loading="lazy"/><figcaption>{image.caption}</figcaption></figure>)}
      {!project.gallery?.length && !project.video && <p className="f-p">The repository contains the source and documentation. No verified live UI capture is available for this project.</p>}
      <ul className="f-chips">{project.tags.map(tag=><li className="f-chip" key={tag}>{tag}</li>)}</ul>
      <div className="f-project-actions">{project.github ? <a className="f-btn red" href={project.github} target="_blank" rel="noopener noreferrer">View Repo ↗</a> : <span className="f-private">Private repository</span>}{project.live && <a className="f-btn ghost" href={project.live} target="_blank" rel="noopener noreferrer">Visit live site ↗</a>}{project.caseStudy && <Link className="f-btn ghost" href={project.caseStudy}>Read the case study →</Link>}</div>
    </dialog>
  </>;
}

// Inline showcase video: loads nothing until the card nears the viewport,
// plays muted while visible, pauses when scrolled away. Reduced motion: no autoplay.
export function ShowcaseVideo({ project }: { project: Project }) {
  const v = project.video!;
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    if (reduce) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      else { el.pause(); setPlaying(false); }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);
  const togglePlay = () => {
    const el = ref.current; if (!el) return;
    if (el.paused) el.play().then(() => setPlaying(true)).catch(() => {}); else { el.pause(); setPlaying(false); }
  };
  const toggleSound = () => {
    const el = ref.current; if (!el) return;
    el.muted = !el.muted; setMuted(el.muted);
    if (!el.muted && el.paused) el.play().then(() => setPlaying(true)).catch(() => {});
  };
  return (
    <div className="f-showcase">
      <video ref={ref} muted loop playsInline preload="none" poster={v.poster} width={1280} height={720} aria-label={v.label}>
        {v.webm && <source src={v.webm} type="video/webm" />}
        <source src={v.mp4} type="video/mp4" />
      </video>
      <div className="f-vctl">
        <button type="button" onClick={togglePlay} aria-label={playing ? `Pause ${project.title} video` : `Play ${project.title} video`}>{playing ? "Pause" : "Play"}</button>
        <button type="button" onClick={toggleSound} aria-pressed={!muted} aria-label={muted ? "Turn sound on" : "Turn sound off"}>{muted ? "Sound off" : "Sound on"}</button>
      </div>
    </div>
  );
}

export function Mock({ project }: { project: Project }) {
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
      <m.div className={`f-mock-in${project.video ? " is-video" : ""}`} style={reduce ? undefined : { rotateX: rx, rotateY: ry }}>
        {project.video ? <ShowcaseVideo project={project} /> : (project.image.includes("game-booster") || project.image.includes("/ui/")) ? (
          <img src={project.image} alt={`${project.title} app screenshot`} loading="lazy" width={1200} height={630} />
        ) : (
          <div className="f-tcard" role="img" aria-label={`${project.title}: ${project.tags.join(", ")}`}>
            <b>{project.title}</b>
            <span>{project.tags.join(" / ")}</span>
          </div>
        )}
      </m.div>
    </div>
  );
}

// Swap this path for his own 4-second clip when he provides it (public/assets/hero/).
const DUO_VIDEO = "";

export function Duo() {
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
