"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { developer, experiences, moreProjects, proof, projects, socials, toolkit } from "./data";
import { faqs } from "@/lib/portfolio-data";
import { Duo, fade, Mock, ProjectDetails, Reveal } from "./parts";

export default function BelowFold() {
  const tools = [...toolkit, ...toolkit];
  return (
    <>
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
          <article key={p.title} className={`f-slide${p.pinned ? " is-pinned" : ""}`}>
            <div className="f-wrap"><Reveal className="f-left">
              <p className="f-count">{String(i + 1).padStart(2, "0")} <span>/ {String(projects.length).padStart(2, "0")}</span>{p.pinned && <span className="f-pin"><svg aria-hidden="true" viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M16 3a1 1 0 0 1 .7 1.7L15.4 6l2.6 5.2 1.3-1.3a1 1 0 1 1 1.4 1.4l-3.5 3.5-1.4-1.4-3.6 3.6-.2 4.2a.5.5 0 0 1-.85.33L8.5 18.9l-4.3 4.3-1.4-1.4 4.3-4.3-2.6-2.65a.5.5 0 0 1 .33-.85l4.2-.2 3.6-3.6-1.4-1.4 3.5-3.5a1 1 0 0 1 1.4 0L15.3 4.3A1 1 0 0 1 16 3z"/></svg>Pinned</span>}</p>
              <Mock project={p} />
              <h3 className="f-title">{p.title}</h3>
              <p className="f-p">{p.blurb}</p>
              <ul className="f-chips" aria-label={`${p.title} stack`}>{p.tags.map((t) => <li key={t} className="f-chip">{t}</li>)}</ul>
              <div className="f-project-actions"><ProjectDetails project={p} />{p.caseStudy && <Link className="f-link" href={p.caseStudy}>Case study <span aria-hidden="true">→</span></Link>}{p.github ? <a className="f-link" href={p.github} target="_blank" rel="noopener noreferrer">View Repo <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a> : <span className="f-private">Private repository</span>}</div>
            </Reveal></div>
          </article>
        ))}
        <div className="f-wrap f-more-work">
          <m.h3 className="f-also" {...fade}>More from my GitHub <em>({moreProjects.length})</em></m.h3>
          <p className="f-p f-mnote">Public repositories and projects listed in my portfolio. Notes come from each repo&apos;s README or description.</p>
          <ul className="f-mgrid">
            {moreProjects.map((proj, i) => (
              <m.li key={proj.title} className="f-mcard" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-8% 0px" }} transition={{ duration: 0.45, delay: (i % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}>
                <span className="f-mnum" aria-hidden="true">{String(i + 7).padStart(2, "0")}</span>
                <h4>{proj.title}</h4>
                <p>{proj.note}</p>
                <span className="f-mtags">{proj.tags.join(" / ")}</span>
                {proj.href && <a href={proj.href} target="_blank" rel="noopener noreferrer">View on GitHub <span aria-hidden="true">↗</span><span className="sr-only"> ({proj.title}, opens in a new tab)</span></a>}
              </m.li>
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
            <p className="f-p" style={{ maxWidth: 360 }}>I take on freelance web projects as a full-stack developer. I build with Next.js, React and Node.js.</p>
            <ul className="f-chips" aria-label="What I build" style={{ maxWidth: 360 }}>
              {["Web apps", "Business and portfolio sites", "Dashboards and admin panels", "REST APIs", "Responsive UI"].map((t, i) => <li key={t} className={`f-chip${i % 3 === 0 ? " red" : ""}`}>{t}</li>)}
            </ul>
            <p className="f-p" style={{ maxWidth: 360 }}><a href="mailto:yaseenahmad.exe@gmail.com?subject=Project%20enquiry" style={{ textDecoration: "underline" }}>Send a project enquiry by email</a>. Examples of my work are in the selected projects section.</p>
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

      <section id="more" className="f-more" aria-label="More information" style={{position:"relative",zIndex:40}}>
        <div className="f-wrap f-faq" id="faq" aria-labelledby="faq-title">
          <p className="f-label">Quick answers</p>
          <h2 className="f-h2" id="faq-title">Skills and <em>contact.</em></h2>
          {faqs.map((faq) => <details key={faq.q}><summary>{faq.q}</summary><p className="f-p">{faq.a}</p></details>)}
        </div>
        <div className="f-wrap"><p className="f-label">More information</p><h2 className="f-h2">Let&apos;s discuss <em>the scope.</em></h2><p className="f-p">For a project enquiry, share what you want to build. Scope, timing, cost and support need to be agreed for that project.</p><div className="f-project-actions"><a className="f-btn red" href={socials.email}>Email Yaseen</a><a className="f-btn ghost" href="/Yaseen-Ahmad-CV.pdf">Download CV (PDF)</a><a className="f-link" href="/freelance-software-engineer">Freelance software engineer</a><a className="f-link" href="/hire-web-developer-peshawar">Web developer in Peshawar</a><a className="f-link" href="/mern-stack-developer">React and Node.js developer</a><a className="f-link" href="/privacy">Privacy</a><a className="f-link" href="/terms">Terms</a></div></div>
      </section>
    </>
  );
}
