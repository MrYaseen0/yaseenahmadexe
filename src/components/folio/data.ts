// Folio redesign content. Everything here comes from the existing portfolio
// (src/lib/portfolio-data.ts) or the public GitHub repo descriptions of
// MrYaseen0. Nothing is invented. Items marked VERIFY need the owner's check.
import { developer, experiences, socials, techStack } from "@/lib/portfolio-data";

export { developer, experiences, socials };

export const sections = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "journey", label: "Journey" },
  { id: "toolkit", label: "Toolkit" },
  { id: "proof", label: "Proof" },
  { id: "contact", label: "Contact" },
] as const;

export type Project = {
  title: string;
  blurb: string;
  tags: string[];
  image: string;
  github: string;
};

// Real public repos of MrYaseen0. Preview images are the repo previews that
// already ship in public/assets/projects/real.
export const projects: Project[] = [
  {
    title: "Game Booster",
    blurb:
      "Android game-mode app for PUBG Mobile: one-tap RAM cleanup, call auto-reject, notification remover, app blocker and a background watchdog for zero-disturbance gaming sessions.",
    tags: ["Android", "Java", "Performance"],
    image: "/assets/projects/real/game-booster.webp",
    github: "https://github.com/MrYaseen0/game-booster",
  },
  {
    title: "GitNova",
    blurb:
      "Multi-agent AI platform with advanced orchestration, 225+ backend tests and a production-grade architecture.",
    tags: ["Python", "AI/ML", "Multi-agent", "Testing"],
    image: "/assets/projects/real/gitnova.webp",
    github: "https://github.com/MrYaseen0/gitnova",
  },
  {
    title: "XAU Bot",
    blurb:
      "Gold (XAU/USD) trading dashboard: delayed daily chart snapshots, technical indicators, position-size calculator, strategy playbook and a persistent paper-trading journal. Educational, simulated trading only.",
    tags: ["Dashboard", "Finance", "Paper trading"],
    image: "/assets/projects/real/xau-bot.webp",
    github: "https://github.com/MrYaseen0/xau-bot",
  },
  {
    title: "YTUBE",
    blurb:
      "Full-stack YouTube clone with a deep-red neon theme, admin-managed content, categories, uploads and moderation.",
    tags: ["Next.js 14", "TypeScript", "Tailwind", "Supabase"],
    image: "/assets/projects/real/ytube.webp",
    github: "https://github.com/MrYaseen0/ytube",
  },
  {
    title: "System Design Reference",
    blurb:
      "System Design Interview reference: 28 chapters distilled from Alex Xu's Vol 1 and Vol 2 with a framework, estimation cheat sheet, patterns index and architectures.",
    tags: ["System design", "Reference"],
    image: "/assets/projects/real/system-design-reference.webp",
    github: "https://github.com/MrYaseen0/system-design-reference",
  },
  {
    title: "Face Recognition Attendance",
    blurb:
      "Attendance system that uses face recognition and computer vision to identify students and mark their attendance automatically.",
    tags: ["AI", "Computer vision", "Attendance"],
    image: "/assets/projects/real/face-recognition-attendance-system.webp",
    github: "https://github.com/MrYaseen0/face-recognition-attendance-system",
  },
];

export const toolkit: string[] = Array.from(
  new Set(Object.values(techStack).flat().map((t) => t.name))
);

// Every number below was read from the public GitHub profile MrYaseen0 on
// 2026-10-21 (public repos, the language field of each repo, last push date).
export const proof = [
  { value: "29", label: "Public GitHub repos", note: "github.com/MrYaseen0" },
  { value: "7", label: "Languages used", note: "HTML, TypeScript, JavaScript, Python, Java, Jupyter, TeX" },
  { value: "6", label: "Projects shown here", note: "each links to its repo" },
  { value: "Oct 2026", label: "Latest push", note: "read from GitHub, 21 Oct 2026" },
];
