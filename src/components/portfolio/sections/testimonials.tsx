"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { SectionHeading } from "../section-heading";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Startup Founder",
    company: "TechFlow Inc.",
    avatar: "SJ",
    rating: 5,
    text: "Yaseen delivered our SaaS dashboard ahead of schedule. His attention to detail and clean code made maintenance a breeze. Highly recommended!",
    color: "from-sky-400 to-blue-500",
  },
  {
    name: "Ahmed Hassan",
    role: "Product Manager",
    company: "Innovate Labs",
    avatar: "AH",
    rating: 5,
    text: "Excellent communication and technical skills. Yaseen transformed our requirements into a polished product. Will definitely work with him again.",
    color: "from-pink-400 to-rose-500",
  },
  {
    name: "Emily Chen",
    role: "CTO",
    company: "CloudScale",
    avatar: "EC",
    rating: 5,
    text: "Working with Yaseen was a pleasure. He understands modern architecture deeply and writes production-ready code. True professional.",
    color: "from-amber-500 to-orange-600",
  },
  {
    name: "Marcus Williams",
    role: "Entrepreneur",
    company: "BuildRight",
    avatar: "MW",
    rating: 5,
    text: "From concept to deployment, Yaseen handled everything flawlessly. Our e-commerce platform is fast, scalable, and beautiful.",
    color: "from-sky-400 to-cyan-500",
  },
  {
    name: "Fatima Khan",
    role: "Marketing Director",
    company: "GrowthHub",
    avatar: "FK",
    rating: 5,
    text: "The AI content tool Yaseen built saved us countless hours. Brilliant execution and ongoing support. Couldn't be happier!",
    color: "from-pink-400 to-fuchsia-500",
  },
  {
    name: "David Park",
    role: "Lead Developer",
    company: "DevStudio",
    avatar: "DP",
    rating: 5,
    text: "I've worked with many developers — Yaseen stands out. Clean code, thoughtful architecture, and a great collaborator.",
    color: "from-amber-600 to-red-600",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          emoji="💬"
          title="What Clients"
          highlight="Say"
          subtitle="Feedback from clients and collaborators who trusted me with their projects."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="animate-fade-in-up group relative overflow-hidden rounded-2xl border border-sky-500/15 bg-card p-6 shadow-soft transition-all hover:-translate-y-1.5 hover:shadow-card-hover"
              style={{ animationDelay: `${(i % 3) * 0.1}s` }}
            >
              <Quote className="absolute right-4 top-4 h-10 w-10 text-sky-500/10 transition-colors group-hover:text-pink-500/20" />

              <div className="mb-3 flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <p className="relative mb-5 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 border-t border-sky-500/10 pt-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white shadow-soft`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.role} · {t.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats summary */}
        <div className="animate-fade-in-up mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { v: "30+", l: "Happy Clients" },
            { v: "50+", l: "Projects Delivered" },
            { v: "5.0", l: "Average Rating" },
            { v: "98%", l: "Repeat Hire Rate" },
          ].map((s) => (
            <div
              key={s.l}
              className="glass rounded-2xl p-5 text-center shadow-soft"
            >
              <div className="text-2xl font-bold text-gradient-sky-pink sm:text-3xl">
                {s.v}
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
