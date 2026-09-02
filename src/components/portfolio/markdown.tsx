"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

/**
 * Shared, safe markdown renderer for user/blog/README content.
 *
 * - react-markdown (well-tested) replaces the two hand-rolled renderers.
 * - `urlTransform` blocks javascript:/data:/vbscript: links by rewriting
 *   them to "#" and only http(s), mailto, # anchors are allowed through.
 * - External links open in a new tab with noopener noreferrer.
 * - Class mapping keeps the portfolio's existing typography.
 */

const ALLOWED_HOST_PROTOCOLS = /^(https?:|mailto:|#)/i;

export function safeHref(url: string): string {
  const u = (url || "").trim();
  if (ALLOWED_HOST_PROTOCOLS.test(u)) return u;
  return "#";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function textOf(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(textOf).join("");
  if (children && typeof children === "object" && "props" in children) {
    const node = children as { props?: { children?: React.ReactNode } };
    return node.props?.children ? textOf(node.props.children) : "";
  }
  return "";
}

export function Markdown({
  content,
  className,
  prose = false,
}: {
  content: string;
  className?: string;
  /** Add reader-friendly styling for long-form articles. */
  prose?: boolean;
}) {
  return (
    <div className={cn("text-foreground/85", prose && "space-y-1", className)}>
      <ReactMarkdown
        urlTransform={(url) => safeHref(url)}
        components={{
          a: ({ href, children, ...props }) => {
            const h = safeHref(href || "");
            const external = /^https?:/i.test(h);
            return (
              <a
                href={h}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="font-medium text-pink-600 underline decoration-pink-500/40 underline-offset-2 hover:text-sky-600 dark:text-pink-400"
                {...props}
              >
                {children}
              </a>
            );
          },
          h1: ({ children }) => (
            <h1
              id={slugify(textOf(children))}
              className="mb-3 mt-6 scroll-mt-4 text-2xl font-bold text-foreground"
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              id={slugify(textOf(children))}
              className="mb-2 mt-5 scroll-mt-4 text-xl font-bold text-foreground"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              id={slugify(textOf(children))}
              className="mb-2 mt-4 scroll-mt-4 text-lg font-semibold text-foreground"
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-1 mt-3 scroll-mt-4 text-base font-semibold text-foreground">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-2 text-sm leading-relaxed text-foreground/80">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-2 ml-6 list-disc space-y-1 text-sm text-foreground/80">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 ml-6 list-decimal space-y-1 text-sm text-foreground/80">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-4 border-sky-500/40 bg-sky-500/5 py-2 pl-4 text-sm italic text-foreground/70">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-sky-500/20" />,
          code: ({ className, children, ...props }) => {
            // react-markdown v10 removed the `inline` flag; fenced/indented
            // code blocks carry a language-* class or contain newlines.
            const isBlock =
              /language-/.test(className || "") ||
              (typeof children === "string" && children.includes("\n"));
            return isBlock ? (
              <code
                className="block overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code
                className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[0.85em] text-pink-600 dark:text-pink-400"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="my-4">{children}</pre>,
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-sky-500/20">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-sky-500/20 bg-sky-500/5 px-3 py-2 text-left font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-sky-500/10 px-3 py-2 text-foreground/80">
              {children}
            </td>
          ),
          img: ({ src, alt }) => (
            <img
              src={src || ""}
              alt={alt || ""}
              className="my-4 max-h-96 w-full rounded-xl object-contain"
              loading="lazy"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
