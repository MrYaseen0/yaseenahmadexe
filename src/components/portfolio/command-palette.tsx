"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Hash,
  Briefcase,
  FileText,
  Code2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { developer, navLinks, services, featuredProjects } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  iconColor: string;
  action: () => void;
  keywords: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Global keyboard shortcut: Ctrl+K / Cmd+K to open, "/" when not typing
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !isTypingTarget(e.target)) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Reset state when opening/closing
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Build the command list
  const allCommands = useMemo<CommandItem[]>(() => {
    const scrollTo = (href: string) => () => {
      setOpen(false);
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    };

    const commands: CommandItem[] = [];

    // Navigation sections
    navLinks.forEach((link) => {
      commands.push({
        id: `nav-${link.href}`,
        label: link.label,
        hint: "Section",
        icon: Hash,
        iconColor: "text-sky-500",
        action: scrollTo(link.href),
        keywords: `navigation section ${link.label.toLowerCase()} go to`,
      });
    });

    // Services
    services.forEach((s) => {
      commands.push({
        id: `service-${s.title}`,
        label: s.title,
        hint: "Service",
        icon: Sparkles,
        iconColor: "text-pink-500",
        action: scrollTo("#services"),
        keywords: `service ${s.title.toLowerCase()} ${s.tags.join(" ").toLowerCase()}`,
      });
    });

    // Featured projects
    featuredProjects.forEach((p) => {
      commands.push({
        id: `project-${p.title}`,
        label: p.title,
        hint: "Project",
        icon: Briefcase,
        iconColor: "text-wood",
        action: scrollTo("#projects"),
        keywords: `project ${p.title.toLowerCase()} ${p.tags.join(" ").toLowerCase()}`,
      });
    });

    // Quick actions
    commands.push({
      id: "action-hire",
      label: "Hire Me",
      hint: "Action",
      icon: Sparkles,
      iconColor: "text-pink-500",
      action: scrollTo("#contact"),
      keywords: "hire contact work freelance",
    });
    commands.push({
      id: "action-resume",
      label: "Download Resume",
      hint: "Action",
      icon: FileText,
      iconColor: "text-wood",
      action: () => {
        setOpen(false);
        setTimeout(() => window.open("/api/resume", "_blank"), 100);
      },
      keywords: "resume cv download pdf",
    });
    commands.push({
      id: "action-github",
      label: "Visit GitHub Profile",
      hint: "External",
      icon: Code2,
      iconColor: "text-sky-500",
      action: () => {
        setOpen(false);
        setTimeout(() => window.open(`https://github.com/${developer.githubUsername}`, "_blank"), 100);
      },
      keywords: "github code repositories source",
    });

    return commands;
  }, []);

  // Filter commands by query
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allCommands;
    return allCommands.filter((c) =>
      c.label.toLowerCase().includes(q) || c.keywords.includes(q) || c.hint?.toLowerCase().includes(q)
    );
  }, [allCommands, query]);

  // Reset active index when filtered list changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keyboard navigation within the palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) item.action();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <>
      {/* Trigger button (hidden, but available for click) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-40 hidden items-center gap-2 rounded-full border border-sky-500/30 bg-card/80 px-3 py-2 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur transition-all hover:border-pink-500/40 hover:text-foreground lg:flex"
        aria-label="Open command palette"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Quick search</span>
        <kbd className="rounded border border-sky-500/30 bg-muted px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl overflow-hidden rounded-2xl border-sky-500/20 bg-card/95 p-0 shadow-card-hover backdrop-blur-xl">
          <DialogTitle className="sr-only">Command Palette — Quick Search</DialogTitle>
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-sky-500/15 px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search sections, projects, services, or actions..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <kbd className="hidden rounded border border-sky-500/30 bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:block">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                <Search className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm">No results for &ldquo;{query}&rdquo;</p>
                <p className="text-xs">Try searching for sections, projects, or services</p>
              </div>
            ) : (
              <>
                {/* Group by hint */}
                {(() => {
                  const groups: Record<string, CommandItem[]> = {};
                  filtered.forEach((item) => {
                    const key = item.hint || "Other";
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(item);
                  });
                  let runningIndex = 0;
                  return Object.entries(groups).map(([groupName, items]) => (
                    <div key={groupName} className="mb-2">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {groupName}
                      </div>
                      {items.map((item) => {
                        const idx = runningIndex++;
                        const isActive = idx === activeIndex;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            data-index={idx}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={item.action}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                              isActive
                                ? "bg-gradient-to-r from-sky-500/10 to-pink-500/10"
                                : "hover:bg-muted/50"
                            )}
                          >
                            <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sky-500/15 bg-card", item.iconColor)}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block truncate text-sm font-medium text-foreground">
                                {item.label}
                              </span>
                            </span>
                            {isActive && (
                              <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ));
                })()}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-sky-500/15 px-4 py-2.5 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-sky-500/30 bg-muted px-1 py-0.5 font-mono">
                  <ArrowUp className="inline h-2.5 w-2.5" />
                  <ArrowDown className="inline h-2.5 w-2.5" />
                </kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-sky-500/30 bg-muted px-1 py-0.5 font-mono">
                  <CornerDownLeft className="inline h-2.5 w-2.5" />
                </kbd>
                select
              </span>
            </div>
            <span className="hidden sm:block">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}
