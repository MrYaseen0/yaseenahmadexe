"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  Github,
  Linkedin,
  Instagram,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SectionHeading } from "../section-heading";
import { Reveal } from "../reveal";
import { Editable, useContent } from "@/components/portfolio/content-editor";

export function Contact() {
  const { t, tj } = useContent();
  const socials = tj<Record<string, string>>("socials.links");
  return (
    <section id="contact" className="bg-[#F4F5F1] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading ek="contact" />

        <div className="mt-14 grid gap-6 md:gap-8 lg:grid-cols-5">
          {/* Contact info */}
          <Reveal className="lg:col-span-2">
            <div className="rounded-xl border border-[#E6E8E2] bg-white p-6 sm:p-8">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#166534]">
                Get in touch
              </p>
              <h3 className="font-display text-2xl font-semibold tracking-tight text-[#101410] sm:text-3xl">
                <Editable id="contact.title2" />
              </h3>
              <p className="mt-3 flex items-center gap-1.5 rounded-full border border-[#E6E8E2] bg-[#EAF3EC] px-3 py-1.5 text-[11px] font-medium text-[#166534] w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#166534] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#166534]" />
                </span>
                <Editable id="contact.reply" />
              </p>
              <p className="mb-6 mt-3 text-sm leading-relaxed text-[#5F665F]">
                <Editable id="contact.infoNote" />
              </p>

              <div className="space-y-3">
                <ContactItem
                  icon={<Mail className="h-5 w-5" />}
                  label="Email"
                  value={t("brand.email")}
                  href={socials.email}
                />
                <ContactItem
                  icon={<Phone className="h-5 w-5" />}
                  label="Phone / WhatsApp"
                  value={t("brand.phone")}
                  href={socials.whatsapp}
                />
                <ContactItem
                  icon={<MapPin className="h-5 w-5" />}
                  label="Location"
                  value={t("brand.location")}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    t("brand.location")
                  )}`}
                />
              </div>

              <div className="mt-6 border-t border-[#E6E8E2] pt-6">
                <p className="mb-3 text-sm font-semibold text-[#101410]">
                  <Editable id="contact.follow" />
                </p>
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

              <a
                href={socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 rounded-full border border-[#E6E8E2] bg-white px-5 py-3 text-sm font-medium text-[#101410] transition-all hover:border-[#101410]"
              >
                <MessageCircle className="h-4 w-4" />
                <Editable id="contact.whatsapp" />
              </a>
            </div>
          </Reveal>

          {/* Message form */}
          <Reveal delay={0.1} className="lg:col-span-3">
            <div className="rounded-xl border border-[#E6E8E2] bg-white p-6 sm:p-8">
              <MessageForm />
            </div>
          </Reveal>
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-xl border border-transparent p-3 transition-all hover:border-[#E6E8E2] hover:bg-[#F4F5F1]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#E6E8E2] bg-white text-[#101410]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#5F665F]">
          {label}
        </div>
        <div className="truncate text-sm font-medium text-[#101410] group-hover:text-[#166534]">
          {value}
        </div>
      </div>
    </a>
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
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E6E8E2] bg-white text-[#5F665F] transition-all hover:border-[#101410] hover:text-[#101410]"
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

function MessageForm() {
  const { t } = useContent();
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
      toast.error(t("contact.fillError"));
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
      toast.success(t("contact.msgOk"), {
        description: t("contact.msgOkSub"),
      });
      setForm({ name: "", email: "", subject: "", message: "", website: "" });
    } catch (err) {
      toast.error(t("contact.submitFail"), {
        description:
          err instanceof Error ? err.message : t("contact.submitFailSub"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field labelId="contact.fName" required>
          <Input
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder={t("contact.pName")}
            className="rounded-lg border-[#E6E8E2] bg-white focus:border-[#101410]"
          />
        </Field>
        <Field labelId="contact.fEmail" required>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder={t("contact.pEmail")}
            className="rounded-lg border-[#E6E8E2] bg-white focus:border-[#101410]"
          />
        </Field>
      </div>

      <Field labelId="contact.fSubject" required>
        <Input
          value={form.subject}
          onChange={(e) => set("subject")(e.target.value)}
          placeholder={t("contact.pSubject")}
          className="rounded-lg border-[#E6E8E2] bg-white focus:border-[#101410]"
        />
      </Field>

      <Field labelId="contact.fMessage" required>
        <Textarea
          value={form.message}
          onChange={(e) => set("message")(e.target.value)}
          placeholder={t("contact.pMessage")}
          className="min-h-[140px] rounded-lg border-[#E6E8E2] bg-white focus:border-[#101410] resize-none"
        />
      </Field>

      <Field labelId="contact.fWebsite">
        <Input
          value={form.website}
          onChange={(e) => set("website")(e.target.value)}
          placeholder={t("contact.pWebsite")}
          className="rounded-lg border-[#E6E8E2] bg-white focus:border-[#101410]"
        />
      </Field>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#101410] px-6 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <Editable id="contact.sending" />
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            <Editable id="contact.submitMessage" />
          </>
        )}
      </Button>
    </form>
  );
}

function Field({
  label,
  labelId,
  required,
  children,
}: {
  label?: string;
  labelId?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="font-mono text-[11px] uppercase tracking-wider text-[#5F665F]">
        {labelId ? <Editable id={labelId} /> : label}
        {required && <span className="ml-1 text-[#166534]">*</span>}
      </Label>
      {children}
    </div>
  );
}
