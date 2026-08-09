/**
 * Tech stack icon mapping — colored SVG badges for common technologies.
 * Falls back to a text pill for unknown techs.
 */

interface TechIcon {
  label: string;
  color: string; // brand color
  bg: string; // background tint
  text: string; // text color
  symbol: string; // short symbol or initials
}

const TECH_MAP: Record<string, TechIcon> = {
  // Languages
  typescript: { label: "TypeScript", color: "#3178c6", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", symbol: "TS" },
  javascript: { label: "JavaScript", color: "#f7df1e", bg: "bg-yellow-500/10", text: "text-yellow-700 dark:text-yellow-400", symbol: "JS" },
  python: { label: "Python", color: "#3776ab", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", symbol: "Py" },
  java: { label: "Java", color: "#ed8b00", bg: "bg-orange-500/10", text: "text-orange-700 dark:text-orange-400", symbol: "Jv" },
  "c++": { label: "C++", color: "#00599c", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", symbol: "C++" },
  html: { label: "HTML", color: "#e34c26", bg: "bg-orange-500/10", text: "text-orange-700 dark:text-orange-400", symbol: "<>" },
  css: { label: "CSS", color: "#1572b6", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", symbol: "CSS" },
  // Frontend
  react: { label: "React", color: "#61dafb", bg: "bg-sky-500/10", text: "text-sky-600 dark:text-sky-400", symbol: "⚛" },
  "react-native": { label: "React Native", color: "#61dafb", bg: "bg-sky-500/10", text: "text-sky-600 dark:text-sky-400", symbol: "⚛" },
  "next.js": { label: "Next.js", color: "#000000", bg: "bg-slate-500/10", text: "text-slate-700 dark:text-slate-300", symbol: "N" },
  nextjs: { label: "Next.js", color: "#000000", bg: "bg-slate-500/10", text: "text-slate-700 dark:text-slate-300", symbol: "N" },
  "tailwind-css": { label: "Tailwind CSS", color: "#06b6d4", bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", symbol: "∿" },
  "tailwind": { label: "Tailwind CSS", color: "#06b6d4", bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", symbol: "∿" },
  "material-ui": { label: "Material UI", color: "#0081cb", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", symbol: "MUI" },
  // Backend
  "node.js": { label: "Node.js", color: "#339933", bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", symbol: "⬢" },
  nodejs: { label: "Node.js", color: "#339933", bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", symbol: "⬢" },
  "express.js": { label: "Express", color: "#000000", bg: "bg-slate-500/10", text: "text-slate-700 dark:text-slate-300", symbol: "Ex" },
  express: { label: "Express", color: "#000000", bg: "bg-slate-500/10", text: "text-slate-700 dark:text-slate-300", symbol: "Ex" },
  "rest-apis": { label: "REST API", color: "#f59e0b", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", symbol: "API" },
  "rest-api": { label: "REST API", color: "#f59e0b", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", symbol: "API" },
  graphql: { label: "GraphQL", color: "#e10098", bg: "bg-pink-500/10", text: "text-pink-600 dark:text-pink-400", symbol: "◆" },
  socketio: { label: "Socket.io", color: "#010101", bg: "bg-slate-500/10", text: "text-slate-700 dark:text-slate-300", symbol: "↻" },
  "socket-io": { label: "Socket.io", color: "#010101", bg: "bg-slate-500/10", text: "text-slate-700 dark:text-slate-300", symbol: "↻" },
  // Database
  postgresql: { label: "PostgreSQL", color: "#4169e1", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", symbol: "🐘" },
  mongodb: { label: "MongoDB", color: "#47a248", bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", symbol: "🍃" },
  prisma: { label: "Prisma", color: "#2d3748", bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", symbol: "◭" },
  supabase: { label: "Supabase", color: "#3ecf8e", bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", symbol: "⚡" },
  redis: { label: "Redis", color: "#dc382d", bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", symbol: "◆" },
  firebase: { label: "Firebase", color: "#ffca28", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", symbol: "🔥" },
  // Tools & Services
  docker: { label: "Docker", color: "#2496ed", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", symbol: "🐳" },
  "git/github": { label: "Git", color: "#f05032", bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", symbol: "⎇" },
  vercel: { label: "Vercel", color: "#000000", bg: "bg-slate-500/10", text: "text-slate-700 dark:text-slate-300", symbol: "▲" },
  stripe: { label: "Stripe", color: "#635bff", bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", symbol: "$" },
  openai: { label: "OpenAI", color: "#10a37f", bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", symbol: "AI" },
  "ai": { label: "AI", color: "#10a37f", bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", symbol: "AI" },
  "gpt": { label: "GPT", color: "#10a37f", bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", symbol: "AI" },
  mdx: { label: "MDX", color: "#1b1f24", bg: "bg-slate-500/10", text: "text-slate-700 dark:text-slate-300", symbol: "M" },
  "dnd-kit": { label: "DnD Kit", color: "#7c3aed", bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", symbol: "↕" },
  zustand: { label: "Zustand", color: "#453c31", bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", symbol: "🐻" },
  "tailwindcss": { label: "Tailwind CSS", color: "#06b6d4", bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", symbol: "∿" },
};

export function getTechIcon(tech: string): TechIcon | null {
  const normalized = tech.toLowerCase().trim();
  return TECH_MAP[normalized] || null;
}

export function TechBadge({ tech, size = "sm" }: { tech: string; size?: "sm" | "md" }) {
  const icon = getTechIcon(tech);
  const sizeClasses = size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[10px]";

  if (icon) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md border border-sky-500/15 ${icon.bg} ${sizeClasses} font-medium ${icon.text}`}
        title={icon.label}
      >
        <span className="font-bold leading-none">{icon.symbol}</span>
        <span className="hidden sm:inline">{icon.label}</span>
      </span>
    );
  }

  // Fallback: plain text pill
  return (
    <span
      className={`inline-flex items-center rounded-md border border-sky-500/15 bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground`}
      title={tech}
    >
      {tech}
    </span>
  );
}
