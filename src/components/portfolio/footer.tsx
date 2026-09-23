"use client";

import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  Twitter,
  Facebook,
  Mail,
  Heart,
  ArrowUp,
  MapPin,
} from "lucide-react";
import { Editable, useContent } from "@/components/portfolio/content-editor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export function Footer() {
  const { t, tj } = useContent();
  const socials = tj<Record<string, string>>("socials.links");
  const quickLinks = tj<{ label: string; href: string }[]>("footer.quickLinks");
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(t("footer.subscribed"), {
        description: t("footer.subscribedSub"),
      });
      setEmail("");
    } catch (err: any) {
      toast.error(t("footer.subscribedFail"), { description: err?.message || t("footer.subscribedFailSub") });
    } finally {
      setSubscribing(false);
    }
  };

  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative mt-auto border-t border-sky-500/15 bg-gradient-to-br from-sky-50/80 via-white to-pink-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-rose-950/40">
      {/* Top wave decoration */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

      <div className="container mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-xl ring-2 ring-sky-500/30">
                <img
                  src="/assets/logo.png"
                  alt={`${t("brand.name")} logo`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="text-lg font-bold">
                  <Editable id="brand.firstName" />
                  <span className="text-gradient-sky-pink">.</span>
                </div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  <Editable id="footer.brandTag" />
                </div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              <Editable id="footer.tagline" />
            </p>

            {/* Newsletter */}
            <form onSubmit={subscribe} className="mt-5 flex max-w-sm gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("footer.newsPlaceholder")}
                className="rounded-full"
              />
              <Button
                type="submit"
                disabled={subscribing}
                size="sm"
                className="shrink-0 rounded-full bg-gradient-to-r from-sky-500 to-pink-500 text-white"
              >
                <Editable id="footer.newsButton" />
              </Button>
            </form>
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <Editable
              id="footer.linksTitle"
              as="h4"
              className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground"
            />
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-muted-foreground transition-colors hover:text-sky-600"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <Editable
              id="footer.contactTitle"
              as="h4"
              className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground"
            />
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" />
                <a
                  href={socials.email}
                  className="break-all hover:text-sky-600"
                >
                  <Editable id="brand.email" />
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" />
                <Editable id="brand.location" as="span" />
              </li>
            </ul>
          </motion.div>

          {/* Connect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Editable
              id="footer.connectTitle"
              as="h4"
              className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground"
            />
            <div className="flex flex-wrap gap-2">
              <SocialIcon href={socials.github} label="GitHub">
                <Github className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href={socials.linkedin} label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href={socials.twitter} label="Twitter">
                <Twitter className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href={socials.facebook} label="Facebook">
                <Facebook className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href={socials.email} label="Email">
                <Mail className="h-4 w-4" />
              </SocialIcon>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-sky-500/10 pt-6 sm:flex-row">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            © {new Date().getFullYear()} <Editable id="brand.name" />. Built with
            <Heart className="h-3 w-3 fill-pink-500 text-pink-500" />
            <Editable id="footer.copyrightB" />
          </p>
          <Button
            onClick={scrollTop}
            variant="outline"
            size="sm"
            className="rounded-full border-sky-500/30 hover:bg-sky-500/5"
          >
            <ArrowUp className="mr-1.5 h-4 w-4" />
            <Editable id="footer.backToTop" />
          </Button>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-500/20 bg-card text-muted-foreground transition-all hover:border-pink-500/40 hover:bg-gradient-to-br hover:from-sky-500 hover:to-pink-500 hover:text-white"
    >
      {children}
    </a>
  );
}
