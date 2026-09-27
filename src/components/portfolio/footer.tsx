"use client";

import {
  Github,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  ArrowRight,
} from "lucide-react";
import { socials } from "@/lib/portfolio-data";
import { Reveal } from "./reveal";

const sitemap = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Services", href: "#services" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-[#101410] text-white">
      {/* CTA band */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 sm:py-16 md:flex-row md:items-center">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
              Get in touch
            </p>
            <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Have an idea? Let&apos;s build it.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-[#101410] transition-colors hover:bg-white/90"
            >
              Start a project
              <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
        </div>
      </div>

      {/* Main columns */}
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-12">
        {/* Brand */}
        <div className="md:col-span-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 overflow-hidden rounded-lg">
              <img
                src="/assets/logo.png"
                alt="Yaseen Ahmad logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="font-display text-lg font-semibold tracking-tight">
                Yaseen Ahmad
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
                Full-Stack Developer
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            I build fast, modern web apps — from landing pages to full SaaS
            products.
          </p>
        </div>

        {/* Sitemap */}
        <div className="md:col-span-3">
          <h4 className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
            Sitemap
          </h4>
          <ul className="space-y-2.5 text-sm">
            {sitemap.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-white/70 transition-colors hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Socials */}
        <div className="md:col-span-2">
          <h4 className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
            Socials
          </h4>
          <div className="flex flex-wrap gap-2">
            <SocialIcon href={socials.github} label="GitHub">
              <Github className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href={socials.linkedin} label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href={socials.twitter} label="X / Twitter">
              <XIcon className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href={socials.instagram} label="Instagram">
              <Instagram className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href={socials.tiktok} label="TikTok">
              <TikTokIcon className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href={socials.email} label="Email">
              <Mail className="h-4 w-4" />
            </SocialIcon>
          </div>
        </div>

        {/* Contact */}
        <div className="md:col-span-3">
          <h4 className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
            Contact
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
              <a
                href={socials.email}
                className="break-all text-white/70 transition-colors hover:text-white"
              >
                yaseenahmad.exe@gmail.com
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
              <a
                href={socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 transition-colors hover:text-white"
              >
                WhatsApp
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
              <span className="text-white/70">Peshawar, Pakistan</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Giant wordmark */}
      <div className="overflow-hidden" aria-hidden="true">
        <div className="select-none whitespace-nowrap text-center font-display text-[19vw] font-semibold leading-[0.85] tracking-tight text-white/10">
          YASEEN
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-6 sm:flex-row sm:px-8">
          <p className="text-xs text-white/50">
            © 2026 Yaseen Ahmad. All rights reserved.
          </p>
          <button
            onClick={scrollTop}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/70 transition-all hover:border-white/40 hover:text-white"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            Back to top
          </button>
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
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white/60 transition-all hover:border-white/40 hover:text-white"
    >
      {children}
    </a>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}
