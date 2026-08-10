import { NextResponse } from "next/server";
import { developer } from "@/lib/portfolio-data";

// In-memory cache for GitHub repos (5 minutes)
let cache: { data: any[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

// Fallback curated projects (used when rate-limited or offline)
const fallbackProjects = [
  {
    id: 1,
    name: "gitnova",
    full_name: "MrYaseen0/gitnova",
    description:
      "Multi-agent AI platform with advanced orchestration, 225+ backend tests, and production-grade architecture.",
    html_url: "https://github.com/MrYaseen0/gitnova",
    homepage: null,
    topics: ["python", "ai", "multi-agent", "testing"],
    language: "Python",
    stargazers_count: 0,
    forks_count: 0,
    watchers_count: 0,
    open_issues_count: 0,
    license: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-08-01T00:00:00Z",
    pushed_at: "2025-08-01T00:00:00Z",
    default_branch: "main",
    featured: true,
    category: "AI",
    fallback: true,
  },
  {
    id: 2,
    name: "healtheon-os",
    full_name: "MrYaseen0/healtheon-os",
    description:
      "Multi-agent clinical AI system with healthcare-focused architecture and comprehensive test coverage.",
    html_url: "https://github.com/MrYaseen0/healtheon-os",
    homepage: null,
    topics: ["python", "ai", "healthcare", "multi-agent"],
    language: "Python",
    stargazers_count: 0,
    forks_count: 0,
    watchers_count: 0,
    open_issues_count: 0,
    license: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-07-01T00:00:00Z",
    pushed_at: "2025-07-01T00:00:00Z",
    default_branch: "main",
    featured: true,
    category: "AI",
    fallback: true,
  },
  {
    id: 3,
    name: "xauusd-trading-pipeline",
    full_name: "MrYaseen0/xauusd-trading-pipeline",
    description:
      "Automated gold trading pipeline with real-time market data, analysis, and execution capabilities.",
    html_url: "https://github.com/MrYaseen0/xauusd-trading-pipeline",
    homepage: null,
    topics: ["python", "finance", "trading", "automation"],
    language: "Python",
    stargazers_count: 0,
    forks_count: 0,
    watchers_count: 0,
    open_issues_count: 0,
    license: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-06-01T00:00:00Z",
    pushed_at: "2025-06-01T00:00:00Z",
    default_branch: "main",
    featured: true,
    category: "Backend",
    fallback: true,
  },
  {
    id: 4,
    name: "nutrimate",
    full_name: "MrYaseen0/nutrimate",
    description:
      "Nutrition tracking application with meal planning, calorie counting, and health insights.",
    html_url: "https://github.com/MrYaseen0/nutrimate",
    homepage: null,
    topics: ["react", "nodejs", "health", "tracking"],
    language: "TypeScript",
    stargazers_count: 0,
    forks_count: 0,
    watchers_count: 0,
    open_issues_count: 0,
    license: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-05-01T00:00:00Z",
    pushed_at: "2025-05-01T00:00:00Z",
    default_branch: "main",
    featured: true,
    category: "Full-Stack",
    fallback: true,
  },
  {
    id: 5,
    name: "3d-portfolio",
    full_name: "MrYaseen0/3d-portfolio",
    description:
      "This portfolio website built with Next.js, Three.js, Framer Motion, and modern web technologies.",
    html_url: "https://github.com/MrYaseen0/3d-portfolio",
    homepage: "https://yaseenahmadexe.vercel.app",
    topics: ["nextjs", "threejs", "tailwind", "framer-motion"],
    language: "TypeScript",
    stargazers_count: 0,
    forks_count: 0,
    watchers_count: 0,
    open_issues_count: 0,
    license: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-08-01T00:00:00Z",
    pushed_at: "2025-08-01T00:00:00Z",
    default_branch: "main",
    featured: true,
    category: "Frontend",
    fallback: true,
  },
];

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";

  // Return cache if fresh
  if (cache && Date.now() - cache.timestamp < CACHE_TTL && !force) {
    return NextResponse.json({
      source: "cache",
      username: developer.githubUsername,
      count: cache.data.length,
      repos: cache.data,
    });
  }

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const res = await fetch(
      `https://api.github.com/users/${developer.githubUsername}/repos?per_page=100&sort=updated`,
      {
        headers,
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      throw new Error(`GitHub API responded ${res.status}`);
    }

    const raw = await res.json();

    const repos = (Array.isArray(raw) ? raw : [])
      .filter((r: any) => !r.fork)
      .map((r: any) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        description: r.description || "No description provided.",
        html_url: r.html_url,
        homepage: r.homepage,
        topics: r.topics || [],
        language: r.language,
        languageColor: r.language ? languageColors[r.language] || "#8b949e" : "#8b949e",
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        watchers_count: r.watchers_count,
        open_issues_count: r.open_issues_count,
        license: r.license ? { name: r.license.name } : null,
        created_at: r.created_at,
        updated_at: r.updated_at,
        pushed_at: r.pushed_at,
        default_branch: r.default_branch,
        size: r.size,
        category: guessCategory(r),
        featured: false,
        fallback: false,
      }))
      .sort(
        (a: any, b: any) =>
          new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
      );

    cache = { data: repos, timestamp: Date.now() };

    return NextResponse.json({
      source: "github",
      username: developer.githubUsername,
      count: repos.length,
      repos,
    });
  } catch (err: any) {
    // Use fallback projects on failure
    const repos = fallbackProjects.map((r) => ({
      ...r,
      languageColor:
        r.language ? languageColors[r.language] || "#8b949e" : "#8b949e",
    }));
    cache = { data: repos, timestamp: Date.now() };

    return NextResponse.json({
      source: "fallback",
      username: developer.githubUsername,
      count: repos.length,
      error: err?.message || "GitHub API unavailable",
      repos,
    });
  }
}

function guessCategory(r: any): string {
  const topics: string[] = r.topics || [];
  const name = (r.name || "").toLowerCase();
  const desc = (r.description || "").toLowerCase();
  const text = `${name} ${desc} ${topics.join(" ")}`;

  if (/(ai|openai|gpt|llm|machine-learning|ml)/.test(text)) return "AI";
  if (/(api|backend|server|express|node|graphql|microservice)/.test(text))
    return "Backend";
  if (/(saas|dashboard|admin|platform)/.test(text)) return "Full-Stack";
  if (/(mobile|react-native|ios|android)/.test(text)) return "Mobile";
  if (/(game|3d|canvas|webgl)/.test(text)) return "Creative";
  if (/(cli|tool|generator|boilerplate|template)/.test(text)) return "Tool";
  if (/(landing|portfolio|website|blog|marketing)/.test(text)) return "Frontend";
  return "Project";
}
