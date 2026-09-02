import { NextResponse } from "next/server";
import { developer, experiences, techStack, keyStats } from "@/lib/portfolio-data";

// Generate a clean, ATS-friendly HTML resume and return it as a downloadable file.
// Using HTML (printable) instead of PDF to avoid heavy dependencies — opens in browser
// where the user can Cmd/Ctrl+P to save as PDF.
export async function GET() {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const skillList = Object.entries(techStack)
    .map(([cat, skills]) => `${cat}: ${skills.map((s) => s.name).join(", ")}`)
    .join("<br/>");

  const expHtml = experiences
    .map(
      (e) => `
    <div class="exp">
      <div class="exp-head">
        <strong>${e.role}</strong> — <span class="company">${e.company}</span>
        <span class="period">${e.period}</span>
      </div>
      <div class="loc">${e.location} · ${e.type}</div>
      <p class="desc">${e.description}</p>
      <ul class="ach">
        ${e.achievements.map((a) => `<li>${a}</li>`).join("")}
      </ul>
      <div class="tech">Tech: ${e.tech.join(" · ")}</div>
    </div>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${developer.name} — Resume</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #1a1a2e;
    background: #f5f5f7;
    line-height: 1.5;
    padding: 40px 20px;
  }
  .page {
    max-width: 800px;
    margin: 0 auto;
    background: #fff;
    padding: 50px 60px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    border-top: 6px solid #0ea5e9;
  }
  header {
    border-bottom: 2px solid #ec4899;
    padding-bottom: 20px;
    margin-bottom: 24px;
  }
  h1 {
    font-size: 32px;
    color: #0c4a6e;
    letter-spacing: -0.5px;
  }
  .role {
    font-size: 16px;
    color: #ec4899;
    font-weight: 600;
    margin-top: 4px;
  }
  .contact {
    margin-top: 12px;
    font-size: 12px;
    color: #475569;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
  .contact span { white-space: nowrap; }
  h2 {
    font-size: 15px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #0c4a6e;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 6px;
    margin: 24px 0 12px;
  }
  .summary {
    font-size: 13px;
    color: #334155;
    margin-bottom: 8px;
  }
  .skills {
    font-size: 12px;
    color: #334155;
    line-height: 1.8;
  }
  .exp {
    margin-bottom: 18px;
    padding-left: 14px;
    border-left: 2px solid #e0f2fe;
  }
  .exp-head {
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;
  }
  .company { color: #0ea5e9; font-weight: 600; }
  .period { font-size: 11px; color: #94a3b8; font-style: italic; }
  .loc { font-size: 11px; color: #64748b; margin: 2px 0 6px; }
  .desc { font-size: 12.5px; color: #334155; margin-bottom: 6px; }
  .ach { padding-left: 18px; font-size: 12px; color: #475569; }
  .ach li { margin-bottom: 3px; }
  .tech {
    font-size: 11px;
    color: #b08968;
    margin-top: 6px;
    font-style: italic;
  }
  footer {
    margin-top: 28px;
    padding-top: 14px;
    border-top: 1px solid #e2e8f0;
    font-size: 10px;
    color: #94a3b8;
    text-align: center;
  }
  .print-bar {
    max-width: 800px;
    margin: 0 auto 16px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
  .print-bar button {
    background: linear-gradient(135deg, #0ea5e9, #ec4899);
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(14,165,233,0.3);
  }
  .print-bar button:hover { transform: translateY(-1px); }
  @media print {
    body { background: #fff; padding: 0; }
    .print-bar { display: none; }
    .page { box-shadow: none; padding: 0; }
  }
</style>
</head>
<body>
  <div class="print-bar">
    <button onclick="window.print()">💾 Save as PDF / Print</button>
  </div>
  <div class="page">
    <header>
      <h1>${developer.name}</h1>
      <div class="role">${developer.role} · MERN Stack & SaaS Specialist</div>
      <div class="contact">
        <span>✉️ ${developer.email}</span>
        <span>📱 ${developer.phone}</span>
        <span>📍 ${developer.location}</span>
        <span>🌐 ${developer.website}</span>
        <span>💻 github.com/${developer.githubUsername}</span>
      </div>
    </header>

    <h2>Professional Summary</h2>
    <p class="summary">${developer.aboutText} ${developer.aboutText2}</p>

    <h2>Technical Skills</h2>
    <div class="skills">${skillList}</div>

    <h2>Professional Experience</h2>
    ${expHtml}

    <h2>Key Stats</h2>
    <div class="skills">
      • ${keyStats.projects} Projects Delivered · ${keyStats.clients}+ Happy Clients · ${keyStats.years} Years Experience<br/>
      • ${keyStats.onTime} On-Time Delivery · ${keyStats.satisfaction} Client Satisfaction · ${keyStats.followers} Community<br/>
      • Status: <strong style="color:#16a34a">🟢 ${developer.status}</strong>
    </div>

    <footer>
      Resume generated on ${today} · ${developer.name} · ${developer.website}
    </footer>
  </div>
  <script>
    // Auto-open print dialog after load
    setTimeout(function(){ if (window.location.search.indexOf('autoprint') > -1) window.print(); }, 500);
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
