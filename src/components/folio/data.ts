// Folio redesign content. Project summaries use the previously inspected public
// README evidence. Journey uses the corrected CV, not legacy employment claims.
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
  /** Public repo link. Omitted for private repos, so no dead link is shown. */
  github?: string;
  live?: string;
  /** Pinned projects render first with a "Pinned" badge. */
  pinned?: boolean;
  /** Inline showcase video (muted autoplay loop). Paths are under /public. */
  video?: { mp4: string; webm?: string; poster: string; label: string };
  gallery?: { src: string; caption: string }[];
  details?: string[];
};

// Real public repos of MrYaseen0. Preview images are the repo previews that
// already ship in public/assets/projects/real.
export const projects: Project[] = [
  {
    title: "FoodHub",
    blurb: "Food-ordering marketplace for Peshawar. Flutter Android and web app with a TypeScript API on Neon Postgres, Neon Auth sign-in, live order tracking and cash-on-delivery checkout.",
    tags: ["Flutter", "TypeScript", "Neon Postgres", "Marketplace"],
    image: "/assets/projects/foodhub/foodhub-poster.jpg",
    pinned: true,
    video: {
      mp4: "/assets/projects/foodhub/foodhub-promo-720p.mp4",
      webm: "/assets/projects/foodhub/foodhub-promo-720p.webm",
      poster: "/assets/projects/foodhub/foodhub-poster.jpg",
      label: "FoodHub promo video: the real Android app's home, menu, cart and checkout screens",
    },
    details: [
      "A marketplace where customers in Peshawar browse restaurants, open a menu, add dishes to a cart and check out with cash on delivery.",
      "Built as one Flutter codebase for Android and the web, backed by a TypeScript REST API on Neon serverless Postgres with Neon Auth accounts and owner approval for new users.",
      "Orders carry the delivery name, phone and address, are protected against duplicate submits, and update live for tracking.",
      "Every screen in the promo is a real recording of the app running against its live API. The source code is private.",
    ],
  },
  {
    title: "CECOS QEC",
    blurb: "Public website for the Quality Enhancement Cell at CECOS University, with a focal-persons directory, events, reports and team pages.",
    tags: ["Next.js", "TypeScript", "University"],
    image: "/assets/projects/ui/qec.png",
    github: "https://github.com/MrYaseen0/qec-page-new",
    live: "https://qec-page.vercel.app/qec",
    gallery: [{ src: "/assets/projects/ui/qec.png", caption: "Live public QEC homepage, captured 21 October 2026." }],
    details: ["A public information hub for the university's quality-assurance work.", "Includes a searchable focal-persons directory and pages for events, reports, the team and the director's message.", "Screenshots show public pages only. No admin or private data is displayed. Repository access may require permission."],
  },
  {
    title: "AI Clinic Receptionist",
    blurb: "Open-source bilingual clinic booking assistant. English and Roman Urdu chat, doctor information, appointment booking and a public doctors directory.",
    tags: ["Next.js", "TypeScript", "Groq", "AI"],
    image: "/assets/projects/ui/clinic.png",
    github: "https://github.com/MrYaseen0/ai-clinic-receptionist",
    live: "https://ai-clinic-receptionist-gold.vercel.app/",
    gallery: [{ src: "/assets/projects/ui/clinic.png", caption: "Live public clinic demo homepage, captured 21 October 2026. Demo content, not patient data." }],
    details: ["The repository documents an English and Roman Urdu assistant using Groq and Llama.", "The demo includes doctor fees and schedules, conversational appointment booking and booking IDs.", "This portfolio preview uses the public homepage only. No appointment was submitted to capture it."],
  },
  {
    title: "PropEase",
    blurb: "Property management web application for properties, owners, tenants, contracts, payments and maintenance.",
    tags: ["Property management", "Web app", "Dashboard"],
    image: "/assets/projects/ui/propease.png",
    github: "https://github.com/MrYaseen0/PropEasy-An-Property-management-system",
    live: "https://propease-pi.vercel.app/",
    gallery: [{ src: "/assets/projects/ui/propease.png", caption: "Live public sign-in screen, captured 21 October 2026. Dashboard requires an account; no private records are shown." }],
    details: ["A real-estate management project covering properties, buildings, units, owners and tenants.", "Includes workflows for contracts, payments and maintenance.", "The live app requires sign-in. The screenshot shows only its public sign-in UI, not an authenticated dashboard. Repository access may require permission."],
  },
  {
    title: "Bitanas Salon",
    blurb: "Salon website with services, booking UI, a price calculator, gift cards and loyalty features, documented in the public repository.",
    tags: ["TypeScript", "Business website", "Booking UI"],
    image: "/assets/projects/ui/bitanas.png",
    github: "https://github.com/MrYaseen0/-Bitanas-Salon-Peshawar",
    gallery: [{ src: "/assets/projects/ui/bitanas.png", caption: "Public repository screenshot, cropped to the website UI. This is a development screenshot, not a verified live Vercel page." }],
    details: ["A local-business website with services, packages, a price calculator and loyalty features.", "The repository publishes interface screenshots and documents its booking and chatbot features.", "The screenshot is from the repository's development build. No live domain is asserted here."],
  },
  {
    title: "Game Booster",
    blurb:
      "Android game-mode app for PUBG Mobile: one-tap RAM cleanup, call auto-reject, notification remover, app blocker and a background watchdog for zero-disturbance gaming sessions.",
    tags: ["Android", "Java", "Performance"],
    image: "/assets/projects/real/game-booster.webp",
    gallery: [{ src: "/assets/projects/real/game-booster.webp", caption: "App screenshot published in the repository." }],
    github: "https://github.com/MrYaseen0/game-booster",
  },
  {
    title: "GitNova",
    blurb:
      "Gamified learning platform for Git, Python, C, C++ and Java: progressive levels, a simulated Git terminal, achievements, leaderboards and progress analytics.",
    tags: ["TypeScript", "Learning", "Gamified"],
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
  { value: "11", label: "Selected projects", note: "public ones link to their repo" },
  { value: "Oct 2026", label: "Latest push", note: "read from GitHub, 21 Oct 2026" },
];

// More of his own work. Public repos are read from github.com/MrYaseen0 (2026-10-21);
// the two without a repo link are listed in the existing portfolio's own project list.
export type MoreProject = { title: string; note: string; tags: string[]; href?: string };
export const moreProjects: MoreProject[] = [
  { title: "AI Clinic Receptionist", note: "Free open-source bilingual (English + Urdu) AI chat that books clinic appointments.", tags: ["TypeScript", "AI"], href: "https://github.com/MrYaseen0/ai-clinic-receptionist" },
  { title: "IronLife Gym Manager", note: "Full-stack gym management system with a Python Flask REST API and SQLite.", tags: ["Flask", "SQLite", "HTML"], href: "https://github.com/MrYaseen0/IronLife-Gym-Manager-by-Yaseen-Ahmad" },
  { title: "StudyFlow", note: "Academic command center for students.", tags: ["TypeScript"], href: "https://github.com/MrYaseen0/StudyFlow-your-academic-command-center" },
  
  { title: "Documentation Generator (research)", note: "Generative AI-driven documentation engine, a research-based project.", tags: ["TeX", "GenAI"], href: "https://github.com/MrYaseen0/Automated-Documentation-Generator-An-Researh-Based-Project" },
  { title: "WebTester for Kali", note: "Authorized website load tester with a web GUI and hard safety limits, Python standard library only.", tags: ["Python", "Security"], href: "https://github.com/MrYaseen0/webtester-kali" },
  { title: "Healtheon", note: "Multi-agent AI medical education system with specialist agents (GP, cardiologist, neurologist and more). Educational proof of concept only, per its README.", tags: ["Python", "FastAPI", "AutoGen"], href: "https://github.com/MrYaseen0/FYP" },
  { title: "Uncensored LLM Server", note: "Runs a 27B model on free Kaggle 2x T4 GPUs via Ollama and a Cloudflare tunnel, with an OpenAI-compatible API.", tags: ["Ollama", "Kaggle", "LLM"], href: "https://github.com/MrYaseen0/uncensored-llm-server" },
  { title: "BTC Trade Analysis", note: "Bitcoin trade setup study: TradingView chart analysis and five backtested Pine Script strategies on a demo account.", tags: ["Pine Script", "Trading"], href: "https://github.com/MrYaseen0/btc-trade-analysis" },

];
