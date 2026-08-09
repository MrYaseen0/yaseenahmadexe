import { NextResponse } from "next/server";
import { developer } from "@/lib/portfolio-data";

// In-memory cache for GitHub repos (5 minutes)
let cache: { data: any[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

// Fallback curated projects (used when rate-limited or offline)
const fallbackProjects = [
  {
    id: 1,
    name: "saas-dashboard",
    full_name: "MrYaseen0/saas-dashboard",
    description:
      "A full-featured SaaS dashboard with authentication, analytics, and subscription management built with Next.js, TypeScript, Stripe, and PostgreSQL.",
    html_url: "https://github.com/MrYaseen0/saas-dashboard",
    homepage: "https://saas-dashboard-demo.vercel.app",
    topics: ["nextjs", "typescript", "stripe", "postgresql", "saas"],
    language: "TypeScript",
    stargazers_count: 248,
    forks_count: 56,
    watchers_count: 248,
    open_issues_count: 3,
    license: { name: "MIT License" },
    created_at: "2024-03-15T10:00:00Z",
    updated_at: "2025-07-20T14:30:00Z",
    pushed_at: "2025-07-20T14:30:00Z",
    default_branch: "main",
    featured: true,
    category: "Full-Stack",
    fallback: true,
  },
  {
    id: 2,
    name: "ecommerce-platform",
    full_name: "MrYaseen0/ecommerce-platform",
    description:
      "Modern e-commerce solution with cart, checkout, and admin panel for inventory management. Built with React, Node.js, MongoDB, and Tailwind CSS.",
    html_url: "https://github.com/MrYaseen0/ecommerce-platform",
    homepage: "https://ecommerce-demo.vercel.app",
    topics: ["react", "nodejs", "mongodb", "tailwind", "ecommerce"],
    language: "JavaScript",
    stargazers_count: 187,
    forks_count: 42,
    watchers_count: 187,
    open_issues_count: 5,
    license: { name: "MIT License" },
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2025-06-12T11:20:00Z",
    pushed_at: "2025-06-12T11:20:00Z",
    default_branch: "main",
    featured: true,
    category: "Full-Stack",
    fallback: true,
  },
  {
    id: 3,
    name: "ai-content-generator",
    full_name: "MrYaseen0/ai-content-generator",
    description:
      "AI-powered content creation tool using OpenAI API for generating blog posts and marketing copy. Built with Next.js, OpenAI, Prisma, and deployed on Vercel.",
    html_url: "https://github.com/MrYaseen0/ai-content-generator",
    homepage: "https://ai-writer.vercel.app",
    topics: ["nextjs", "openai", "prisma", "vercel", "ai"],
    language: "TypeScript",
    stargazers_count: 312,
    forks_count: 78,
    watchers_count: 312,
    open_issues_count: 2,
    license: { name: "MIT License" },
    created_at: "2024-05-22T08:00:00Z",
    updated_at: "2025-08-01T16:45:00Z",
    pushed_at: "2025-08-01T16:45:00Z",
    default_branch: "main",
    featured: true,
    category: "AI",
    fallback: true,
  },
  {
    id: 4,
    name: "social-media-app",
    full_name: "MrYaseen0/social-media-app",
    description:
      "Real-time social platform with posts, comments, messaging, and notification system. Built with React, Firebase, Socket.io, and Material UI.",
    html_url: "https://github.com/MrYaseen0/social-media-app",
    homepage: null,
    topics: ["react", "firebase", "socket-io", "material-ui"],
    language: "JavaScript",
    stargazers_count: 156,
    forks_count: 34,
    watchers_count: 156,
    open_issues_count: 7,
    license: null,
    created_at: "2023-11-05T12:00:00Z",
    updated_at: "2025-05-18T09:10:00Z",
    pushed_at: "2025-05-18T09:10:00Z",
    default_branch: "main",
    featured: true,
    category: "Full-Stack",
    fallback: true,
  },
  {
    id: 5,
    name: "portfolio-generator",
    full_name: "MrYaseen0/portfolio-generator",
    description:
      "Dynamic portfolio builder allowing developers to create and deploy portfolios in minutes. Built with Next.js, MDX, Tailwind, and Vercel.",
    html_url: "https://github.com/MrYaseen0/portfolio-generator",
    homepage: "https://portfolio-gen.vercel.app",
    topics: ["nextjs", "mdx", "tailwind", "vercel"],
    language: "TypeScript",
    stargazers_count: 98,
    forks_count: 21,
    watchers_count: 98,
    open_issues_count: 1,
    license: { name: "Apache-2.0 License" },
    created_at: "2024-07-01T14:00:00Z",
    updated_at: "2025-06-28T10:00:00Z",
    pushed_at: "2025-06-28T10:00:00Z",
    default_branch: "main",
    featured: true,
    category: "Tool",
    fallback: true,
  },
  {
    id: 6,
    name: "task-management",
    full_name: "MrYaseen0/task-management",
    description:
      "Kanban-style project management tool with drag-and-drop, deadlines, and team collaboration. Built with React, DnD Kit, Zustand, and Supabase.",
    html_url: "https://github.com/MrYaseen0/task-management",
    homepage: null,
    topics: ["react", "dnd-kit", "zustand", "supabase"],
    language: "TypeScript",
    stargazers_count: 134,
    forks_count: 28,
    watchers_count: 134,
    open_issues_count: 4,
    license: { name: "MIT License" },
    created_at: "2024-02-18T11:30:00Z",
    updated_at: "2025-07-05T13:15:00Z",
    pushed_at: "2025-07-05T13:15:00Z",
    default_branch: "main",
    featured: true,
    category: "Productivity",
    fallback: true,
  },
  {
    id: 7,
    name: "weather-app",
    full_name: "MrYaseen0/weather-app",
    description:
      "Beautiful weather application with location search, 7-day forecast, and animated weather conditions using OpenWeather API.",
    html_url: "https://github.com/MrYaseen0/weather-app",
    homepage: null,
    topics: ["react", "openweather", "tailwind"],
    language: "JavaScript",
    stargazers_count: 67,
    forks_count: 12,
    watchers_count: 67,
    open_issues_count: 0,
    license: null,
    created_at: "2023-09-12T10:00:00Z",
    updated_at: "2024-12-20T08:00:00Z",
    pushed_at: "2024-12-20T08:00:00Z",
    default_branch: "main",
    featured: false,
    category: "Frontend",
    fallback: true,
  },
  {
    id: 8,
    name: "recipe-finder",
    full_name: "MrYaseen0/recipe-finder",
    description:
      "Recipe discovery app with search, filters, favorites, and detailed cooking instructions. Powered by Spoonacular API.",
    html_url: "https://github.com/MrYaseen0/recipe-finder",
    homepage: null,
    topics: ["react", "api", "tailwind"],
    language: "JavaScript",
    stargazers_count: 45,
    forks_count: 8,
    watchers_count: 45,
    open_issues_count: 1,
    license: null,
    created_at: "2023-12-01T09:00:00Z",
    updated_at: "2025-01-15T14:00:00Z",
    pushed_at: "2025-01-15T14:00:00Z",
    default_branch: "main",
    featured: false,
    category: "Frontend",
    fallback: true,
  },
  {
    id: 9,
    name: "expense-tracker",
    full_name: "MrYaseen0/expense-tracker",
    description:
      "Personal finance tracker with charts, categories, budget goals, and export to CSV. Built with React and Recharts.",
    html_url: "https://github.com/MrYaseen0/expense-tracker",
    homepage: null,
    topics: ["react", "recharts", "finance"],
    language: "TypeScript",
    stargazers_count: 89,
    forks_count: 19,
    watchers_count: 89,
    open_issues_count: 2,
    license: { name: "MIT License" },
    created_at: "2024-04-08T11:00:00Z",
    updated_at: "2025-03-22T16:00:00Z",
    pushed_at: "2025-03-22T16:00:00Z",
    default_branch: "main",
    featured: false,
    category: "Frontend",
    fallback: true,
  },
  {
    id: 10,
    name: "realtime-chat",
    full_name: "MrYaseen0/realtime-chat",
    description:
      "Real-time chat application with rooms, typing indicators, and message history using Socket.io and Node.js.",
    html_url: "https://github.com/MrYaseen0/realtime-chat",
    homepage: null,
    topics: ["socket-io", "nodejs", "react"],
    language: "TypeScript",
    stargazers_count: 112,
    forks_count: 24,
    watchers_count: 112,
    open_issues_count: 3,
    license: { name: "MIT License" },
    created_at: "2024-06-15T13:00:00Z",
    updated_at: "2025-07-30T15:20:00Z",
    pushed_at: "2025-07-30T15:20:00Z",
    default_branch: "main",
    featured: false,
    category: "Full-Stack",
    fallback: true,
  },
  {
    id: 11,
    name: "blog-platform",
    full_name: "MrYaseen0/blog-platform",
    description:
      "Full-featured blog platform with MDX, syntax highlighting, comments, and admin dashboard. Built with Next.js App Router.",
    html_url: "https://github.com/MrYaseen0/blog-platform",
    homepage: null,
    topics: ["nextjs", "mdx", "prisma"],
    language: "TypeScript",
    stargazers_count: 76,
    forks_count: 15,
    watchers_count: 76,
    open_issues_count: 1,
    license: { name: "MIT License" },
    created_at: "2024-08-20T10:00:00Z",
    updated_at: "2025-04-10T12:00:00Z",
    pushed_at: "2025-04-10T12:00:00Z",
    default_branch: "main",
    featured: false,
    category: "Full-Stack",
    fallback: true,
  },
  {
    id: 12,
    name: "movie-database",
    full_name: "MrYaseen0/movie-database",
    description:
      "Movie discovery app with TMDB integration, search, watchlist, and personalized recommendations.",
    html_url: "https://github.com/MrYaseen0/movie-database",
    homepage: null,
    topics: ["react", "tmdb", "tailwind"],
    language: "JavaScript",
    stargazers_count: 54,
    forks_count: 9,
    watchers_count: 54,
    open_issues_count: 0,
    license: null,
    created_at: "2023-10-25T14:00:00Z",
    updated_at: "2024-11-30T11:00:00Z",
    pushed_at: "2024-11-30T11:00:00Z",
    default_branch: "main",
    featured: false,
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
    const res = await fetch(
      `https://api.github.com/users/${developer.githubUsername}/repos?per_page=100&sort=updated`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        next: { revalidate: 300 },
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
