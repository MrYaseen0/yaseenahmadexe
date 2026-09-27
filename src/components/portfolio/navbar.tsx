"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, MessageCircle, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Editable, useContent } from "@/components/portfolio/content-editor";

export function Navbar() {
  const { t, tj } = useContent();
  const navLinks = tj<{ label: string; href: string }[]>("nav.links");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");
  // Logo: serve the tiny static PNG by default; swap in the 1.8MB animated
  // GIF only while hovered (desktop). Mobile never triggers hover, so the
  // GIF is never downloaded on phones — big LCP/bytes win.
  const [logoHover, setLogoHover] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // next-themes requires a mounted flag to avoid hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      // active section detection
      const sections = navLinks.map((l) => l.href.slice(1));
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
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
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={cn(
        "animate-fade-in fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "glass border-b border-sky-500/10 shadow-soft py-2"
          : "bg-transparent py-4"
      )}
    >
      <nav className="container mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <button
          onClick={() => go("#home")}
          className="group flex items-center gap-3"
          aria-label={t("a11y.goTop")}
          onMouseEnter={() => setLogoHover(true)}
          onMouseLeave={() => setLogoHover(false)}
        >
          <div className="relative h-11 w-11 overflow-hidden rounded-xl ring-2 ring-sky-500/30 transition-all group-hover:ring-pink-500/50 group-hover:shadow-glow-sky">
            <img
              src={logoHover ? "/assets/logo-animated.gif" : "/assets/logo.png"}
              alt={`${t("brand.name")} logo`}
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
          <div className="hidden flex-col items-start leading-none sm:flex">
            <span className="text-base font-bold tracking-tight">
              <Editable id="brand.firstName" />
              <span className="text-gradient-sky-pink">.</span>
            </span>
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              <Editable id="nav.brandTag" />
            </span>
          </div>
        </button>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => go(link.href)}
              className={cn(
                "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                active === link.href
                  ? "text-sky-600 dark:text-sky-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
              {active === link.href && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-sky-500/10 to-pink-500/10 ring-1 ring-sky-500/20"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="hidden rounded-full lg:inline-flex"
            aria-label={t("palette.openAria")}
            title={t("palette.quickSearch")}
          >
            <Search className="h-4 w-4" />
          </Button>
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
              aria-label={t("a11y.toggleTheme")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}
          <Button
            onClick={() => go("#contact")}
            className="hidden rounded-full bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-soft hover:shadow-glow-pink sm:inline-flex"
            size="sm"
          >
            <MessageCircle className="mr-1.5 h-4 w-4" />
            <Editable id="nav.hire" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-full"
            onClick={() => setOpen((o) => !o)}
            aria-label={t("a11y.menu")}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden"
          >
            <div className="container mx-auto max-w-7xl px-4 pb-4 pt-2">
              <div className="glass rounded-2xl p-3 shadow-soft">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => go(link.href)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      active === link.href
                        ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {link.label}
                  </button>
                ))}
                <Button
                  onClick={() => go("#contact")}
                  className="mt-2 w-full rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 text-white"
                >
                  <Editable id="nav.hire" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
