"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  MessageCircle,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Reveal } from "../reveal";
import { Editable, useContent } from "@/components/portfolio/content-editor";

export function Contact() {
  const { t, tj } = useContent();
  const socials = tj<Record<string, string>>("socials.links");
  return (
    <section id="contact" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading ek="contact" />

        <div className="mt-14 grid gap-6 md:gap-8 lg:grid-cols-5">
          {/* Contact info */}
          <Reveal direction="right" className="lg:col-span-2">
            <div className="glass rounded-3xl border border-sky-500/15 p-6 shadow-soft sm:p-8">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <Editable id="contact.title2" as="h3" className="text-2xl font-bold" />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-[11px] font-semibold text-green-600 dark:text-green-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  <Editable id="contact.reply" />
                </span>
              </div>
              <p className="mb-6 text-sm text-muted-foreground">
                <Editable id="contact.infoNote" />
              </p>

              <div className="space-y-4">
                <ContactItem
                  icon={<Mail className="h-5 w-5" />}
                  label="Email"
                  value={t("brand.email")}
                  href={socials.email}
                  color="sky"
                />
                <ContactItem
                  icon={<Phone className="h-5 w-5" />}
                  label="Phone / WhatsApp"
                  value={t("brand.phone")}
                  href={socials.whatsapp}
                  color="pink"
                />
                <ContactItem
                  icon={<MapPin className="h-5 w-5" />}
                  label="Location"
                  value={t("brand.location")}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    t("brand.location")
                  )}`}
                  color="wood"
                />
              </div>

              <div className="mt-6 border-t border-sky-500/10 pt-6">
                <p className="mb-3 text-sm font-semibold"><Editable id="contact.follow" /></p>
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
                <Editable id="contact.whatsapp" />
              </a>
            </div>
          </Reveal>

          {/* Forms */}
          <Reveal direction="left" delay={0.1} className="lg:col-span-3">
            <div className="rounded-3xl border border-sky-500/15 bg-card p-6 shadow-card-hover sm:p-8">
              <Tabs defaultValue="hire" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-full bg-muted p-1">
                  <TabsTrigger
                    value="hire"
                    className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                  >
                    <Briefcase className="mr-1.5 h-4 w-4" />
                    <Editable id="contact.tabHire" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="message"
                    className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                  >
                    <Mail className="mr-1.5 h-4 w-4" />
                    <Editable id="contact.tabMessage" />
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
  const { t, tj } = useContent();
  const projectTypes = tj<{ value: string; label: string }[]>("contact.projectTypes");
  const budgetOptions = tj<{ value: string; label: string }[]>("contact.budgetOptions");
  const timelineOptions = tj<{ value: string; label: string }[]>("contact.timelineOptions");
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
      toast.error(t("contact.fillError"));
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
      toast.success(t("contact.hireOk"), {
        description: t("contact.hireOkSub"),
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
      toast.error(t("contact.submitFail"), {
        description: err?.message || t("contact.submitFailSub"),
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
            className="rounded-xl"
          />
        </Field>
        <Field labelId="contact.fEmail" required>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder={t("contact.pEmail")}
            className="rounded-xl"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field labelId="contact.fCompany">
          <Input
            value={form.company}
            onChange={(e) => set("company")(e.target.value)}
            placeholder={t("contact.pCompany")}
            className="rounded-xl"
          />
        </Field>
        <Field labelId="contact.fProjectType" required>
          <Select value={form.projectType} onValueChange={set("projectType")}>
            <SelectTrigger aria-label={t("contact.fProjectType")} className="rounded-xl">
              <SelectValue placeholder={t("contact.pProjectType")} />
            </SelectTrigger>
            <SelectContent>
              {projectTypes.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field labelId="contact.fBudget">
          <Select value={form.budget} onValueChange={set("budget")}>
            <SelectTrigger aria-label={t("contact.fBudget")} className="rounded-xl">
              <SelectValue placeholder={t("contact.pBudget")} />
            </SelectTrigger>
            <SelectContent>
              {budgetOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field labelId="contact.fTimeline">
          <Select value={form.timeline} onValueChange={set("timeline")}>
            <SelectTrigger aria-label={t("contact.fTimeline")} className="rounded-xl">
              <SelectValue placeholder={t("contact.pTimeline")} />
            </SelectTrigger>
            <SelectContent>
              {timelineOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field labelId="contact.fDesc" required>
        <Textarea
          value={form.description}
          onChange={(e) => set("description")(e.target.value)}
          placeholder={t("contact.pDesc")}
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
            <Editable id="contact.submitting" />
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            <Editable id="contact.submitHire" />
          </>
        )}
      </Button>
    </form>
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
    } catch (err: any) {
      toast.error(t("contact.submitFail"), {
        description: err?.message || t("contact.submitFailSub"),
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
            className="rounded-xl"
          />
        </Field>
        <Field labelId="contact.fEmail" required>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder={t("contact.pEmail")}
            className="rounded-xl"
          />
        </Field>
      </div>

      <Field labelId="contact.fSubject" required>
        <Input
          value={form.subject}
          onChange={(e) => set("subject")(e.target.value)}
          placeholder={t("contact.pSubject")}
          className="rounded-xl"
        />
      </Field>

      <Field labelId="contact.fMessage" required>
        <Textarea
          value={form.message}
          onChange={(e) => set("message")(e.target.value)}
          placeholder={t("contact.pMessage")}
          className="min-h-[140px] rounded-xl resize-none"
        />
      </Field>

      <Field labelId="contact.fWebsite">
        <Input
          value={form.website}
          onChange={(e) => set("website")(e.target.value)}
          placeholder={t("contact.pWebsite")}
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
      <Label className="text-xs font-semibold">
        {labelId ? <Editable id={labelId} /> : label}
        {required && <span className="ml-1 text-pink-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
