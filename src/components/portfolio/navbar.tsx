"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * VIRIDIA-style floating pill navbar.
 * Left: dark translucent pill with links (active = white pill).
 * Right: dark pill with "Menu" + ".." circular button opening a dropdown.
 */
const MAIN_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Projects", href: "#projects" },
  { label: "Technology", href: "#techstack" },
  { label: "Clients", href: "#testimonials" },
];

const MORE_LINKS = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Skills", href: "#techstack" },
  { label: "Blog", href: "#blog" },
  { label: "Book", href: "#booking" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const ids = [...MAIN_LINKS, ...MORE_LINKS].map((l) => l.href.slice(1));
    const onScroll = () => {
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            setActive(`#${id}`);
            break;
          }
        }
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <nav className="mx-auto flex max-w-7xl items-start justify-between gap-3">
        {/* Left pill: links */}
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/45 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          {MAIN_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => go(link.href)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 sm:px-5",
                active === link.href
                  ? "bg-white text-black shadow"
                  : "text-white/70 hover:text-white"
              )}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right pill: Menu + ".." */}
        <div className="relative">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/45 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <button
              onClick={() => setOpen((o) => !o)}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/85 transition-colors hover:text-white"
            >
              Menu
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="More navigation options"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-bold tracking-widest text-white/85 transition-colors hover:bg-white/15 hover:text-white"
            >
              {open ? <X className="h-4 w-4" /> : <span className="-mt-1">..</span>}
            </button>
          </div>

          {/* Dropdown panel */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0d130d]/95 p-2 shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              >
                {MORE_LINKS.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => go(link.href)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                      active === link.href
                        ? "bg-white/10 text-white"
                        : "text-white/65 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {link.label}
                  </button>
                ))}
                <div className="mt-1 flex items-center justify-between border-t border-white/10 px-4 py-2.5">
                  <span className="text-xs uppercase tracking-widest text-white/40">Theme</span>
                  {mounted && (
                    <button
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      aria-label="Toggle theme"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/15"
                    >
                      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Mobile: compact link row under the pills */}
      <div className="mx-auto mt-2 flex max-w-7xl gap-1 overflow-x-auto pb-1 sm:hidden">
        {MORE_LINKS.slice(0, 5).map((link) => (
          <button
            key={link.href}
            onClick={() => go(link.href)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur-xl transition-colors",
              active === link.href
                ? "border-white/20 bg-white text-black"
                : "border-white/10 bg-black/45 text-white/70"
            )}
          >
            {link.label}
          </button>
        ))}
      </div>
    </header>
  );
}
