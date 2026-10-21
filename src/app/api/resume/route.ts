import { NextResponse } from "next/server";
import {
  resumeProfile as p,
  resumeSkills,
  resumeProjectExperience,
  resumeEducation,
  resumeProjects,
  resumeAdditional,
} from "@/lib/resume-data";

// Printable, ATS-friendly UK-style CV (A4, no photo, reverse-chronological).
// Content comes only from src/lib/resume-data.ts (verified facts, no invented dates or metrics).
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const skills = Object.entries(resumeSkills)
    .map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${v.map(esc).join(", ")}</td></tr>`)
    .join("");
  const exp = resumeProjectExperience
    .map((e) => `<div class="item"><h3>${esc(e.title)}</h3><ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul></div>`)
    .join("");
  const edu = resumeEducation
    .map(
      (e) => `<div class="item"><h3>${esc(e.title)}${e.period ? ` <span class="when">${esc(e.period)}</span>` : ""}</h3><p class="org">${esc(e.school)}</p><ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul></div>`
    )
    .join("");
  const projects = resumeProjects
    .map(
      (r) => `<div class="item"><h3>${esc(r.title)}</h3><p>${esc(r.bullet)}${r.note ? ` ${esc(r.note)}.` : ""}</p><p class="tech">${esc(r.tech)} &middot; <a href="${esc(r.link)}">${esc(r.link.replace("https://", ""))}</a></p></div>`
    )
    .join("");
  const extra = resumeAdditional.map((a) => `<li>${esc(a)}</li>`).join("");

  const html = `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${esc(p.name)} - CV</title>
<style>
  @page { size: A4; margin: 14mm 15mm; }
  *{box-sizing:border-box}
  body{margin:0;background:#eceae6;color:#1b1b1b;font:13px/1.45 Arial,Helvetica,sans-serif;padding:24px 12px}
  .page{max-width:820px;margin:0 auto;background:#fff;padding:36px 44px;box-shadow:0 6px 24px rgba(0,0,0,.08)}
  h1{font-size:28px;margin:0;letter-spacing:.2px}
  .role{font-size:14px;margin:2px 0 8px;color:#b81610;font-weight:700}
  .contact{font-size:12px;color:#333}
  .contact span+span:before{content:" | ";color:#999}
  h2{font-size:12.5px;letter-spacing:1.4px;text-transform:uppercase;border-bottom:1.5px solid #1b1b1b;margin:20px 0 8px;padding-bottom:3px}
  h3{font-size:13px;margin:10px 0 2px}
  .when{font-weight:400;color:#555}
  .org{margin:0 0 3px;color:#444;font-style:italic}
  ul{margin:3px 0 0;padding-left:18px}li{margin:2px 0}
  p{margin:3px 0}.tech{font-size:11.5px;color:#555}
  a{color:#1b1b1b}
  table{border-collapse:collapse;width:100%}th{text-align:left;vertical-align:top;width:110px;padding:2px 8px 2px 0;font-size:12px}td{padding:2px 0;font-size:12px}
  .bar{max-width:820px;margin:0 auto 12px;text-align:right}
  .bar .dl{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:6px;border:2px solid #1b1b1b;color:#1b1b1b;font-weight:700;text-decoration:none;margin-right:8px}
  .bar button{background:#b81610;color:#fff;border:0;border-radius:6px;padding:10px 18px;font-weight:700;cursor:pointer;min-height:44px}
  .bar button:focus-visible{outline:3px solid #1b1b1b;outline-offset:2px}
  @media print{body{background:#fff;padding:0}.page{box-shadow:none;padding:0;max-width:none}.bar{display:none}.item,li{break-inside:avoid}h3{break-after:avoid}}
  @media(max-width:560px){.page{padding:22px 16px}}
</style>
</head>
<body>
<div class="bar"><a class="dl" href="/Yaseen-Ahmad-CV.pdf" download>Download CV (PDF)</a> <button type="button" onclick="window.print()">Save as PDF / Print</button></div>
<main class="page">
  <header>
    <h1>${esc(p.name)}</h1>
    <div class="role">${esc(p.role)}</div>
    <div class="contact"><span>${esc(p.location)}</span><span>${esc(p.phone)}</span><span>${esc(p.email)}</span></div>
    <div class="contact"><span>${esc(p.website)}</span><span>${esc(p.github)}</span><span>${esc(p.linkedin)}</span></div>
  </header>
  <h2>Personal statement</h2><p>${esc(p.statement)}</p>
  <h2>Education</h2>${edu}
  <h2>Projects</h2>${projects}
  <h2>Experience</h2>${exp}
  <h2>Technical skills</h2><table>${skills}</table>
  <h2>Additional information</h2><ul>${extra}</ul>
</main>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
