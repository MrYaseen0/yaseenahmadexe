"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionHeading } from "../section-heading";
import { Reveal } from "../reveal";
import { getProjectPreview } from "@/lib/portfolio-data";
import { Editable, useContent } from "@/components/portfolio/content-editor";
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

function errMsg(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

export function Projects() {
  const { t, tj } = useContent();
  const categories = tj<string[]>("projects.categories");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "stars" | "forks" | "name">("updated");
  const [readmeRepo, setReadmeRepo] = useState<Repo | null>(null);
  const [detailRepo, setDetailRepo] = useState<Repo | null>(null);

  const fetchRepos = useCallback(async () => {
    const res = await fetch("/api/github", { cache: "no-store" });
    const data = await res.json();
    return {
      repos: (data.repos || []) as Repo[],
      source: (data.source || "unknown") as string,
      error: (data.error || null) as string | null,
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { repos, source, error } = await fetchRepos();
      setRepos(repos);
      setSource(source);
      if (error) setError(error);
    } catch (e: unknown) {
      setError(errMsg(e, "Failed to load projects"));
    } finally {
      setLoading(false);
    }
  }, [fetchRepos]);

  // Initial fetch. All state updates happen after `await`, never
  // synchronously inside the effect. Cancelled on unmount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { repos, source, error } = await fetchRepos();
        if (cancelled) return;
        setRepos(repos);
        setSource(source);
        if (error) setError(error);
      } catch (e: unknown) {
        if (!cancelled) setError(errMsg(e, "Failed to load projects"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchRepos]);

  const filtered = repos.filter((r) => {
    const matchCat = active === "All" || r.category === active;
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      r.name.toLowerCase().includes(q) ||
      (r.description || "").toLowerCase().includes(q) ||
      r.topics.some((topic) => topic.toLowerCase().includes(q));
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
    <section id="projects" className="border-t border-[var(--hairline)] bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading ek="projects" />
        <Editable id="projects.categories" json label="Filter categories" />

        {/* Controls */}
        <Reveal className="mt-10 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                aria-pressed={active === c}
                className={cn(
                  "rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
                  active === c
                    ? "border-[#101410] bg-[#101410] text-white"
                    : "border-[var(--hairline)] bg-white text-[var(--muted)] hover:border-[#101410] hover:text-[#101410]"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sort dropdown */}
            <div className="relative">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-9 cursor-pointer appearance-none rounded-full border border-[var(--hairline)] bg-white pl-8 pr-8 text-xs font-medium text-[#101410] transition-colors hover:border-[#101410] focus:border-[#101410] focus:outline-none"
                aria-label={t("a11y.sortProjects")}
              >
                <option value="updated">{t("projects.sortUpdated")}</option>
                <option value="stars">{t("projects.sortStars")}</option>
                <option value="forks">{t("projects.sortForks")}</option>
                <option value="name">{t("projects.sortName")}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("projects.searchPlaceholder")}
                className="w-full rounded-full border-[var(--hairline)] bg-white pl-9 pr-4 focus:border-[#101410] sm:w-56"
              />
            </div>
            <Button
              onClick={load}
              variant="outline"
              size="sm"
              disabled={loading}
              className="rounded-full border-[var(--hairline)] hover:border-[#101410]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("projects.refresh")
              )}
            </Button>
          </div>
        </Reveal>

        {/* Source badge */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-[var(--muted)]">
          <Github className="h-3.5 w-3.5" />
          <span>
            <Editable id="projects.liveFrom" />{" "}
            <a
              href={t("socials.github")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#101410] underline underline-offset-2 hover:text-[#166534]"
            >
              @{t("brand.githubUsername")}
            </a>{" "}
            · {repos.length} <Editable id="projects.reposWord" /> ·{" "}
            <Editable id="projects.sourceWord" />:{" "}
            <span className="rounded-full border border-[var(--hairline)] bg-white px-2 py-0.5">
              {source || "loading"}
            </span>
          </span>
          {error && (
            <span>
              ({error} — <Editable id="projects.curatedNote" />)
            </span>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-xl bg-[#F4F5F1]"
                aria-hidden="true"
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
          <div className="mt-12 text-center text-sm text-[var(--muted)]">
            <Editable id="projects.noMatch" />
          </div>
        )}

        {/* View all on GitHub */}
        <div className="mt-12 text-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-[var(--hairline)] px-7 hover:border-[#101410]"
          >
            <a href={t("socials.github")} target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              <Editable id="projects.viewAll" />
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
  const liveDemo =
    repo.homepage && repo.homepage.trim() !== "" ? repo.homepage : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="h-full"
    >
      <article className="flex h-full flex-col rounded-xl border border-[var(--hairline)] bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(16,20,16,0.06)]">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="font-medium leading-snug text-[#101410]">
            {repo.name.replace(/-/g, " ").replace(/_/g, " ")}
          </h3>
          {repo.featured && (
            <span className="shrink-0 rounded-full border border-[var(--hairline)] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
              <Editable id="projects.featuredBadge" />
            </span>
          )}
        </div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
          {repo.category}
        </p>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
          {repo.description}
        </p>

        {/* topics */}
        {repo.topics.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {repo.topics.slice(0, 4).map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-[var(--hairline)] bg-white px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {/* footer: language + stats + links */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--hairline)] pt-4">
          <div className="flex items-center gap-3 font-mono text-xs text-[var(--muted)]">
            {repo.language && (
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: repo.languageColor }}
                />
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5" />
              {repo.stargazers_count}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-3.5 w-3.5" />
              {repo.forks_count}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={onDetails}
              className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:text-[#101410]"
            >
              <Eye className="h-3.5 w-3.5" />
              <Editable id="projects.detailsBtn" />
            </button>
            <button
              onClick={onDocs}
              className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:text-[#101410]"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <Editable id="projects.docsBtn" />
            </button>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${repo.name} source code on GitHub`}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:text-[#101410]"
            >
              <Github className="h-4 w-4" />
            </a>
            {liveDemo && (
              <a
                href={liveDemo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${repo.name} live demo`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:text-[#101410]"
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </article>
    </motion.div>
  );
}

function ReadmeModal({
  repo,
  onClose,
}: {
  repo: Repo | null;
  onClose: () => void;
}) {
  const { t } = useContent();
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
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-hidden rounded-xl border border-[var(--hairline)] bg-white p-0">
        <DialogHeader className="border-b border-[var(--hairline)] px-6 py-4">
          <div className="flex items-center gap-3 pr-8">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--hairline)] bg-white">
              <BookOpen className="h-5 w-5 text-[#101410]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-[#101410]">
                {repo?.name} — <Editable id="projects.docsTitle" />
              </DialogTitle>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-[var(--muted)]">
                <span className="flex items-center gap-1">
                  <Code2 className="h-3 w-3" /> {repo?.language || "—"}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="h-3 w-3" /> {repo?.forks_count}{" "}
                  <Editable id="projects.forksWord" />
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" /> {repo?.stargazers_count}{" "}
                  <Editable id="projects.starsWord" />
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" /> <Editable id="projects.branchWord" />:{" "}
                  {branch}
                </span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-[var(--muted)]">
                <Loader2 className="h-8 w-8 animate-spin text-[#101410]" />
                <p className="text-sm">
                  <Editable id="projects.readmeLoading" />
                </p>
              </div>
            ) : content ? (
              <div className="max-w-none">
                <MarkdownLite content={content} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-[var(--muted)]">
                <BookOpen className="h-8 w-8 text-[var(--muted)]" />
                <p className="text-sm">
                  <Editable id="projects.noReadme" />
                </p>
                <Button
                  asChild
                  size="sm"
                  className="mt-2 rounded-full bg-[#101410] text-white hover:bg-black"
                >
                  <a
                    href={repo?.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-1.5 h-3.5 w-3.5" />
                    <Editable id="projects.openGithub" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between gap-2 border-t border-[var(--hairline)] px-6 py-3">
          <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <Calendar className="h-3 w-3" />
            <Editable id="projects.updatedWord" />{" "}
            {repo ? new Date(repo.pushed_at).toLocaleDateString() : "—"}
          </span>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-full border-[var(--hairline)] hover:border-[#101410]"
          >
            <a href={repo?.html_url} target="_blank" rel="noopener noreferrer">
              <Github className="mr-1.5 h-3.5 w-3.5" />
              <Editable id="projects.viewSource" />
              <ExternalLink className="ml-1.5 h-3 w-3" />
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Lightweight markdown renderer (headings, bold, code, links, lists, rules)
type MdBlock =
  | { kind: "h"; level: number; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "code"; text: string }
  | { kind: "hr" }
  | { kind: "blank" };

function parseMarkdown(content: string): MdBlock[] {
  const blocks: MdBlock[] = [];
  const lines = content.split("\n");
  let inCode = false;
  let codeBuf: string[] = [];
  let listBuf: string[] = [];
  const flushList = () => {
    if (listBuf.length > 0) {
      blocks.push({ kind: "ul", items: listBuf });
      listBuf = [];
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        blocks.push({ kind: "code", text: codeBuf.join("\n") });
        codeBuf = [];
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushList();
      blocks.push({ kind: "h", level: h[1].length, text: h[2] });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      listBuf.push(line.replace(/^\s*[-*]\s+/, ""));
      continue;
    }
    flushList();

    if (/^---+$/.test(line.trim())) {
      blocks.push({ kind: "hr" });
      continue;
    }

    if (line.trim() === "") {
      blocks.push({ kind: "blank" });
      continue;
    }

    blocks.push({ kind: "p", text: line });
  }

  flushList();
  if (inCode && codeBuf.length > 0) {
    blocks.push({ kind: "code", text: codeBuf.join("\n") });
  }
  return blocks;
}

function MarkdownLite({ content }: { content: string }) {
  const blocks = parseMarkdown(content);
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "h":
            if (b.level === 1)
              return (
                <h1 key={i} className="mb-3 mt-4 text-2xl font-semibold text-[#101410]">
                  {inline(b.text)}
                </h1>
              );
            if (b.level === 2)
              return (
                <h2 key={i} className="mb-2 mt-4 text-xl font-semibold text-[#101410]">
                  {inline(b.text)}
                </h2>
              );
            if (b.level === 3)
              return (
                <h3 key={i} className="mb-2 mt-3 text-lg font-medium text-[#101410]">
                  {inline(b.text)}
                </h3>
              );
            return (
              <h4 key={i} className="mb-1 mt-3 text-base font-medium text-[#101410]">
                {inline(b.text)}
              </h4>
            );
          case "ul":
            return (
              <ul
                key={i}
                className="my-2 list-disc space-y-1 pl-6 text-sm leading-relaxed text-[#101410]"
              >
                {b.items.map((item, j) => (
                  <li key={j}>{inline(item)}</li>
                ))}
              </ul>
            );
          case "code":
            return (
              <pre
                key={i}
                className="my-3 overflow-x-auto rounded-lg border border-[var(--hairline)] bg-[#F4F5F1] p-4 font-mono text-[13px] leading-relaxed text-[#101410]"
              >
                <code>{b.text}</code>
              </pre>
            );
          case "hr":
            return <hr key={i} className="my-4 border-[var(--hairline)]" />;
          case "blank":
            return <div key={i} className="h-2" aria-hidden="true" />;
          case "p":
          default:
            return (
              <p key={i} className="my-1.5 text-sm leading-relaxed text-[#101410]">
                {inline(b.text)}
              </p>
            );
        }
      })}
    </>
  );
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
      parts.push(
        <strong key={key++} className="font-semibold text-[#101410]">
          {tok.slice(2, -2)}
        </strong>
      );
    } else if (tok.startsWith("`")) {
      parts.push(
        <code
          key={key++}
          className="rounded border border-[var(--hairline)] bg-[#F4F5F1] px-1.5 py-0.5 font-mono text-[12px] text-[#101410]"
        >
          {tok.slice(1, -1)}
        </code>
      );
    } else if (tok.startsWith("[")) {
      const lm = tok.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (lm)
        parts.push(
          <a
            key={key++}
            href={lm[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#166534] underline underline-offset-2"
          >
            {lm[1]}
          </a>
        );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ===== Project Detail Modal =====
function ProjectDetailModal({
  repo,
  onClose,
}: {
  repo: Repo | null;
  onClose: () => void;
}) {
  const { t } = useContent();
  if (!repo) return null;

  const preview = getProjectPreview(repo.name);
  const liveDemo =
    repo.homepage && repo.homepage.trim() !== "" ? repo.homepage : null;
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
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden rounded-xl border border-[var(--hairline)] bg-white p-0">
        {/* Preview image */}
        <div className="relative h-56 overflow-hidden border-b border-[var(--hairline)] sm:h-64">
          <Image
            src={preview}
            alt={`${repo.name} preview`}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>

        <ScrollArea className="max-h-[calc(90vh-16rem)]">
          <div className="p-6">
            <div className="mb-1 flex items-start justify-between gap-3 pr-8">
              <h2 className="text-2xl font-semibold capitalize text-[#101410] sm:text-3xl">
                {repo.name.replace(/-/g, " ").replace(/_/g, " ")}
              </h2>
              {repo.featured && (
                <span className="mt-1 shrink-0 rounded-full border border-[var(--hairline)] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  <Editable id="projects.featuredBadge" />
                </span>
              )}
            </div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[var(--hairline)] bg-white px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                {repo.category}
              </span>
              {repo.language && (
                <span className="flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-white px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: repo.languageColor }}
                  />
                  {repo.language}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-5">
              <h3 className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
                <Folder className="h-4 w-4 text-[#101410]" />
                <Editable id="projects.aboutWord" />
              </h3>
              <p className="text-sm leading-relaxed text-[#101410] sm:text-base">
                {repo.description}
              </p>
            </div>

            {/* Tech stack / topics */}
            {repo.topics.length > 0 && (
              <div className="mb-5">
                <h3 className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
                  <Layers className="h-4 w-4 text-[#101410]" />
                  <Editable id="projects.techWord" />
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {repo.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full border border-[var(--hairline)] bg-white px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats grid */}
            <div className="mb-5">
              <h3 className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
                <Star className="h-4 w-4 text-[#101410]" />
                <Editable id="projects.statsWord" />
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <DetailStat
                  icon={<Star className="h-4 w-4" />}
                  value={repo.stargazers_count}
                  label={t("projects.starsWord")}
                />
                <DetailStat
                  icon={<GitFork className="h-4 w-4" />}
                  value={repo.forks_count}
                  label={t("projects.forksWord")}
                />
                <DetailStat
                  icon={<Eye className="h-4 w-4" />}
                  value={repo.watchers_count}
                  label={t("projects.watchersWord")}
                />
                <DetailStat
                  icon={<Folder className="h-4 w-4" />}
                  value={repo.open_issues_count}
                  label={t("projects.issuesWord")}
                />
              </div>
            </div>

            {/* Meta info */}
            <div className="mb-5 grid gap-2 rounded-xl border border-[var(--hairline)] bg-white p-4 text-xs sm:grid-cols-2">
              <MetaRow
                icon={<GitBranch className="h-3.5 w-3.5" />}
                label={t("projects.branchLabel")}
                value={repo.default_branch}
              />
              <MetaRow
                icon={<Scale className="h-3.5 w-3.5" />}
                label={t("projects.licenseWord")}
                value={repo.license ? repo.license.name : t("projects.notSpecified")}
              />
              <MetaRow
                icon={<Calendar className="h-3.5 w-3.5" />}
                label={t("projects.createdWord")}
                value={createdDate}
              />
              <MetaRow
                icon={<Clock className="h-3.5 w-3.5" />}
                label={t("projects.updatedLabel")}
                value={updatedDate}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                asChild
                className="flex-1 rounded-full bg-[#101410] px-6 py-3 text-sm font-medium text-white hover:bg-black"
              >
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  <Editable id="projects.viewSourceCode" />
                  <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                </a>
              </Button>
              {liveDemo ? (
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 rounded-full border-[var(--hairline)] hover:border-[#101410]"
                >
                  <a href={liveDemo} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    <Editable id="projects.liveDemo" />
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
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--hairline)] bg-white p-3 text-center">
      <div className="mx-auto mb-1 flex justify-center text-[#101410]">{icon}</div>
      <div className="text-lg font-semibold text-[#101410]">
        {value.toLocaleString()}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
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
      <span className="flex items-center gap-1.5 text-[var(--muted)]">
        <span className="text-[#101410]">{icon}</span>
        {label}
      </span>
      <span className="font-medium text-[#101410]">{value}</span>
    </div>
  );
}
