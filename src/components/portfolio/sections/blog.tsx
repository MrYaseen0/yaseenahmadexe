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
  CheckCircle2,
  Link2,
  Rss,
  ExternalLink,
  List,
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
import { Markdown } from "@/components/portfolio/markdown";
import { TiltCard } from "../tilt-card";
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

  useEffect(() => {
    let cancelled = false;
    fetch("/api/blog", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setArticles([]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
                <div className="mt-10 flex flex-col items-center gap-3 text-center">
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
                  <a
                    href="/api/blog/rss"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/5 px-4 py-2 text-xs font-medium text-amber-600 transition-all hover:border-amber-500/50 hover:bg-amber-500/10 dark:text-amber-400"
                    aria-label="Subscribe to RSS feed"
                  >
                    <Rss className="h-3.5 w-3.5" />
                    RSS Feed
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Article detail modal */}
      <ArticleModal
        key={selectedSlug ?? "closed"}
        slug={selectedSlug}
        allArticles={articles}
        onClose={() => setSelectedSlug(null)}
        onSelectArticle={(s) => setSelectedSlug(s)}
      />
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
    <TiltCard max={7} scale={1.02}>
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
    </TiltCard>
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
    <TiltCard max={9} scale={1.03} className="h-full">
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
    </TiltCard>
  );
}

function ArticleModal({
  slug,
  allArticles,
  onClose,
  onSelectArticle,
}: {
  slug: string | null;
  allArticles: Article[];
  onClose: () => void;
  onSelectArticle: (slug: string) => void;
}) {
  const [article, setArticle] = useState<FullArticle | null>(null);
  // Starts true: the modal is only mounted when a slug is selected, so the
  // spinner is correct for the initial fetch without setState-in-effect.
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);
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
    // No synchronous setState here; the loading state starts true when the
    // article modal opens (remounted per slug via key) and flips false when
    // the fetch settles.
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
                {/* Table of contents */}
                <TableOfContents content={article.content} />

                {/* Excerpt */}
                <p className="mb-6 border-l-4 border-sky-500/40 bg-sky-500/5 py-2 pl-4 text-base font-medium italic text-foreground/80">
                  {article.excerpt}
                </p>

                {/* Content (markdown) */}
                <article className="prose prose-sm max-w-none dark:prose-invert">
                  <Markdown content={article.content} prose />
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

                {/* Social sharing */}
                <div className="mt-4 flex items-center gap-2 border-t border-sky-500/10 pt-4">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Share:
                  </span>
                  <ShareButton
                    label="Twitter"
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      article.title
                    )}&via=yaseenahmadexe`}
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </ShareButton>
                  <ShareButton
                    label="LinkedIn"
                    href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      `https://yaseenahmadexe.vercel.app/#blog`
                    )}`}
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
                  </ShareButton>
                  <ShareButton
                    label="Facebook"
                    href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      `https://yaseenahmadexe.vercel.app/#blog`
                    )}`}
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </ShareButton>
                  <button
                    onClick={() => {
                      const url = `https://yaseenahmadexe.vercel.app/#blog`;
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(url);
                        setShareCopied(true);
                        setTimeout(() => setShareCopied(false), 2000);
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-pink-500/40 hover:bg-sky-500/10 hover:text-sky-600"
                  >
                    {shareCopied ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Link2 className="h-3.5 w-3.5" />
                        Copy link
                      </>
                    )}
                  </button>
                </div>

                {/* Related articles */}
                {(() => {
                  const articleTags = article.tags.split(",").map((t) => t.trim());
                  const related = allArticles
                    .filter(
                      (a) =>
                        a.slug !== article.slug &&
                        a.tags.split(",").map((t) => t.trim()).some((t) => articleTags.includes(t))
                    )
                    .slice(0, 3);
                  if (related.length === 0) return null;
                  return (
                    <div className="mt-6 border-t border-sky-500/10 pt-5">
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                        <BookOpen className="h-4 w-4 text-sky-500" />
                        Related Articles
                      </h4>
                      <div className="space-y-2">
                        {related.map((r) => {
                          const relColors = colorMap[r.coverColor] || colorMap.sky;
                          return (
                            <button
                              key={r.id}
                              onClick={() => {
                                onSelectArticle(r.slug);
                                setReadingProgress(0);
                              }}
                              className="group flex w-full items-center gap-3 rounded-xl border border-sky-500/15 bg-card p-3 text-left transition-all hover:border-pink-500/30 hover:shadow-soft"
                            >
                              <div className={cn("h-10 w-1.5 shrink-0 rounded-full bg-gradient-to-b", relColors.gradient)} />
                              <div className="min-w-0 flex-1">
                                <div className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-sky-600">
                                  {r.title}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {r.readTime} min read
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-sky-500" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
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

// Social share button helper
function ShareButton({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Share on ${label}`}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-sky-500/30 bg-card text-muted-foreground transition-all hover:border-pink-500/40 hover:bg-sky-500/10 hover:text-sky-600"
    >
      {children}
    </a>
  );
}

// Table of contents — extracts H2/H3 headings from markdown
function TableOfContents({ content }: { content: string }) {
  const [collapsed, setCollapsed] = useState(true);
  const headings = useMemo(() => {
    const lines = content.split("\n");
    const result: { level: number; text: string; slug: string }[] = [];
    lines.forEach((line) => {
      const m = line.match(/^(#{2,3})\s+(.*)$/);
      if (m) {
        const level = m[1].length;
        const text = m[2];
        const slug = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-");
        result.push({ level, text, slug });
      }
    });
    return result;
  }, [content]);

  if (headings.length < 3) return null;

  const handleClick = (slug: string) => {
    const viewport = document.querySelector("[data-radix-scroll-area-viewport]");
    const el = document.getElementById(slug);
    if (el && viewport) {
      const top = el.offsetTop - 20;
      viewport.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-sky-500/20 bg-gradient-to-br from-sky-500/5 to-pink-500/5">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-foreground">
          <List className="h-4 w-4 text-sky-500" />
          Table of Contents
          <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px]">
            {headings.length}
          </Badge>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            !collapsed && "rotate-180"
          )}
        />
      </button>
      {!collapsed && (
        <nav className="border-t border-sky-500/10 px-4 py-3">
          <ul className="space-y-1">
            {headings.map((h, i) => (
              <li
                key={i}
                className={cn(h.level === 3 && "ml-4")}
              >
                <button
                  onClick={() => handleClick(h.slug)}
                  className="flex items-center gap-2 text-left text-xs text-muted-foreground transition-colors hover:text-sky-600 dark:hover:text-sky-400"
                >
                  <span className="text-sky-500/50">
                    {h.level === 2 ? "▸" : "•"}
                  </span>
                  <span className="line-clamp-1">{h.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
