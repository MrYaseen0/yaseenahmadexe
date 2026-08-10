"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  MessageCircle,
  Briefcase,
  User,
  DollarSign,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { SectionHeading } from "../section-heading";
import { developer, socials } from "@/lib/portfolio-data";

export function Contact() {
  return (
    <section id="contact" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          emoji="💬"
          title="Let's Work"
          highlight="Together"
          subtitle="Have a project in mind? Let's discuss how I can help bring your ideas to life."
        />

        <div className="mt-14 grid gap-6 md:gap-8 lg:grid-cols-5">
          {/* Contact info */}
          <div className="animate-slide-in-left lg:col-span-2">
            <div className="glass rounded-3xl border border-sky-500/15 p-6 shadow-soft sm:p-8">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-bold">Get in Touch</h3>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-[11px] font-semibold text-green-600 dark:text-green-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  Avg. reply: 2-4 hrs
                </span>
              </div>
              <p className="mb-6 text-sm text-muted-foreground">
                I usually respond within a few hours. For urgent matters, use
                WhatsApp for instant communication.
              </p>

              <div className="space-y-4">
                <ContactItem
                  icon={<Mail className="h-5 w-5" />}
                  label="Email"
                  value={developer.email}
                  href={socials.email}
                  color="sky"
                />
                <ContactItem
                  icon={<Phone className="h-5 w-5" />}
                  label="Phone / WhatsApp"
                  value={developer.phone}
                  href={socials.whatsapp}
                  color="pink"
                />
                <ContactItem
                  icon={<MapPin className="h-5 w-5" />}
                  label="Location"
                  value={developer.location}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    developer.location
                  )}`}
                  color="wood"
                />
              </div>

              <div className="mt-6 border-t border-sky-500/10 pt-6">
                <p className="mb-3 text-sm font-semibold">Follow Me</p>
                <div className="flex flex-wrap gap-2">
                  <SocialButton href={socials.github} label="GitHub" />
                  <SocialButton href={socials.linkedin} label="LinkedIn" />
                  <SocialButton href={socials.twitter} label="X / Twitter" />
                  <SocialButton href={socials.facebook} label="Facebook" />
                </div>
              </div>

              <a
                href={socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-soft transition-all hover:shadow-glow-sky"
              >
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Forms */}
          <div className="animate-slide-in-right lg:col-span-3">
            <div className="rounded-3xl border border-sky-500/15 bg-card p-6 shadow-card-hover sm:p-8">
              <Tabs defaultValue="hire" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-full bg-muted p-1">
                  <TabsTrigger
                    value="hire"
                    className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                  >
                    <Briefcase className="mr-1.5 h-4 w-4" />
                    Hire Me
                  </TabsTrigger>
                  <TabsTrigger
                    value="message"
                    className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                  >
                    <Mail className="mr-1.5 h-4 w-4" />
                    Send a Message
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="hire" className="mt-6">
                  <HireForm />
                </TabsContent>
                <TabsContent value="message" className="mt-6">
                  <MessageForm />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  color: "sky" | "pink" | "wood";
}) {
  const colors = {
    sky: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    pink: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    wood: "bg-wood/10 text-wood border-wood/20",
  };
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-2xl border border-transparent p-3 transition-all hover:border-sky-500/15 hover:bg-muted/40"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${colors[color]}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-sm font-medium text-foreground group-hover:text-sky-600">
          {value}
        </div>
      </div>
    </a>
  );
}

function SocialButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full border border-sky-500/20 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-pink-500/40 hover:bg-sky-500/10 hover:text-sky-600"
    >
      {label}
    </a>
  );
}

function HireForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    projectType: "",
    budget: "",
    timeline: "",
    description: "",
  });

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.projectType || !form.description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("🎉 Request submitted!", {
        description:
          "Thanks for reaching out. I'll review your project and respond within 24 hours.",
      });
      setForm({
        name: "",
        email: "",
        company: "",
        projectType: "",
        budget: "",
        timeline: "",
        description: "",
      });
    } catch (err: any) {
      toast.error("Something went wrong", {
        description: err?.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required>
          <Input
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder="Your Name"
            className="rounded-xl"
          />
        </Field>
        <Field label="Email" required>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder="you@example.com"
            className="rounded-xl"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company (optional)">
          <Input
            value={form.company}
            onChange={(e) => set("company")(e.target.value)}
            placeholder="Company name"
            className="rounded-xl"
          />
        </Field>
        <Field label="Project Type" required>
          <Select value={form.projectType} onValueChange={set("projectType")}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Web App">Web Application</SelectItem>
              <SelectItem value="SaaS Product">SaaS Product</SelectItem>
              <SelectItem value="E-Commerce">E-Commerce</SelectItem>
              <SelectItem value="Mobile App">Mobile App</SelectItem>
              <SelectItem value="API / Backend">API / Backend</SelectItem>
              <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Budget Range">
          <Select value={form.budget} onValueChange={set("budget")}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="< $500">Less than $500</SelectItem>
              <SelectItem value="$500 - $1,500">$500 – $1,500</SelectItem>
              <SelectItem value="$1,500 - $5,000">$1,500 – $5,000</SelectItem>
              <SelectItem value="$5,000 - $15,000">$5,000 – $15,000</SelectItem>
              <SelectItem value="$15,000+">$15,000+</SelectItem>
              <SelectItem value="Let's discuss">Let&apos;s discuss</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Timeline">
          <Select value={form.timeline} onValueChange={set("timeline")}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASAP">ASAP (rush)</SelectItem>
              <SelectItem value="1-2 weeks">1–2 weeks</SelectItem>
              <SelectItem value="1 month">~1 month</SelectItem>
              <SelectItem value="2-3 months">2–3 months</SelectItem>
              <SelectItem value="Flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Project Description" required>
        <Textarea
          value={form.description}
          onChange={(e) => set("description")(e.target.value)}
          placeholder="Tell me about your project, goals, and any specific requirements..."
          className="min-h-[120px] rounded-xl resize-none"
        />
      </Field>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-soft transition-all hover:shadow-glow-pink"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit Hiring Request
          </>
        )}
      </Button>
    </form>
  );
}

function MessageForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "",
  });

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("✉️ Message sent!", {
        description: "I'll get back to you soon. Thanks for reaching out!",
      });
      setForm({ name: "", email: "", subject: "", message: "", website: "" });
    } catch (err: any) {
      toast.error("Something went wrong", {
        description: err?.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required>
          <Input
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder="Your Name"
            className="rounded-xl"
          />
        </Field>
        <Field label="Email" required>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder="you@example.com"
            className="rounded-xl"
          />
        </Field>
      </div>

      <Field label="Subject" required>
        <Input
          value={form.subject}
          onChange={(e) => set("subject")(e.target.value)}
          placeholder="What's this about?"
          className="rounded-xl"
        />
      </Field>

      <Field label="Message" required>
        <Textarea
          value={form.message}
          onChange={(e) => set("message")(e.target.value)}
          placeholder="Your message..."
          className="min-h-[140px] rounded-xl resize-none"
        />
      </Field>

      <Field label="Website (optional)">
        <Input
          value={form.website}
          onChange={(e) => set("website")(e.target.value)}
          placeholder="https://yoursite.com"
          className="rounded-xl"
        />
      </Field>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-soft transition-all hover:shadow-glow-pink"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </>
        )}
      </Button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">
        {label}
        {required && <span className="ml-1 text-pink-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
