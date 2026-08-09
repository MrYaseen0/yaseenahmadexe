"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Star,
  GitFork,
  Eye,
  ExternalLink,
  BookOpen,
  Loader2,
  Search,
  X,
  Calendar,
  Scale,
  Code2,
  Tag,
  Layers,
  Clock,
  GitBranch,
  Folder,
  ArrowUpRight,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionHeading } from "../section-heading";
import { TechBadge } from "../tech-icons";
import { developer, socials, getProjectPreview } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  homepage: string | null;
  topics: string[];
  language: string | null;
  languageColor: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  license: { name: string } | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  size?: number;
  category: string;
  featured?: boolean;
  fallback?: boolean;
}

const categories = ["All", "Full-Stack", "AI", "Backend", "Frontend", "Tool", "Project"];

export function Projects() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "stars" | "forks" | "name">("updated");
  const [readmeRepo, setReadmeRepo] = useState<Repo | null>(null);
  const [detailRepo, setDetailRepo] = useState<Repo | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/github", { cache: "no-store" });
      const data = await res.json();
      setRepos(data.repos || []);
      setSource(data.source || "unknown");
      if (data.error) setError(data.error);
    } catch (e: any) {
      setError(e?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = repos.filter((r) => {
    const matchCat = active === "All" || r.category === active;
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.topics.some((t) => t.toLowerCase().includes(q));
    return matchCat && matchQuery;
  });

  // Sort the filtered results
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "stars":
        return b.stargazers_count - a.stargazers_count;
      case "forks":
        return b.forks_count - a.forks_count;
      case "name":
        return a.name.localeCompare(b.name);
      case "updated":
      default:
        return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    }
  });

  return (
    <section id="projects" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          emoji="🚀"
          title="Featured"
          highlight="Projects"
          subtitle="A live showcase of my GitHub repositories — fetched in real-time with documentation previews."
        />

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  active === c
                    ? "bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-soft"
                    : "bg-muted text-muted-foreground hover:bg-sky-500/10 hover:text-sky-600"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sort dropdown */}
            <div className="relative">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-9 cursor-pointer appearance-none rounded-full border border-sky-500/30 bg-card pl-8 pr-8 text-xs font-medium shadow-soft transition-colors hover:border-pink-500/40 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                aria-label="Sort projects"
              >
                <option value="updated">Recently Updated</option>
                <option value="stars">Most Stars</option>
                <option value="forks">Most Forks</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full rounded-full pl-9 pr-4 sm:w-56"
              />
            </div>
            <Button
              onClick={load}
              variant="outline"
              size="sm"
              disabled={loading}
              className="rounded-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </motion.div>

        {/* Source badge */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <Github className="h-3.5 w-3.5" />
          <span>
            Live from{" "}
            <a
              href={socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sky-600 hover:underline"
            >
              @{developer.githubUsername}
            </a>{" "}
            · {repos.length} repos · source:{" "}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 font-medium",
                source === "github"
                  ? "bg-green-500/10 text-green-600"
                  : source === "cache"
                  ? "bg-sky-500/10 text-sky-600"
                  : "bg-amber-500/10 text-amber-600"
              )}
            >
              {source || "loading"}
            </span>
          </span>
          {error && (
            <span className="text-amber-600">({error} — showing curated list)</span>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl border border-sky-500/10 bg-muted/50"
              />
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {sorted.map((repo) => (
                <ProjectCard
                  key={repo.id}
                  repo={repo}
                  onDocs={() => setReadmeRepo(repo)}
                  onDetails={() => setDetailRepo(repo)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {sorted.length === 0 && !loading && (
          <div className="mt-12 text-center text-muted-foreground">
            No projects match your search.
          </div>
        )}

        {/* View all on GitHub */}
        <div className="mt-12 text-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-sky-500/40 px-7 hover:bg-sky-500/5"
          >
            <a href={socials.github} target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              View All on GitHub
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* README docs modal */}
      <ReadmeModal repo={readmeRepo} onClose={() => setReadmeRepo(null)} />

      {/* Project detail modal */}
      <ProjectDetailModal repo={detailRepo} onClose={() => setDetailRepo(null)} />
    </section>
  );
}

function ProjectCard({
  repo,
  onDocs,
  onDetails,
}: {
  repo: Repo;
  onDocs: () => void;
  onDetails: () => void;
}) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({ ry: (px - 0.5) * 10, rx: -(py - 0.5) * 10 });
  };
  const handleLeave = () => setTilt({ rx: 0, ry: 0 });

  return (
    <div className="animate-fade-in-scale perspective-1000">
      <div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: "transform 0.2s ease-out",
        }}
        className="transform-3d group relative flex h-full flex-col overflow-hidden rounded-2xl border border-sky-500/20 bg-card shadow-soft transition-shadow hover:shadow-card-hover"
      >
        {/* Project preview image */}
        <div className="relative h-36 overflow-hidden sm:h-40">
          <img
            src={getProjectPreview(repo.name)}
            alt={`${repo.name} preview`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

          {/* Featured badge overlay */}
          {repo.featured && (
            <Badge className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-pink-500 to-sky-500 px-2 py-0.5 text-[10px] text-white shadow-soft">
              ★ Featured
            </Badge>
          )}

          {/* Category chip overlay */}
          <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {repo.category}
          </span>

          {/* Language dot */}
          {repo.language && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: repo.languageColor }}
              />
              {repo.language}
            </div>
          )}
        </div>

        {/* Top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-pink-400 to-wood" />

        <div className="flex flex-1 flex-col p-5">
          {/* header */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500/15 to-pink-500/15">
                <Github className="h-4 w-4 text-sky-600" />
              </div>
              <h3 className="font-bold leading-tight text-foreground">
                {repo.name.replace(/-/g, " ").replace(/_/g, " ")}
              </h3>
            </div>
          </div>

          {/* description */}
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {repo.description}
          </p>

          {/* topics — tech stack badges with colored icons */}
          {repo.topics.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {repo.topics.slice(0, 4).map((t) => (
                <TechBadge key={t} tech={t} />
              ))}
            </div>
          )}

          {/* stats */}
          <div className="mt-auto grid grid-cols-3 gap-2 border-t border-sky-500/10 pt-3 text-xs">
            <Stat icon={<Star className="h-3 w-3" />} value={repo.stargazers_count} />
            <Stat icon={<GitFork className="h-3 w-3" />} value={repo.forks_count} />
            <Stat icon={<Eye className="h-3 w-3" />} value={repo.watchers_count} />
          </div>

          {/* language */}
          {repo.language && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: repo.languageColor }}
              />
              {repo.language}
              {repo.license && (
                <>
                  <span className="mx-1">·</span>
                  <Scale className="h-3 w-3" />
                  {repo.license.name.replace(" License", "")}
                </>
              )}
            </div>
          )}

          {/* actions */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg border-sky-500/30 hover:bg-sky-500/5"
              onClick={onDetails}
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              Details
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg border-sky-500/30 hover:bg-sky-500/5"
              onClick={onDocs}
            >
              <BookOpen className="mr-1 h-3.5 w-3.5" />
              Docs
            </Button>
            <Button
              size="sm"
              asChild
              className="rounded-lg bg-gradient-to-r from-sky-500 to-pink-500 text-white"
            >
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer" aria-label="View source code on GitHub">
                <Github className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <div className="flex items-center justify-center gap-1 text-muted-foreground">
      <span className="text-pink-500">{icon}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function ReadmeModal({
  repo,
  onClose,
}: {
  repo: Repo | null;
  onClose: () => void;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [branch, setBranch] = useState("main");

  useEffect(() => {
    if (!repo) {
      return;
    }
    let cancelled = false;
    // Loading state set synchronously to show spinner during async fetch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/github/readme?repo=${encodeURIComponent(repo.name)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setContent(data.content);
        setBranch(data.branch || "main");
      })
      .catch(() => cancelled || setContent(null))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  return (
    <Dialog open={!!repo} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-hidden rounded-2xl border-sky-500/20 p-0">
        <DialogHeader className="border-b border-sky-500/10 bg-gradient-to-r from-sky-500/5 to-pink-500/5 px-6 py-4">
          <div className="flex items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-pink-500 text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  {repo?.name} — Documentation
                </DialogTitle>
                <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Code2 className="h-3 w-3" /> {repo?.language || "—"}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-3 w-3" /> {repo?.forks_count} forks
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" /> {repo?.stargazers_count} stars
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" /> branch: {branch}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                <p className="text-sm">Loading README.md from GitHub...</p>
              </div>
            ) : content ? (
              <article className="prose prose-sm max-w-none prose-headings:scroll-mt-20 prose-headings:text-sky-700 prose-a:text-pink-600 prose-code:rounded prose-code:bg-sky-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-pink-600 prose-code:before:hidden prose-code:after:hidden prose-pre:bg-slate-900 prose-pre:text-slate-100 dark:prose-headings:text-sky-300 dark:prose-a:text-pink-400 dark:prose-code:text-pink-400">
                <MarkdownLite content={content} />
              </article>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-muted-foreground">
                <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm">
                  No README found for this repository.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="mt-2 rounded-full bg-gradient-to-r from-sky-500 to-pink-500 text-white"
                >
                  <a
                    href={repo?.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-1.5 h-3.5 w-3.5" />
                    Open on GitHub
                  </a>
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between gap-2 border-t border-sky-500/10 bg-muted/30 px-6 py-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Updated{" "}
            {repo ? new Date(repo.pushed_at).toLocaleDateString() : "—"}
          </span>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-full border-sky-500/30"
          >
            <a href={repo?.html_url} target="_blank" rel="noopener noreferrer">
              <Github className="mr-1.5 h-3.5 w-3.5" />
              View Source
              <ExternalLink className="ml-1.5 h-3 w-3" />
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Lightweight markdown renderer (headings, bold, code, links, lists)
function MarkdownLite({ content }: { content: string }) {
  const lines = content.split("\n");
  const out: React.ReactNode[] = [];
  let inCode = false;
  let codeBuf: string[] = [];
  let inList = false;

  lines.forEach((line, i) => {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        out.push(
          <pre key={`code-${i}`} className="rounded-lg bg-slate-900 p-4 text-sm text-slate-100 overflow-x-auto">
            <code>{codeBuf.join("\n")}</code>
          </pre>
        );
        codeBuf = [];
        inCode = false;
      } else {
        inCode = true;
      }
      return;
    }
    if (inCode) {
      codeBuf.push(line);
      return;
    }

    // headings
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      if (inList) { inList = false; }
      const level = h[1].length;
      const text = inline(h[2]);
      if (level === 1) out.push(<h1 key={i} className="mb-3 mt-4 text-2xl font-bold">{text}</h1>);
      else if (level === 2) out.push(<h2 key={i} className="mb-2 mt-4 text-xl font-bold">{text}</h2>);
      else if (level === 3) out.push(<h3 key={i} className="mb-2 mt-3 text-lg font-semibold">{text}</h3>);
      else out.push(<h4 key={i} className="mb-1 mt-3 text-base font-semibold">{text}</h4>);
      return;
    }

    // list items
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) { out.push(<ul key={`ul-${i}`} className="my-2 list-disc space-y-1 pl-6">{[]}</ul>); inList = true; }
      const last = out[out.length - 1] as React.ReactElement;
      const item = <li key={i}>{inline(line.replace(/^\s*[-*]\s+/, ""))}</li>;
      // append item to last ul
      const children = (last.props as any).children;
      (last.props as any).children = Array.isArray(children)
        ? [...children, item]
        : [children, item].filter(Boolean);
      return;
    }

    if (inList) { inList = false; }

    // horizontal rule
    if (/^---+$/.test(line.trim())) {
      out.push(<hr key={i} className="my-4 border-sky-500/20" />);
      return;
    }

    if (line.trim() === "") {
      out.push(<div key={i} className="h-2" />);
      return;
    }

    out.push(<p key={i} className="my-1.5 leading-relaxed">{inline(line)}</p>);
  });

  if (inCode && codeBuf.length) {
    out.push(
      <pre key="code-final" className="rounded-lg bg-slate-900 p-4 text-sm text-slate-100 overflow-x-auto">
        <code>{codeBuf.join("\n")}</code>
      </pre>
    );
  }

  return <>{out}</>;
}

function inline(text: string): React.ReactNode[] {
  // handle **bold**, `code`, [link](url)
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      parts.push(<strong key={key++} className="font-bold text-foreground">{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("`")) {
      parts.push(<code key={key++} className="rounded bg-sky-500/10 px-1.5 py-0.5 text-pink-600 dark:text-pink-400">{tok.slice(1, -1)}</code>);
    } else if (tok.startsWith("[")) {
      const lm = tok.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (lm) parts.push(<a key={key++} href={lm[2]} target="_blank" rel="noopener noreferrer" className="font-medium text-pink-600 underline dark:text-pink-400">{lm[1]}</a>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ===== Project Detail Modal — rich visual showcase =====
function ProjectDetailModal({
  repo,
  onClose,
}: {
  repo: Repo | null;
  onClose: () => void;
}) {
  if (!repo) return null;

  const preview = getProjectPreview(repo.name);
  const liveDemo = repo.homepage && repo.homepage.trim() !== "" ? repo.homepage : null;
  const createdDate = new Date(repo.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
  const updatedDate = new Date(repo.pushed_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });

  return (
    <Dialog open={!!repo} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl border-sky-500/20 p-0">
        {/* Hero preview image */}
        <div className="relative h-56 overflow-hidden sm:h-64">
          <img
            src={preview}
            alt={`${repo.name} preview`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Featured badge */}
          {repo.featured && (
            <Badge className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-pink-500 to-sky-500 px-3 py-1 text-[11px] text-white shadow-soft">
              ★ Featured Project
            </Badge>
          )}

          {/* Title overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                {repo.category}
              </span>
              {repo.language && (
                <span className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: repo.languageColor }}
                  />
                  {repo.language}
                </span>
              )}
            </div>
            <h2 className="mt-2 text-2xl font-bold capitalize text-white sm:text-3xl">
              {repo.name.replace(/-/g, " ").replace(/_/g, " ")}
            </h2>
          </div>
        </div>

        <ScrollArea className="max-h-[calc(90vh-16rem)]">
          <div className="p-6">
            {/* Description */}
            <div className="mb-5">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                <Folder className="h-4 w-4 text-sky-500" />
                About this project
              </h3>
              <p className="text-sm leading-relaxed text-foreground sm:text-base">
                {repo.description}
              </p>
            </div>

            {/* Tech stack / topics */}
            {repo.topics.length > 0 && (
              <div className="mb-5">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  <Layers className="h-4 w-4 text-pink-500" />
                  Tech Stack & Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {repo.topics.map((t) => (
                    <TechBadge key={t} tech={t} size="md" />
                  ))}
                </div>
              </div>
            )}

            {/* Stats grid */}
            <div className="mb-5">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                <Star className="h-4 w-4 text-amber-500" />
                Repository Stats
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <DetailStat
                  icon={<Star className="h-4 w-4" />}
                  value={repo.stargazers_count}
                  label="Stars"
                  color="text-amber-500"
                />
                <DetailStat
                  icon={<GitFork className="h-4 w-4" />}
                  value={repo.forks_count}
                  label="Forks"
                  color="text-sky-500"
                />
                <DetailStat
                  icon={<Eye className="h-4 w-4" />}
                  value={repo.watchers_count}
                  label="Watchers"
                  color="text-pink-500"
                />
                <DetailStat
                  icon={<Folder className="h-4 w-4" />}
                  value={repo.open_issues_count}
                  label="Issues"
                  color="text-wood"
                />
              </div>
            </div>

            {/* Meta info */}
            <div className="mb-5 grid gap-2 rounded-xl border border-sky-500/15 bg-muted/30 p-4 text-xs sm:grid-cols-2">
              <MetaRow
                icon={<GitBranch className="h-3.5 w-3.5" />}
                label="Default branch"
                value={repo.default_branch}
              />
              <MetaRow
                icon={<Scale className="h-3.5 w-3.5" />}
                label="License"
                value={repo.license ? repo.license.name : "Not specified"}
              />
              <MetaRow
                icon={<Calendar className="h-3.5 w-3.5" />}
                label="Created"
                value={createdDate}
              />
              <MetaRow
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Last updated"
                value={updatedDate}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                asChild
                className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-soft"
              >
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  View Source Code
                  <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                </a>
              </Button>
              {liveDemo ? (
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 rounded-xl border-green-500/40 hover:bg-green-500/5"
                >
                  <a href={liveDemo} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Live Demo
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function DetailStat({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-sky-500/15 bg-card p-3 text-center shadow-soft">
      <div className={`mx-auto mb-1 flex justify-center ${color}`}>{icon}</div>
      <div className="text-lg font-bold text-foreground">
        {value.toLocaleString()}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span className="text-sky-500">{icon}</span>
        {label}
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
