"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  X,
  BookOpen,
  Tag,
  Search,
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
import { developer } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string;
  coverColor: string;
  readTime: number;
  featured: boolean;
  createdAt: string;
}

interface FullArticle extends Article {
  content: string;
  updatedAt: string;
}

const colorMap: Record<string, { bg: string; ring: string; text: string; gradient: string }> = {
  sky: {
    bg: "from-sky-500/10 to-sky-500/5",
    ring: "border-sky-500/30",
    text: "text-sky-600 dark:text-sky-400",
    gradient: "from-sky-400 to-blue-600",
  },
  pink: {
    bg: "from-pink-500/10 to-pink-500/5",
    ring: "border-pink-500/30",
    text: "text-pink-600 dark:text-pink-400",
    gradient: "from-pink-400 to-rose-600",
  },
  wood: {
    bg: "from-wood/10 to-wood/5",
    ring: "border-wood/30",
    text: "text-wood",
    gradient: "from-amber-500 to-orange-700",
  },
};

export function Blog() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blog", { cache: "no-store" });
      const data = await res.json();
      setArticles(data.articles || []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    articles.forEach((a) => {
      a.tags.split(",").forEach((t) => {
        const trimmed = t.trim();
        if (trimmed) tagSet.add(trimmed);
      });
    });
    return ["All", ...Array.from(tagSet).sort()];
  }, [articles]);

  // Filter articles by search query and active tag
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return articles.filter((a) => {
      const matchesTag = activeTag === "All" || a.tags.split(",").map((t) => t.trim()).includes(activeTag);
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.toLowerCase().includes(q);
      return matchesTag && matchesQuery;
    });
  }, [articles, query, activeTag]);

  const featured = filtered.filter((a) => a.featured);
  const regular = filtered.filter((a) => !a.featured);
  const isFiltering = query.trim() !== "" || activeTag !== "All";

  return (
    <section id="blog" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          emoji="📝"
          title="Latest"
          highlight="Articles"
          subtitle="Thoughts on web development, architecture, and the freelance journey — from my keyboard to your screen."
        />

        {loading ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl border border-sky-500/10 bg-muted/50"
              />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="mt-12 text-center text-muted-foreground">
            No articles published yet. Check back soon!
          </div>
        ) : (
          <>
            {/* Search & filter controls */}
            <div className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
              {/* Tag filter pills */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                      activeTag === tag
                        ? "bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-soft"
                        : "bg-muted text-muted-foreground hover:bg-sky-500/10 hover:text-sky-600"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="rounded-full pl-9 pr-4"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Results count when filtering */}
            {isFiltering && (
              <div className="mt-4 text-center text-xs text-muted-foreground">
                Showing {filtered.length} of {articles.length} articles
                {activeTag !== "All" && (
                  <>
                    {" "}in <span className="font-semibold text-sky-600 dark:text-sky-400">{activeTag}</span>
                  </>
                )}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="mt-12 flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
                <Search className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm">No articles match your search.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-sky-500/30"
                  onClick={() => {
                    setQuery("");
                    setActiveTag("All");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                {/* Featured articles (hidden when filtering) */}
                {!isFiltering && featured.length > 0 && (
                  <div className="mt-12 grid gap-6 md:grid-cols-2">
                    {featured.map((article, i) => (
                      <FeaturedArticleCard
                        key={article.id}
                        article={article}
                        index={i}
                        onRead={() => setSelectedSlug(article.slug)}
                      />
                    ))}
                  </div>
                )}

                {/* Regular articles */}
                {regular.length > 0 && (
                  <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", !isFiltering && "mt-6")}>
                    {regular.map((article, i) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        index={i}
                        onRead={() => setSelectedSlug(article.slug)}
                      />
                    ))}
                  </div>
                )}

                {/* RSS / subscribe hint */}
                <div className="mt-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    Want to read more?{" "}
                    <button
                      onClick={() =>
                        document
                          .querySelector("#contact")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="font-semibold text-pink-600 underline-offset-4 hover:underline dark:text-pink-400"
                    >
                      Let&apos;s connect →
                    </button>
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Article detail modal */}
      <ArticleModal slug={selectedSlug} onClose={() => setSelectedSlug(null)} />
    </section>
  );
}

function FeaturedArticleCard({
  article,
  index,
  onRead,
}: {
  article: Article;
  index: number;
  onRead: () => void;
}) {
  const colors = colorMap[article.coverColor] || colorMap.sky;
  const tags = article.tags.split(",").filter(Boolean);
  const date = new Date(article.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.button
      onClick={onRead}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 text-left shadow-soft transition-all hover:-translate-y-1 hover:shadow-card-hover",
        colors.ring,
        colors.bg
      )}
    >
      {/* Featured badge */}
      <Badge className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-pink-500 to-sky-500 px-2 py-0.5 text-[10px] text-white">
        ★ Featured
      </Badge>

      {/* Gradient header bar */}
      <div className={cn("mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r", colors.gradient)} />

      <h3 className="mb-2 text-xl font-bold leading-tight text-foreground sm:text-2xl">
        {article.title}
      </h3>

      <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
        {article.excerpt}
      </p>

      {/* Tags */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {tags.slice(0, 4).map((t) => (
          <span
            key={t}
            className={cn(
              "rounded-md border px-2 py-0.5 text-[11px] font-medium",
              colors.ring,
              colors.text
            )}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between border-t border-sky-500/10 pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {date}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {article.readTime} min read
        </span>
        <span className={cn("flex items-center gap-1 font-semibold", colors.text)}>
          Read
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </motion.button>
  );
}

function ArticleCard({
  article,
  index,
  onRead,
}: {
  article: Article;
  index: number;
  onRead: () => void;
}) {
  const colors = colorMap[article.coverColor] || colorMap.sky;
  const tags = article.tags.split(",").filter(Boolean);
  const date = new Date(article.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.button
      onClick={onRead}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="group flex h-full flex-col rounded-2xl border border-sky-500/15 bg-card p-5 text-left shadow-soft transition-all hover:-translate-y-1 hover:shadow-card-hover"
    >
      {/* Gradient top bar */}
      <div className={cn("mb-3 h-1.5 w-12 rounded-full bg-gradient-to-r", colors.gradient)} />

      <h3 className="mb-2 line-clamp-2 font-bold leading-tight text-foreground">
        {article.title}
      </h3>

      <p className="mb-3 line-clamp-3 flex-1 text-sm text-muted-foreground">
        {article.excerpt}
      </p>

      {/* Tags */}
      <div className="mb-3 flex flex-wrap gap-1">
        {tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between border-t border-sky-500/10 pt-2.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {date}
        </span>
        <span className={cn("flex items-center gap-1 font-semibold", colors.text)}>
          {article.readTime}m
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </motion.button>
  );
}

function ArticleModal({
  slug,
  onClose,
}: {
  slug: string | null;
  onClose: () => void;
}) {
  const [article, setArticle] = useState<FullArticle | null>(null);
  const [loading, setLoading] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  // Attach native scroll listener to the radix viewport (the onScroll prop
  // on ScrollArea doesn't fire on the actual scrollable viewport)
  useEffect(() => {
    if (!article) return;
    const root = scrollAreaRef.current;
    if (!root) return;
    const viewport = root.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
    if (!viewport) return;

    const handleScroll = () => {
      const max = viewport.scrollHeight - viewport.clientHeight;
      if (max > 0) {
        setReadingProgress(Math.min(100, (viewport.scrollTop / max) * 100));
      }
    };
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [article]);

  useEffect(() => {
    if (!slug) {
      return;
    }
    let cancelled = false;
    // Loading state set synchronously to show spinner during async fetch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setReadingProgress(0);
    fetch(`/api/blog/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.article) setArticle(data.article);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const colors = article
    ? colorMap[article.coverColor] || colorMap.sky
    : colorMap.sky;

  return (
    <Dialog open={!!slug} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl border-sky-500/20 p-0">
        {/* Reading progress bar */}
        <div className="absolute inset-x-0 top-0 z-20 h-1 bg-muted/30">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-pink-500 to-wood transition-[width] duration-150 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        {/* Header with gradient */}
        <div className={cn("relative bg-gradient-to-br p-6", colors.bg)}>
          <div className="absolute inset-0 bg-grid opacity-30" />
          <DialogHeader className="relative">
            <div className="mb-3 flex items-center gap-2">
              <span className={cn("flex items-center gap-1 text-xs font-semibold uppercase tracking-wider", colors.text)}>
                <BookOpen className="h-3.5 w-3.5" />
                Article
              </span>
              {article?.featured && (
                <Badge className="rounded-full bg-gradient-to-r from-pink-500 to-sky-500 px-2 py-0.5 text-[10px] text-white">
                  ★ Featured
                </Badge>
              )}
            </div>
            <DialogTitle className="text-2xl font-bold leading-tight sm:text-3xl">
              {article?.title || "Loading..."}
            </DialogTitle>
            {article && (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(article.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {article.readTime} min read
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-base">✍️</span>
                  {developer.name}
                </span>
              </div>
            )}
          </DialogHeader>
        </div>

        <ScrollArea
          ref={scrollAreaRef}
          className="max-h-[60vh]"
          onScroll={(e: React.UIEvent<HTMLDivElement>) => {
            const el = e.currentTarget;
            const max = el.scrollHeight - el.clientHeight;
            if (max > 0) {
              setReadingProgress(Math.min(100, (el.scrollTop / max) * 100));
            }
          }}
        >
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                <p className="text-sm">Loading article...</p>
              </div>
            ) : article ? (
              <>
                {/* Excerpt */}
                <p className="mb-6 border-l-4 border-sky-500/40 bg-sky-500/5 py-2 pl-4 text-base font-medium italic text-foreground/80">
                  {article.excerpt}
                </p>

                {/* Content (markdown) */}
                <article className="prose prose-sm max-w-none dark:prose-invert">
                  <MarkdownRenderer content={article.content} />
                </article>

                {/* Tags */}
                <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-sky-500/10 pt-4">
                  <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <Tag className="h-3.5 w-3.5" />
                    Tags:
                  </span>
                  {article.tags.split(",").filter(Boolean).map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className={cn("rounded-md border", colors.ring, colors.text)}
                    >
                      {t}
                    </Badge>
                  ))}
                </div>

                {/* Author footer */}
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-sky-500/15 bg-gradient-to-r from-sky-500/5 to-pink-500/5 p-4">
                  <img
                    src="/assets/dev-avatar.png"
                    alt={developer.name}
                    className="h-12 w-12 rounded-full border-2 border-white shadow-soft"
                  />
                  <div>
                    <div className="text-sm font-bold">{developer.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {developer.role} · {developer.location}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      onClose();
                      setTimeout(() => {
                        document
                          .querySelector("#contact")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="ml-auto rounded-full bg-gradient-to-r from-sky-500 to-pink-500 text-white"
                  >
                    Hire Me
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm">Article not found.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Lightweight markdown renderer
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const out: React.ReactNode[] = [];
  let inCode = false;
  let codeBuf: string[] = [];

  lines.forEach((line, i) => {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        out.push(
          <pre key={`code-${i}`} className="my-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
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

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const text = renderInline(h[2]);
      if (level === 1)
        out.push(<h1 key={i} className="mb-3 mt-6 text-2xl font-bold text-foreground">{text}</h1>);
      else if (level === 2)
        out.push(<h2 key={i} className="mb-2 mt-5 text-xl font-bold text-foreground">{text}</h2>);
      else if (level === 3)
        out.push(<h3 key={i} className="mb-2 mt-4 text-lg font-semibold text-foreground">{text}</h3>);
      else
        out.push(<h4 key={i} className="mb-1 mt-3 text-base font-semibold text-foreground">{text}</h4>);
      return;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      out.push(
        <li key={i} className="ml-6 list-disc text-sm leading-relaxed text-foreground/80">
          {renderInline(line.replace(/^\s*[-*]\s+/, ""))}
        </li>
      );
      return;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      out.push(
        <li key={i} className="ml-6 list-decimal text-sm leading-relaxed text-foreground/80">
          {renderInline(line.replace(/^\s*\d+\.\s+/, ""))}
        </li>
      );
      return;
    }

    if (/^---+$/.test(line.trim())) {
      out.push(<hr key={i} className="my-4 border-sky-500/20" />);
      return;
    }

    if (line.trim() === "") {
      out.push(<div key={i} className="h-2" />);
      return;
    }

    out.push(
      <p key={i} className="my-2 text-sm leading-relaxed text-foreground/80">
        {renderInline(line)}
      </p>
    );
  });

  if (inCode && codeBuf.length) {
    out.push(
      <pre key="code-final" className="my-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
        <code>{codeBuf.join("\n")}</code>
      </pre>
    );
  }

  return <div className="space-y-1">{out}</div>;
}

function renderInline(text: string): React.ReactNode[] {
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
        <strong key={key++} className="font-bold text-foreground">
          {tok.slice(2, -2)}
        </strong>
      );
    } else if (tok.startsWith("`")) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[0.85em] text-pink-600 dark:text-pink-400"
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
            className="font-medium text-pink-600 underline dark:text-pink-400"
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
