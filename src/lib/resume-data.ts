// Verified resume data for the /api/resume route.
// Grounded in the public repo READMEs (github.com/MrYaseen0), the live QEC site,
// and user-confirmed facts. No invented dates, employers, metrics or results.

export const resumeProfile = {
  name: "Yaseen Ahmad",
  role: "Full-Stack Developer",
  location: "Peshawar, Pakistan",
  phone: "+92 318 937 0042",
  email: "yaseenahmad.exe@gmail.com",
  linkedin: "linkedin.com/in/yaseen-ahmad-489967280",
  github: "github.com/MrYaseen0",
  website: "yaseenahmadexe.vercel.app",
  statement:
    "Final-year Software Engineering student at CECOS University, Peshawar, building full-stack web applications with Next.js, TypeScript and React. Project work ranges from a bilingual AI booking assistant to complete business websites with admin dashboards, published as open source with documentation. Currently working on a final-year research project on AI-assisted requirement-to-test traceability. Looking for a junior software engineering role.",
};

export const resumeSkills: Record<string, string[]> = {
  Languages: ["TypeScript", "JavaScript", "Python", "Java", "HTML", "CSS", "SQL"],
  Frontend: ["React", "Next.js (App Router)", "Tailwind CSS", "Framer Motion", "responsive and accessible UI"],
  Backend: ["Node.js", "Express", "Flask", "REST API design", "JWT authentication"],
  Data: ["PostgreSQL", "SQLite", "MongoDB", "Prisma", "SQLAlchemy", "Supabase (Postgres, Auth, Storage)"],
  "AI & Data": ["LLM integration (Groq, Llama)", "prompt design", "OpenCV / face-recognition"],
  Tooling: ["Git", "GitHub Actions CI", "Vercel", "Docker", "Vitest", "Linux (Kali)", "Android services"],
};

export const resumeProjectExperience = [
  {
    title: "Full-stack web projects - self-directed and university work, Peshawar",
    bullets: [
      "Design, build and deploy full-stack web applications end to end, spanning education, health and local business, with public source and documentation on GitHub (29 public repositories).",
      "Built the public website for the Quality Enhancement Cell (QEC) of CECOS University - nine public pages including a searchable focal-persons directory, events and reports sections - live at qec-page.vercel.app/qec.",
      "Bitanas Salon, Peshawar - a business website with online booking, gift cards, loyalty and referral programme, live price calculator, admin dashboard and an on-device AI chatbot concierge (public repo).",
      "Game Booster, an Android app (Java) for distraction-free gaming sessions - call auto-reject, notification removal, app blocker and a background watchdog - with source and versioned APK builds published on GitHub.",
    ],
  },
];

export const resumeEducation = [
  {
    title: "BS Software Engineering (Final Year)",
    school: "CECOS University of IT & Emerging Sciences, Peshawar",
    period: "", // dates not confirmed - intentionally blank, do not fabricate
    bullets: [
      "Final-Year Project (team of three, supervised; in progress): AI-Assisted Requirements Analysis, Test Generation and Traceability Platform - a retrieval-augmented system designed to recommend requirement-to-test trace links while keeping a human reviewer in final control. Planned stack: Flutter Web frontend, FastAPI/Python backend, PostgreSQL, hybrid BM25 + semantic-embedding retrieval.",
      "Software Architecture & Design coursework: Automated Documentation Generator - a generative-AI documentation engine that produces inline comments and API documentation across five languages and integrates with CI/CD as living documentation.",
    ],
  },
];

export const resumeProjects = [
  {
    title: "AI Clinic Receptionist - open-source bilingual booking assistant",
    link: "https://github.com/MrYaseen0/ai-clinic-receptionist",
    note: "Live demo: ai-clinic-receptionist-gold.vercel.app",
    bullet: "English + Roman Urdu chatbot that answers questions on doctors, fees and timings and books appointments conversationally, with booking IDs and an admin dashboard.",
    tech: "Next.js 14 · TypeScript · Tailwind CSS · Groq (Llama 3.3 70B) · MIT licence",
  },
  {
    title: "GitNova - gamified learning platform for Git and programming",
    link: "https://github.com/MrYaseen0/gitnova",
    note: "",
    bullet: "70 interactive levels with an in-browser simulated Git terminal, visual commit graph, SM-2 spaced repetition, achievements, leaderboards and verifiable PDF certificates.",
    tech: "React 19 · TypeScript · Node.js/Express · Prisma · PostgreSQL · JWT · Vitest (75 tests) · GitHub Actions",
  },
  {
    title: "YTUBE - full-stack YouTube-style video platform",
    link: "https://github.com/MrYaseen0/ytube",
    note: "",
    bullet: "Accounts, channels, uploads with progress tracking, likes, comments, subscriptions, watch history and a full admin dashboard with moderation queue and audit log.",
    tech: "Next.js 14 · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Storage)",
  },
  {
    title: "StudyFlow - academic planner for university students",
    link: "https://github.com/MrYaseen0/StudyFlow-your-academic-command-center",
    note: "",
    bullet: "Deadline tracking, course manager, GPA calculator with what-if targets, drag-and-drop weekly planner, Pomodoro timer and a study-buddy chatbot.",
    tech: "Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Prisma",
  },
  {
    title: "IronLife Gym Manager - gym management system",
    link: "https://github.com/MrYaseen0/IronLife-Gym-Manager-by-Yaseen-Ahmad",
    note: "",
    bullet: "Member registration, payments and real-time analytics dashboard with offline support; Python Flask REST API over SQLite with SQLAlchemy ORM.",
    tech: "Python · Flask · SQLAlchemy · SQLite · JavaScript/Bootstrap frontend",
  },
  {
    title: "Face Recognition Attendance System - computer-vision attendance",
    link: "https://github.com/MrYaseen0/face-recognition-attendance-system",
    note: "",
    bullet: "Automated attendance marking via facial recognition with admin and student portals, CSV export and a 23-case unit-test suite.",
    tech: "Python · Flask · OpenCV · face-recognition · NumPy",
  },
];

export const resumeAdditional = [
  "Languages: English and Urdu.",
  "Open source: 29 public repositories at github.com/MrYaseen0, including MIT-licensed tools with live demos.",
  "References: available on request.",
];
