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
import { developer, socials } from "@/lib/portfolio-data";
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
  const [readmeRepo, setReadmeRepo] = useState<Repo | null>(null);

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

          <div className="flex items-center gap-2">
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
              {filtered.map((repo) => (
                <ProjectCard
                  key={repo.id}
                  repo={repo}
                  onDocs={() => setReadmeRepo(repo)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {filtered.length === 0 && !loading && (
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
    </section>
  );
}

function ProjectCard({
  repo,
  onDocs,
}: {
  repo: Repo;
  onDocs: () => void;
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
        {/* Top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-pink-400 to-wood" />

        <div className="flex flex-1 flex-col p-5">
          {/* header */}
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500/15 to-pink-500/15">
                <Github className="h-4 w-4 text-sky-600" />
              </div>
              <div>
                <h3 className="font-bold leading-tight text-foreground">
                  {repo.name.replace(/-/g, " ").replace(/_/g, " ")}
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  {repo.category}
                </span>
              </div>
            </div>
            {repo.featured && (
              <Badge className="rounded-full bg-gradient-to-r from-pink-500 to-sky-500 px-2 py-0.5 text-[10px] text-white">
                Featured
              </Badge>
            )}
          </div>

          {/* description */}
          <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">
            {repo.description}
          </p>

          {/* topics */}
          {repo.topics.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {repo.topics.slice(0, 4).map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-700 dark:text-sky-300"
                >
                  {t}
                </Badge>
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
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-lg border-sky-500/30 hover:bg-sky-500/5"
              onClick={onDocs}
            >
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              Docs
            </Button>
            <Button
              size="sm"
              asChild
              className="flex-1 rounded-lg bg-gradient-to-r from-sky-500 to-pink-500 text-white"
            >
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                <Github className="mr-1.5 h-3.5 w-3.5" />
                Code
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
