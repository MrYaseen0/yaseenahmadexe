"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
import { Editable, useContent } from "@/components/portfolio/content-editor";
import { Reveal, Stagger } from "../reveal";
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

export function Blog() {
  const { t } = useContent();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const fetchArticles = useCallback(async () => {
    const res = await fetch("/api/blog", { cache: "no-store" });
    const data = await res.json();
    return (data.articles || []) as Article[];
  }, []);

  // Initial fetch. All state updates happen after `await`, never
  // synchronously inside the effect. Cancelled on unmount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const articles = await fetchArticles();
        if (!cancelled) setArticles(articles);
      } catch {
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchArticles]);

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
    <section id="blog" className="bg-[#F4F5F1] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading ek="blog" />

        {loading ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-xl border border-[#E6E8E2] bg-white"
              />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="mt-12 text-center text-[#5F665F]">
            <Editable id="blog.empty" />
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
                      "rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all",
                      activeTag === tag
                        ? "border-[#101410] bg-[#101410] text-white"
                        : "border-[#E6E8E2] bg-white text-[#5F665F] hover:border-[#101410] hover:text-[#101410]"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F665F]" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("blog.searchPlaceholder")}
                  className="rounded-full border-[#E6E8E2] bg-white pl-9 pr-4 focus:border-[#101410]"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-[#5F665F] hover:text-[#101410]"
                    aria-label={t("a11y.clearSearch")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Results count when filtering */}
            {isFiltering && (
              <div className="mt-4 text-center font-mono text-xs text-[#5F665F]">
                {t("blog.showingPre")} {filtered.length} {t("blog.showingMid")} {articles.length} {t("blog.showingPost")}
                {activeTag !== "All" && (
                  <>
                    {" "}{t("blog.inWord")} <span className="font-semibold text-[#101410]">{activeTag}</span>
                  </>
                )}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="mt-12 flex flex-col items-center gap-3 py-12 text-center text-[#5F665F]">
                <Search className="h-10 w-10 text-[#5F665F]/40" />
                <p className="text-sm"><Editable id="blog.noMatch" /></p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-[#E6E8E2] bg-white hover:border-[#101410]"
                  onClick={() => {
                    setQuery("");
                    setActiveTag("All");
                  }}
                >
                  <Editable id="blog.clearFilters" />
                </Button>
              </div>
            ) : (
              <>
                {/* Featured articles (hidden when filtering) */}
                {!isFiltering && featured.length > 0 && (
                  <Stagger className="mt-12 grid gap-6 md:grid-cols-2">
                    {featured.map((article) => (
                      <Reveal asChild key={article.id}>
                        <FeaturedArticleCard
                          article={article}
                          onRead={() => setSelectedSlug(article.slug)}
                        />
                      </Reveal>
                    ))}
                  </Stagger>
                )}

                {/* Regular articles */}
                {regular.length > 0 && (
                  <Stagger className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", !isFiltering && featured.length > 0 && "mt-6")}>
                    {regular.map((article) => (
                      <Reveal asChild key={article.id}>
                        <ArticleCard
                          article={article}
                          onRead={() => setSelectedSlug(article.slug)}
                        />
                      </Reveal>
                    ))}
                  </Stagger>
                )}

                {/* RSS / subscribe hint */}
                <div className="mt-10 flex flex-col items-center gap-3 text-center">
                  <p className="text-sm text-[#5F665F]">
                    <Editable id="blog.moreText" />{" "}
                    <button
                      onClick={() =>
                        document
                          .querySelector("#contact")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="font-semibold text-[#101410] underline underline-offset-4 hover:text-[#166534]"
                    >
                      <Editable id="blog.connectBtn" />
                    </button>
                  </p>
                  <a
                    href="/api/blog/rss"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#E6E8E2] bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-[#5F665F] transition-all hover:border-[#101410] hover:text-[#101410]"
                    aria-label={t("a11y.subscribeRss")}
                  >
                    <Rss className="h-3.5 w-3.5" />
                    <Editable id="blog.rssFeed" />
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
        slug={selectedSlug}
        allArticles={articles}
        onClose={() => setSelectedSlug(null)}
        onSelectArticle={(s) => setSelectedSlug(s)}
      />
    </section>
  );
}

function ArticleMeta({ article }: { article: Article }) {
  const { t } = useContent();
  const date = new Date(article.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-[#5F665F]">
      <span className="flex items-center gap-1.5">
        <Calendar className="h-3 w-3" />
        {date}
      </span>
      <span aria-hidden="true" className="text-[#E6E8E2]">·</span>
      <span className="flex items-center gap-1.5">
        <Clock className="h-3 w-3" />
        {article.readTime} {t("blog.minRead")}
      </span>
    </div>
  );
}

function FeaturedArticleCard({
  article,
  onRead,
}: {
  article: Article;
  onRead: () => void;
}) {
  const tags = article.tags.split(",").map((t) => t.trim()).filter(Boolean);
  return (
    <button
      onClick={onRead}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[#E6E8E2] bg-white p-7 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(16,20,16,0.06)] sm:p-8"
    >
      <span className="absolute right-5 top-5 rounded-full bg-[#EAF3EC] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#166534]">
        <Editable id="blog.featuredBadge" />
      </span>

      <h3 className="mb-3 pr-24 font-display text-2xl font-semibold leading-tight tracking-tight text-[#101410] sm:text-3xl">
        {article.title}
      </h3>

      <p className="mb-5 line-clamp-3 flex-1 text-[15px] leading-relaxed text-[#5F665F]">
        {article.excerpt}
      </p>

      {/* Tags */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {tags.slice(0, 4).map((t) => (
          <span
            key={t}
            className="rounded-full border border-[#E6E8E2] bg-white px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#5F665F]"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Meta + read link */}
      <div className="flex items-center justify-between border-t border-[#E6E8E2] pt-4">
        <ArticleMeta article={article} />
        <span className="flex items-center gap-1 text-sm font-medium text-[#101410] underline-offset-4 group-hover:text-[#166534] group-hover:underline">
          <Editable id="blog.readBtn" />
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  );
}

function ArticleCard({
  article,
  onRead,
}: {
  article: Article;
  onRead: () => void;
}) {
  const tags = article.tags.split(",").map((t) => t.trim()).filter(Boolean);
  return (
    <button
      onClick={onRead}
      className="group flex h-full flex-col rounded-xl border border-[#E6E8E2] bg-white p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(16,20,16,0.06)]"
    >
      <h3 className="mb-2 line-clamp-2 font-display text-xl font-semibold leading-tight tracking-tight text-[#101410]">
        {article.title}
      </h3>

      <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-[#5F665F]">
        {article.excerpt}
      </p>

      {/* Tags */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded-full border border-[#E6E8E2] bg-white px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#5F665F]"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Meta + read link */}
      <div className="flex items-center justify-between border-t border-[#E6E8E2] pt-3">
        <ArticleMeta article={article} />
        <span className="flex items-center gap-1 text-sm font-medium text-[#101410] underline-offset-4 group-hover:text-[#166534] group-hover:underline">
          <Editable id="blog.readBtn" />
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </button>
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
  const { t } = useContent();
  const [article, setArticle] = useState<FullArticle | null>(null);
  const [loading, setLoading] = useState(false);
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

  return (
    <Dialog open={!!slug} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden rounded-xl border-[#E6E8E2] bg-white p-0">
        {/* Reading progress bar */}
        <div className="absolute inset-x-0 top-0 z-20 h-1 bg-[#E6E8E2]/60">
          <div
            className="h-full bg-[#101410] transition-[width] duration-150 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        {/* Header */}
        <div className="relative border-b border-[#E6E8E2] bg-white p-6">
          <DialogHeader className="relative">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#5F665F]">
                <BookOpen className="h-3.5 w-3.5" />
                Article
              </span>
              {article?.featured && (
                <Badge className="rounded-full bg-[#EAF3EC] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#166534] hover:bg-[#EAF3EC]">
                  <Editable id="blog.featuredBadge" />
                </Badge>
              )}
            </div>
            <DialogTitle className="font-display text-2xl font-semibold leading-tight tracking-tight text-[#101410] sm:text-3xl">
              {article?.title || t("blog.loadingArticle")}
            </DialogTitle>
            {article && (
              <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-[#5F665F]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(article.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {article.readTime} {t("blog.minRead")}
                </span>
                <span>{t("brand.name")}</span>
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
              <div className="flex flex-col items-center gap-3 py-16 text-[#5F665F]">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm"><Editable id="blog.loadingArticle" /></p>
              </div>
            ) : article ? (
              <>
                {/* Table of contents */}
                <TableOfContents content={article.content} />

                {/* Excerpt */}
                <p className="mb-6 border-l-2 border-[#101410] py-1 pl-4 text-base font-medium italic leading-relaxed text-[#101410]/80">
                  {article.excerpt}
                </p>

                {/* Content (markdown) */}
                <article>
                  <MarkdownRenderer content={article.content} />
                </article>

                {/* Tags */}
                <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-[#E6E8E2] pt-4">
                  <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-[#5F665F]">
                    <Tag className="h-3.5 w-3.5" />
                    <Editable id="blog.tagsWord" />
                  </span>
                  {article.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="rounded-full border border-[#E6E8E2] bg-white px-3 py-0.5 font-mono text-[11px] uppercase tracking-wider text-[#5F665F] hover:bg-white"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>

                {/* Author footer */}
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#E6E8E2] bg-white p-4">
                  <img
                    src="/assets/dev-avatar.png"
                    alt={t("brand.name")}
                    className="h-12 w-12 rounded-full border border-[#E6E8E2]"
                    loading="lazy"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[#101410]">{t("brand.name")}</div>
                    <div className="text-xs text-[#5F665F]">
                      {t("brand.role")} · {t("brand.location")}
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
                    className="ml-auto rounded-full bg-[#101410] px-5 text-white hover:bg-black"
                  >
                    <Editable id="blog.hireBtn" />
                  </Button>
                </div>

                {/* Social sharing */}
                <div className="mt-4 flex items-center gap-2 border-t border-[#E6E8E2] pt-4">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#5F665F]">
                    <Editable id="blog.shareWord" />
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
                    className="flex items-center gap-1.5 rounded-full border border-[#E6E8E2] bg-white px-3 py-1.5 text-xs font-medium text-[#5F665F] transition-all hover:border-[#101410] hover:text-[#101410]"
                  >
                    {shareCopied ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#166534]" />
                        {t("blog.copied")}
                      </>
                    ) : (
                      <>
                        <Link2 className="h-3.5 w-3.5" />
                        {t("blog.copyLink")}
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
                    <div className="mt-6 border-t border-[#E6E8E2] pt-5">
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#101410]">
                        <BookOpen className="h-4 w-4" />
                        <Editable id="blog.relatedWord" />
                      </h4>
                      <div className="space-y-2">
                        {related.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => {
                              onSelectArticle(r.slug);
                              setReadingProgress(0);
                            }}
                            className="group flex w-full items-center gap-3 rounded-xl border border-[#E6E8E2] bg-white p-3 text-left transition-all hover:border-[#101410]"
                          >
                            <div className="h-10 w-1 shrink-0 rounded-full bg-[#101410]" />
                            <div className="min-w-0 flex-1">
                              <div className="line-clamp-1 text-sm font-semibold text-[#101410]">
                                {r.title}
                              </div>
                              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#5F665F]">
                                <Clock className="h-3 w-3" />
                                {r.readTime} {t("blog.minRead")}
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-[#5F665F] transition-transform group-hover:translate-x-1 group-hover:text-[#101410]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-16 text-[#5F665F]">
                <BookOpen className="h-8 w-8 text-[#5F665F]/50" />
                <p className="text-sm"><Editable id="blog.notFound" /></p>
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
      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E6E8E2] bg-white text-[#5F665F] transition-all hover:border-[#101410] hover:text-[#101410]"
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
    <div className="mb-6 overflow-hidden rounded-xl border border-[#E6E8E2] bg-white">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[#101410]">
          <List className="h-4 w-4" />
          <Editable id="blog.tocTitle" />
          <Badge variant="secondary" className="rounded-full border border-[#E6E8E2] bg-[#F4F5F1] px-1.5 py-0 font-mono text-[10px] text-[#5F665F] hover:bg-[#F4F5F1]">
            {headings.length}
          </Badge>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[#5F665F] transition-transform",
            !collapsed && "rotate-180"
          )}
        />
      </button>
      {!collapsed && (
        <nav className="border-t border-[#E6E8E2] px-4 py-3">
          <ul className="space-y-1">
            {headings.map((h, i) => (
              <li
                key={i}
                className={cn(h.level === 3 && "ml-4")}
              >
                <button
                  onClick={() => handleClick(h.slug)}
                  className="flex items-center gap-2 text-left text-xs text-[#5F665F] transition-colors hover:text-[#101410]"
                >
                  <span className="text-[#5F665F]/50">
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
          <pre key={`code-${i}`} className="my-4 overflow-x-auto rounded-lg bg-[#101410] p-4 text-sm text-[#FBFBF9]">
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
      const headingText = h[2];
      const text = renderInline(headingText);
      const slug = headingText
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      if (level === 1)
        out.push(<h1 key={i} id={slug} className="mb-3 mt-6 scroll-mt-4 font-display text-2xl font-semibold tracking-tight text-[#101410]">{text}</h1>);
      else if (level === 2)
        out.push(<h2 key={i} id={slug} className="mb-2 mt-5 scroll-mt-4 font-display text-xl font-semibold tracking-tight text-[#101410]">{text}</h2>);
      else if (level === 3)
        out.push(<h3 key={i} id={slug} className="mb-2 mt-4 scroll-mt-4 font-display text-lg font-semibold tracking-tight text-[#101410]">{text}</h3>);
      else
        out.push(<h4 key={i} id={slug} className="mb-1 mt-3 scroll-mt-4 text-base font-semibold text-[#101410]">{text}</h4>);
      return;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      out.push(
        <li key={i} className="ml-6 list-disc text-sm leading-relaxed text-[#101410]/80">
          {renderInline(line.replace(/^\s*[-*]\s+/, ""))}
        </li>
      );
      return;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      out.push(
        <li key={i} className="ml-6 list-decimal text-sm leading-relaxed text-[#101410]/80">
          {renderInline(line.replace(/^\s*\d+\.\s+/, ""))}
        </li>
      );
      return;
    }

    if (/^---+$/.test(line.trim())) {
      out.push(<hr key={i} className="my-4 border-[#E6E8E2]" />);
      return;
    }

    if (line.trim() === "") {
      out.push(<div key={i} className="h-2" />);
      return;
    }

    out.push(
      <p key={i} className="my-2 text-sm leading-relaxed text-[#101410]/80">
        {renderInline(line)}
      </p>
    );
  });

  if (inCode && codeBuf.length) {
    out.push(
      <pre key="code-final" className="my-4 overflow-x-auto rounded-lg bg-[#101410] p-4 text-sm text-[#FBFBF9]">
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
        <strong key={key++} className="font-bold text-[#101410]">
          {tok.slice(2, -2)}
        </strong>
      );
    } else if (tok.startsWith("`")) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-[#F4F5F1] px-1.5 py-0.5 text-[0.85em] text-[#166534]"
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
            className="font-medium text-[#166534] underline"
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
