// Central registry of every editable content field on the portfolio.
// Each entry: key (used in SiteContent DB), label (shown in admin), category,
// default value (site renders this until an admin override is saved).
// The visual editor (<Editable>) and the admin Content tab both read this file.

import {
  developer,
  socials,
  services,
  techStack,
  quickLinks,
  navLinks,
  experiences,
  faqs,
} from "./portfolio-data";

export interface ContentField {
  key: string;
  label: string;
  category: string;
  def: string;
  multiline?: boolean;
  json?: boolean;
}

const F = (
  key: string,
  label: string,
  category: string,
  def: string,
  opts: { multiline?: boolean; json?: boolean } = {}
): ContentField => ({ key, label, category, def, ...opts });

const J = (v: unknown) => JSON.stringify(v);

/**
 * Validate a JSON field value before saving.
 * Checks syntax AND recursively checks that the value matches the structure
 * of the registered default — every nested type, every object key, and every
 * array item shape. A mismatched shape would crash the section that reads
 * the field via tj(). Returns the normalized (compact) JSON string on
 * success, with the offending path in the error message on failure.
 */
type JsonShape = "array" | "object" | "null" | "string" | "number" | "boolean";

function shapeOf(v: unknown): JsonShape {
  if (Array.isArray(v)) return "array";
  if (v === null) return "null";
  const t = typeof v;
  return t === "object" ? "object" : (t as JsonShape);
}

/**
 * Recursively verify `value` matches the structure of the default `def`.
 * Returns a human-readable error naming the offending path, or null when the
 * value is structurally compatible. A null default means "no contract" for
 * that branch and accepts anything.
 */
function checkShape(def: unknown, value: unknown, path: string): string | null {
  const want = shapeOf(def);
  const got = shapeOf(value);
  const where = path || "value";
  if (want === "null") return null;
  if (want !== got) {
    return `${where} must be a JSON ${want}, but the value is a JSON ${got}.`;
  }
  if (want === "array") {
    const d = def as unknown[];
    const v = value as unknown[];
    // Non-empty default array defines the item contract; an empty default
    // array accepts any array contents.
    if (d.length > 0) {
      for (let i = 0; i < v.length; i++) {
        const err = checkShape(d[0], v[i], `${where}[${i}]`);
        if (err) return err;
      }
    }
    return null;
  }
  if (want === "object") {
    const d = def as Record<string, unknown>;
    const v = value as Record<string, unknown>;
    for (const k of Object.keys(v)) {
      if (!(k in d)) {
        return `${where} has unknown key "${k}" — allowed keys: ${Object.keys(d).join(", ")}.`;
      }
    }
    for (const k of Object.keys(d)) {
      if (!(k in v)) {
        return `${where} is missing required key "${k}".`;
      }
      const err = checkShape(d[k], v[k], `${where}.${k}`);
      if (err) return err;
    }
    return null;
  }
  return null;
}

export function validateJsonField(
  key: string,
  raw: string
): { ok: true; normalized: string } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid JSON — fix the syntax and try again." };
  }
  const defRaw = CONTENT_DEFAULTS[key];
  if (defRaw !== undefined) {
    try {
      const defParsed: unknown = JSON.parse(defRaw);
      const shapeError = checkShape(defParsed, parsed, "");
      if (shapeError) {
        return { ok: false, error: `Shape mismatch: ${shapeError}` };
      }
    } catch (e) {
      // The default itself is not JSON — syntax check is enough. (A
      // checkShape error is returned above, not thrown, so reaching here
      // means JSON.parse(defRaw) failed.)
      if (e instanceof SyntaxError) {
        /* syntax-only validation stands */
      } else {
        throw e;
      }
    }
  }
  return { ok: true, normalized: JSON.stringify(parsed) };
}

export const CONTENT_FIELDS: ContentField[] = [
  // ---------- Brand (shared across the whole site) ----------
  F("brand.name", "Full name", "brand", developer.name),
  F("brand.firstName", "First name (logo)", "brand", developer.firstName),
  F("brand.role", "Role / title", "brand", developer.role),
  F("brand.tagline", "Hero tagline", "brand", developer.tagline, { multiline: true }),
  F(
    "brand.bio",
    "Short bio",
    "brand",
    developer.bio,
    { multiline: true }
  ),
  F("brand.aboutText1", "About paragraph 1", "brand", developer.aboutText, { multiline: true }),
  F("brand.aboutText2", "About paragraph 2", "brand", developer.aboutText2, { multiline: true }),
  F("brand.location", "Location", "brand", developer.location),
  F("brand.status", "Availability badge", "brand", developer.status),
  F("brand.jobTitle", "Job title", "brand", developer.jobTitle),
  F("brand.email", "Email address", "brand", developer.email),
  F("brand.phone", "Phone number", "brand", developer.phone),
  F("brand.githubUsername", "GitHub username", "brand", developer.githubUsername),
  F("brand.website", "Website domain", "brand", developer.website),
  F("brand.avatar", "Avatar image URL", "brand", "/assets/dev-photo.jpg"),

  // ---------- Social links (JSON) ----------
  F("socials.links", "Social links (JSON)", "brand", J(socials), { json: true }),
  F("socials.github", "GitHub URL", "brand", socials.github),

  // ---------- Navbar ----------
  F("nav.links", "Nav links (JSON)", "nav", J(navLinks), { json: true }),
  F("nav.hire", "Hire Me button", "nav", "Hire Me"),
  F("nav.brandTag", "Logo subtitle", "nav", "Full-Stack Dev"),

  // ---------- Hero ----------
  F("hero.greeting", "Greeting", "hero", "Hi, I'm"),
  F("hero.specializing", "Intro connector", "hero", "specializing in"),
  F("hero.stack", "Stack highlight", "hero", "MERN stack"),
  F(
    "hero.stackTail",
    "Intro tail",
    "hero",
    ", SaaS architecture, and modern cloud solutions."
  ),
  F("hero.ctaWork", "View Work button", "hero", "View Work"),
  F("hero.linkPricing", "Pricing link", "hero", "Pricing"),
  F("hero.linkGithub", "GitHub link label", "hero", "GitHub"),
  F("hero.linkResume", "Resume link label", "hero", "Resume"),
  F(
    "hero.quickStats",
    "Quick stats (JSON)",
    "hero",
    J([
      { v: "15+", l: "Projects Built" },
      { v: "MERN", l: "Stack Specialist" },
      { v: "100%", l: "Client Focused" },
    ]),
    { json: true }
  ),
  F("hero.scroll", "Scroll indicator", "hero", "Scroll Down"),
  F("hero.cardTitle", "Photo card title", "hero", `${developer.name} — Developer`),
  F("hero.cardBadge1", "Photo badge 1", "hero", "⚛️ React & Next.js"),
  F("hero.cardBadge2", "Photo badge 2", "hero", "Full-Stack Dev"),
  F(
    "hero.cardStats",
    "Photo card stats (JSON)",
    "hero",
    J([
      { label: "Stack", value: "MERN" },
      { label: "Focus", value: "SaaS" },
      { label: "Status", value: "Open" },
    ]),
    { json: true }
  ),

  // ---------- Marquee ----------
  F(
    "marquee.items",
    "Marquee items (JSON)",
    "marquee",
    J([
      "React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS",
      "PostgreSQL", "MongoDB", "Prisma", "GraphQL", "Docker",
      "Vercel", "Stripe", "Socket.io", "Python", "Express",
      "Firebase", "Supabase", "Git",
    ]),
    { json: true }
  ),

  // ---------- Achievement stats ----------
  F(
    "stats.items",
    "Stat counters (JSON)",
    "stats",
    J([
      { value: 15, suffix: "+", label: "Projects Built", icon: "Rocket", color: "text-sky-500" },
      { value: 3, suffix: "+", label: "Years Experience", icon: "Clock", color: "text-wood" },
      { value: 100, suffix: "%", label: "Learning Focus", icon: "Heart", color: "text-pink-500" },
      { value: 100, suffix: "%", label: "On-Time Delivery", icon: "Clock", color: "text-wood" },
    ]),
    { json: true }
  ),

  // ---------- About ----------
  F("about.emoji", "Heading emoji", "about", "👋"),
  F("about.title", "Heading title", "about", "About"),
  F("about.highlight", "Heading highlight", "about", "Me"),
  F("about.subtitle", "Heading subtitle", "about", "Get to know the developer behind the code."),
  F("about.h1a", "Title part 1", "about", "Turning Ideas Into"),
  F("about.h1b", "Title part 2 (gradient)", "about", "Digital Reality"),
  F(
    "about.chips",
    "Floating chips (JSON)",
    "about",
    J(["⚛️ React", "🚀 Next.js", "📘 TypeScript", "⚡ Node.js"]),
    { json: true }
  ),
  F("about.skills", "Skill chips (JSON)", "about", J(developer.skills), { json: true }),
  F("about.cta", "Experience button", "about", "View Experience"),
  F(
    "about.infoCards",
    "Info cards (JSON)",
    "about",
    J([
      { label: "Location", value: "Peshawar, PK" },
      { label: "Education", value: "Software Eng." },
      { label: "Status", value: "Available" },
    ]),
    { json: true }
  ),
  F("about.nameplateRole", "Photo nameplate role", "about", `${developer.role} · Software Engineering Student`),
  F("about.codeFile", "Code card filename", "about", "developer.tsx"),
  F("about.codeLang", "Code card language", "about", "TypeScript"),
  F("about.code", "Code snippet", "about", developer.codeSnippet, { multiline: true }),

  // ---------- Services ----------
  F("services.emoji", "Heading emoji", "services", "⚡"),
  F("services.title", "Heading title", "services", "What I"),
  F("services.highlight", "Heading highlight", "services", "Offer"),
  F(
    "services.subtitle",
    "Heading subtitle",
    "services",
    "Specialized services to bring your digital ideas to life with cutting-edge technology."
  ),
  F("services.items", "Services (JSON)", "services", J(services), { json: true }),
  F("services.cta", "Card button", "services", "Learn More"),

  // ---------- Projects ----------
  F("projects.emoji", "Heading emoji", "projects", "🚀"),
  F("projects.title", "Heading title", "projects", "Featured"),
  F("projects.highlight", "Heading highlight", "projects", "Projects"),
  F(
    "projects.subtitle",
    "Heading subtitle",
    "projects",
    "A live showcase of my GitHub repositories — fetched in real-time with documentation previews."
  ),
  F("projects.categories", "Filter categories (JSON)", "projects", J(["All", "Full-Stack", "AI", "Backend", "Frontend", "Tool", "Project"]), { json: true }),
  F("projects.searchPlaceholder", "Search placeholder", "projects", "Search projects..."),
  F("projects.sortUpdated", "Sort option: recently updated", "projects", "Recently Updated"),
  F("projects.sortStars", "Sort option: most stars", "projects", "Most Stars"),
  F("projects.sortForks", "Sort option: most forks", "projects", "Most Forks"),
  F("projects.sortName", "Sort option: name A-Z", "projects", "Name (A-Z)"),
  F("projects.refresh", "Refresh button", "projects", "Refresh"),
  F("projects.liveFrom", "\"Live from\" text", "projects", "Live from"),
  F("projects.reposWord", "\"repos\" word", "projects", "repos"),
  F("projects.sourceWord", "\"source\" word", "projects", "source"),
  F("projects.curatedNote", "Error fallback note", "projects", "showing curated list"),
  F("projects.noMatch", "No-match text", "projects", "No projects match your search."),
  F("projects.viewAll", "\"View All on GitHub\"", "projects", "View All on GitHub"),
  F("projects.featuredBadge", "Featured badge", "projects", "Featured"),
  F("projects.detailsBtn", "\"Details\" button", "projects", "Details"),
  F("projects.docsBtn", "\"Docs\" button", "projects", "Docs"),
  F("projects.docsTitle", "Docs modal title suffix", "projects", "Documentation"),
  F("projects.starsWord", "\"Stars\" word", "projects", "Stars"),
  F("projects.forksWord", "\"Forks\" word", "projects", "Forks"),
  F("projects.watchersWord", "\"Watchers\" word", "projects", "Watchers"),
  F("projects.issuesWord", "\"Issues\" word", "projects", "Issues"),
  F("projects.branchWord", "\"branch\" word", "projects", "branch"),
  F("projects.branchLabel", "\"Default branch\" label", "projects", "Default branch"),
  F("projects.licenseWord", "\"License\" word", "projects", "License"),
  F("projects.notSpecified", "\"Not specified\"", "projects", "Not specified"),
  F("projects.createdWord", "\"Created\" word", "projects", "Created"),
  F("projects.updatedWord", "\"Updated\" word", "projects", "Updated"),
  F("projects.updatedLabel", "\"Last updated\" label", "projects", "Last updated"),
  F("projects.readmeLoading", "README loading text", "projects", "Loading README.md from GitHub..."),
  F("projects.noReadme", "No-README text", "projects", "No README found for this repository."),
  F("projects.openGithub", "\"Open on GitHub\"", "projects", "Open on GitHub"),
  F("projects.viewSource", "\"View Source\"", "projects", "View Source"),
  F("projects.viewSourceCode", "\"View Source Code\"", "projects", "View Source Code"),
  F("projects.liveDemo", "\"Live Demo\"", "projects", "Live Demo"),
  F("projects.aboutWord", "\"About this project\"", "projects", "About this project"),
  F("projects.techWord", "\"Tech Stack & Topics\"", "projects", "Tech Stack & Topics"),
  F("projects.statsWord", "\"Repository Stats\"", "projects", "Repository Stats"),

  // ---------- Tech stack ----------
  F("techstack.emoji", "Heading emoji", "techstack", "🛠️"),
  F("techstack.title", "Heading title", "techstack", "My"),
  F("techstack.highlight", "Heading highlight", "techstack", "Skills"),
  F(
    "techstack.subtitle",
    "Heading subtitle",
    "techstack",
    "Technologies and tools I work with to build amazing products."
  ),
  F("techstack.groups", "Skill groups (JSON)", "techstack", J(techStack), { json: true }),

  // ---------- Experience ----------
  F("experience.emoji", "Heading emoji", "experience", "📈"),
  F("experience.title", "Heading title", "experience", "Career"),
  F("experience.highlight", "Heading highlight", "experience", "Timeline"),
  F(
    "experience.subtitle",
    "Heading subtitle",
    "experience",
    "My professional journey building products, leading teams, and growing as a developer."
  ),
  F("experience.items", "Timeline entries (JSON)", "experience", J(experiences), { json: true }),
  F("experience.ctaText", "Bottom CTA text", "experience", "Want to know more about my journey?"),
  F("experience.ctaLink", "Bottom CTA link", "experience", "Let's connect →"),

  // ---------- GitHub profile ----------
  F("github.emoji", "Heading emoji", "github", "🐙"),
  F("github.title", "Heading title", "github", "GitHub"),
  F("github.highlight", "Heading highlight", "github", "Profile"),
  F(
    "github.subtitle",
    "Heading subtitle",
    "github",
    "My open-source contributions and development activity, live from GitHub."
  ),
  F("github.loadError", "Load-error note", "github", "GitHub data could not be loaded. Showing fallback information."),
  F("github.followBtn", "\"Follow\" button", "github", "Follow"),
  F("github.statRepos", "\"Repositories\" label", "github", "Repositories"),
  F("github.statStars", "\"Total Stars\" label", "github", "Total Stars"),
  F("github.statFollowers", "\"Followers\" label", "github", "Followers"),
  F("github.statFollowing", "\"Following\" label", "github", "Following"),
  F("github.joinedWord", "\"Joined GitHub\" word", "github", "Joined GitHub"),
  F(
    "github.fallbackBio",
    "Fallback bio",
    "github",
    "Full-Stack Developer building production-grade SaaS applications with modern web technologies."
  ),
  F("github.fallbackCompany", "Fallback company", "github", "Freelance"),

  // ---------- Blog ----------
  F("blog.emoji", "Heading emoji", "blog", "📝"),
  F("blog.title", "Heading title", "blog", "Latest"),
  F("blog.highlight", "Heading highlight", "blog", "Articles"),
  F(
    "blog.subtitle",
    "Heading subtitle",
    "blog",
    "Thoughts on web development, architecture, and the freelance journey — from my keyboard to your screen."
  ),
  F("blog.searchPlaceholder", "Search placeholder", "blog", "Search articles..."),
  F("blog.empty", "Empty-state text", "blog", "No articles published yet. Check back soon!"),
  F("blog.showingPre", "\"Showing\" word", "blog", "Showing"),
  F("blog.showingMid", "\"of\" word", "blog", "of"),
  F("blog.showingPost", "\"articles\" word", "blog", "articles"),
  F("blog.inWord", "\"in\" word", "blog", "in"),
  F("blog.noMatch", "No-match text", "blog", "No articles match your search."),
  F("blog.clearFilters", "\"Clear filters\" button", "blog", "Clear filters"),
  F("blog.featuredBadge", "Featured badge", "blog", "Featured"),
  F("blog.minRead", "\"min read\" text", "blog", "min read"),
  F("blog.readBtn", "\"Read\" link", "blog", "Read"),
  F("blog.moreText", "\"Want to read more?\" text", "blog", "Want to read more?"),
  F("blog.connectBtn", "Connect button", "blog", "Let's connect →"),
  F("blog.rssFeed", "\"RSS Feed\" link", "blog", "RSS Feed"),
  F("blog.articleWord", "\"Article\" word", "blog", "Article"),
  F("blog.loadingDots", "\"Loading...\" text", "blog", "Loading..."),
  F("blog.loadingArticle", "\"Loading article...\" text", "blog", "Loading article..."),
  F("blog.tagsWord", "\"Tags:\" word", "blog", "Tags:"),
  F("blog.hireBtn", "\"Hire Me\" button", "blog", "Hire Me"),
  F("blog.shareWord", "\"Share:\" word", "blog", "Share:"),
  F("blog.copyLink", "\"Copy link\" button", "blog", "Copy link"),
  F("blog.copied", "\"Copied!\" text", "blog", "Copied!"),
  F("blog.relatedWord", "\"Related Articles\"", "blog", "Related Articles"),
  F("blog.notFound", "\"Article not found.\"", "blog", "Article not found."),
  F("blog.tocTitle", "\"Table of Contents\"", "blog", "Table of Contents"),

  // ---------- Booking ----------
  F("booking.emoji", "Heading emoji", "booking", "📅"),
  F("booking.title", "Heading title", "booking", "Book a"),
  F("booking.highlight", "Heading highlight", "booking", "Call"),
  F(
    "booking.subtitle",
    "Heading subtitle",
    "booking",
    "Skip the back-and-forth emails. Pick a time that works for you and let's talk about your project."
  ),
  F("booking.available", "Availability badge", "booking", "Available this week"),
  F("booking.step1", "Step 1 label", "booking", "Purpose"),
  F("booking.step2", "Step 2 label", "booking", "Date & Time"),
  F("booking.step3", "Step 3 label", "booking", "Details"),
  F("booking.step1Title", "Step 1 title", "booking", "What would you like to discuss?"),
  F("booking.step1Sub", "Step 1 subtitle", "booking", "Choose the type of call that fits your needs."),
  F("booking.purposes", "Call purposes (JSON)", "booking", J([
    { id: "consultation", label: "Project Consultation", icon: "💬", desc: "Discuss your project idea" },
    { id: "code-review", label: "Code Review", icon: "🔍", desc: "Get feedback on your codebase" },
    { id: "hiring", label: "Hire Me", icon: "🚀", desc: "Start a development project" },
    { id: "mentorship", label: "Mentorship", icon: "🎓", desc: "Career guidance & advice" },
  ]), { json: true }),
  F("booking.step2Title", "Step 2 title", "booking", "Pick a date & time"),
  F("booking.step2Sub", "Step 2 subtitle (TZ appended)", "booking", "All times shown in your local timezone"),
  F("booking.selectDate", "\"Select Date\" label", "booking", "Select Date"),
  F("booking.selectTime", "\"Select Time\" label", "booking", "Select Time"),
  F("booking.timeSlots", "Time slots (JSON)", "booking", J(["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"]), { json: true }),
  F("booking.fridayNote", "Friday exclusion note", "booking", "Fridays excluded (weekend in Pakistan). Times in PKT (UTC+5)."),
  F("booking.dateFirst", "\"Select a date first\"", "booking", "Select a date first"),
  F("booking.backBtn", "\"Back\" button", "booking", "Back"),
  F("booking.step3Title", "Step 3 title", "booking", "Your details"),
  F("booking.step3Sub", "Step 3 subtitle", "booking", "Confirm your booking and I'll send a calendar invite."),
  F("booking.fName", "Form: name label", "booking", "Name"),
  F("booking.fEmail", "Form: email label", "booking", "Email"),
  F("booking.fNotes", "Form: notes label", "booking", "Notes (optional)"),
  F("booking.pName", "Form: name placeholder", "booking", "Your Name"),
  F("booking.pEmail", "Form: email placeholder", "booking", "you@example.com"),
  F("booking.pNotes", "Form: notes placeholder", "booking", "Anything you'd like me to know before the call?"),
  F("booking.confirmBtn", "\"Confirm Booking\" button", "booking", "Confirm Booking"),
  F("booking.bookingNow", "\"Booking...\" text", "booking", "Booking..."),
  F("booking.successTitle", "Success title", "booking", "Booking Request Sent! 🎉"),
  F("booking.successPre", "Success line part 1", "booking", "Your"),
  F("booking.successMid1", "Success line part 2", "booking", "call for"),
  F("booking.successMid2", "Success line part 3", "booking", "at"),
  F("booking.successPost", "Success line part 4", "booking", "has been requested."),
  F("booking.successSub", "Success line part 5", "booking", "I'll send a calendar invite to your email within a few hours to confirm."),
  F("booking.addCalendar", "\"Add to Calendar\"", "booking", "Add to Calendar"),
  F("booking.bookAnother", "\"Book another call\"", "booking", "Book another call"),
  F("booking.nameEmailError", "Name/email error", "booking", "Please enter your name and email."),
  F("booking.invalidEmail", "Invalid email error", "booking", "Please enter a valid email address."),
  F("booking.submitOk", "Submit success title", "booking", "📅 Booking request submitted!"),
  F("booking.submitOkSub", "Submit success text", "booking", "I'll confirm the time via email within a few hours."),
  F("booking.submitFail", "Submit failure title", "booking", "Booking failed"),
  F("booking.submitFailSub", "Submit failure text", "booking", "Please try again."),
  F("booking.badges", "Trust badges (JSON)", "booking", J(["Google Meet / Zoom", "30-45 min sessions", "All timezones welcome", "Free consultation"]), { json: true }),

  // ---------- Pricing ----------
  F("pricing.emoji", "Heading emoji", "pricing", "💎"),
  F("pricing.title", "Heading title", "pricing", "Pricing"),
  F("pricing.highlight", "Heading highlight", "pricing", "Plans"),
  F(
    "pricing.subtitle",
    "Heading subtitle",
    "pricing",
    "Transparent pricing for every stage of your project. Custom quotes available on request."
  ),
  F("pricing.plans", "Pricing plans (JSON)", "pricing", J([
    { name: "Starter", emoji: "🌱", price: "$499", period: "/ project", description: "Perfect for small websites & landing pages.", features: ["1-3 page website", "Responsive design", "Basic SEO setup", "Contact form", "1 round of revisions", "7-day delivery"], color: "sky", popular: false },
    { name: "Professional", emoji: "🚀", price: "$1,499", period: "/ project", description: "Full-featured web app with backend & database.", features: ["Up to 10 pages / screens", "Custom backend & API", "Database design", "Authentication system", "Admin dashboard", "3 rounds of revisions", "30 days free support", "14-day delivery"], color: "pink", popular: true },
    { name: "Enterprise", emoji: "🏢", price: "Custom", period: "", description: "SaaS products with scaling & ongoing support.", features: ["Unlimited pages / features", "Microservices architecture", "Payment integration (Stripe)", "Real-time features", "CI/CD pipeline", "Unlimited revisions", "90 days free support", "Dedicated support channel", "Flexible timeline"], color: "wood", popular: false },
  ]), { json: true }),
  F("pricing.popular", "\"POPULAR\" badge", "pricing", "POPULAR"),
  F("pricing.getStarted", "\"Get Started\" button", "pricing", "Get Started"),
  F("pricing.footText", "Footnote text", "pricing", "Need something different?"),
  F("pricing.footLink", "Footnote link", "pricing", "Let's discuss your project →"),

  // ---------- Testimonials ----------
  F("testimonials.emoji", "Heading emoji", "testimonials", "💬"),
  F("testimonials.title", "Heading title", "testimonials", "What Clients"),
  F("testimonials.highlight", "Heading highlight", "testimonials", "Say"),
  F(
    "testimonials.subtitle",
    "Heading subtitle",
    "testimonials",
    "Feedback from clients and collaborators who trusted me with their projects."
  ),
  F("testimonials.stats", "Summary stat cards (JSON)", "testimonials", J([
    { v: "COUNT", l: "Testimonials" },
    { v: "100%", l: "Commitment to Quality" },
    { v: "100%", l: "On-Time Delivery" },
  ]), { json: true }),
  F("testimonials.leaveBtn", "\"Leave a Testimonial\" button", "testimonials", "Leave a Testimonial"),
  F("testimonials.emptyTitle", "Empty-state title", "testimonials", "No testimonials yet"),
  F("testimonials.emptySub", "Empty-state text", "testimonials", "Be the first to leave a testimonial! Click the button above to share your experience."),
  F("testimonials.verifiedWord", "\"Verified\" badge", "testimonials", "Verified"),
  F("testimonials.newWord", "\"New\" badge", "testimonials", "New"),
  F("testimonials.modalSub", "Modal subtitle", "testimonials", "Share your experience working with me. Submissions are reviewed before public display."),
  F("testimonials.fName", "Form: name label", "testimonials", "Your Name"),
  F("testimonials.fRole", "Form: role label", "testimonials", "Your Role"),
  F("testimonials.fCompany", "Form: company label", "testimonials", "Company (optional)"),
  F("testimonials.fEmail", "Form: email label", "testimonials", "Email"),
  F("testimonials.fRating", "Form: rating label", "testimonials", "Rating"),
  F("testimonials.fMessage", "Form: message label", "testimonials", "Your Message"),
  F("testimonials.pName", "Form: name placeholder", "testimonials", "John Smith"),
  F("testimonials.pRole", "Form: role placeholder", "testimonials", "CTO, Founder, etc."),
  F("testimonials.pCompany", "Form: company placeholder", "testimonials", "Acme Inc."),
  F("testimonials.pEmail", "Form: email placeholder", "testimonials", "you@example.com"),
  F("testimonials.pMessage", "Form: message placeholder", "testimonials", "Share your experience working with Yaseen — what went well, the impact, etc."),
  F("testimonials.charsWord", "\"characters\" word", "testimonials", "characters"),
  F("testimonials.cancelBtn", "\"Cancel\" button", "testimonials", "Cancel"),
  F("testimonials.submitBtn", "\"Submit\" button", "testimonials", "Submit"),
  F("testimonials.submitting", "\"Submitting...\" text", "testimonials", "Submitting..."),
  F("testimonials.fillError", "Validation error", "testimonials", "Please fill in all required fields."),
  F("testimonials.shortError", "Too-short error", "testimonials", "Please write at least 10 characters in your message."),
  F("testimonials.submitOk", "Submit success title", "testimonials", "🎉 Thank you for your testimonial!"),
  F("testimonials.submitOkSub", "Submit success text", "testimonials", "It will appear publicly after a quick review by Yaseen."),
  F("testimonials.submitFail", "Submit failure title", "testimonials", "Submission failed"),
  F("testimonials.submitFailSub", "Submit failure text", "testimonials", "Please try again later."),

  // ---------- FAQ ----------
  F("faq.emoji", "Heading emoji", "faq", "❓"),
  F("faq.title", "Heading title", "faq", "Frequently Asked"),
  F("faq.highlight", "Heading highlight", "faq", "Questions"),
  F(
    "faq.subtitle",
    "Heading subtitle",
    "faq",
    "Quick answers to the most common questions clients ask before working with me."
  ),
  F("faq.items", "Questions & answers (JSON)", "faq", J(faqs), { json: true }),
  F("faq.ctaTitle", "CTA title", "faq", "Still have questions?"),
  F("faq.ctaHighlight", "CTA highlight", "faq", "I'm here to help."),
  F("faq.ctaSub", "CTA subtitle", "faq", "Reach out via the contact form, WhatsApp, or the live chat — I typically reply within a few hours."),
  F("faq.ctaContact", "CTA contact button", "faq", "Contact Me"),

  // ---------- Contact ----------
  F("contact.emoji", "Heading emoji", "contact", "💬"),
  F("contact.title", "Heading title", "contact", "Let's Work"),
  F("contact.highlight", "Heading highlight", "contact", "Together"),
  F(
    "contact.subtitle",
    "Heading subtitle",
    "contact",
    "Have a project in mind? Let's discuss how I can help bring your ideas to life."
  ),
  F("contact.title2", "Info card title", "contact", "Get in Touch"),
  F("contact.reply", "Reply-time badge", "contact", "Avg. reply: 2-4 hrs"),
  F(
    "contact.infoNote",
    "Info card note",
    "contact",
    "I usually respond within a few hours. For urgent matters, use WhatsApp for instant communication.",
    { multiline: true }
  ),
  F("contact.follow", "Follow heading", "contact", "Follow Me"),
  F("contact.whatsapp", "WhatsApp button", "contact", "Chat on WhatsApp"),
  F("contact.tabHire", "Hire tab", "contact", "Hire Me"),
  F("contact.tabMessage", "Message tab", "contact", "Send a Message"),
  F("contact.submitHire", "Hire submit button", "contact", "Submit Hiring Request"),
  F("contact.submitMessage", "Message submit button", "contact", "Send Message"),
  F("contact.fillError", "Validation error", "contact", "Please fill in all required fields."),
  F("contact.hireOk", "Hire success title", "contact", "🎉 Request submitted!"),
  F(
    "contact.hireOkSub",
    "Hire success text",
    "contact",
    "Thanks for reaching out. I'll review your project and respond within 24 hours."
  ),
  F("contact.msgOk", "Message success title", "contact", "✉️ Message sent!"),
  F(
    "contact.msgOkSub",
    "Message success text",
    "contact",
    "I'll get back to you soon. Thanks for reaching out!"
  ),
  F("contact.submitting", "\"Submitting...\" text", "contact", "Submitting..."),
  F("contact.sending", "\"Sending...\" text", "contact", "Sending..."),
  F("contact.submitFail", "Submit failure title", "contact", "Something went wrong"),
  F("contact.submitFailSub", "Submit failure text", "contact", "Please try again later."),
  F("contact.fName", "Form: name label", "contact", "Name"),
  F("contact.pName", "Form: name placeholder", "contact", "Your Name"),
  F("contact.fEmail", "Form: email label", "contact", "Email"),
  F("contact.pEmail", "Form: email placeholder", "contact", "you@example.com"),
  F("contact.fCompany", "Hire form: company label", "contact", "Company (optional)"),
  F("contact.pCompany", "Hire form: company placeholder", "contact", "Company name"),
  F("contact.fProjectType", "Hire form: project type label", "contact", "Project Type"),
  F("contact.pProjectType", "Hire form: project type placeholder", "contact", "Select type"),
  F("contact.projectTypes", "Hire form: project type options (JSON)", "contact", J([
    { value: "Web App", label: "Web Application" },
    { value: "SaaS Product", label: "SaaS Product" },
    { value: "E-Commerce", label: "E-Commerce" },
    { value: "Mobile App", label: "Mobile App" },
    { value: "API / Backend", label: "API / Backend" },
    { value: "UI/UX Design", label: "UI/UX Design" },
    { value: "Other", label: "Other" },
  ]), { json: true }),
  F("contact.fBudget", "Hire form: budget label", "contact", "Budget Range"),
  F("contact.pBudget", "Hire form: budget placeholder", "contact", "Select budget"),
  F("contact.budgetOptions", "Hire form: budget options (JSON)", "contact", J([
    { value: "< $500", label: "Less than $500" },
    { value: "$500 - $1,500", label: "$500 – $1,500" },
    { value: "$1,500 - $5,000", label: "$1,500 – $5,000" },
    { value: "$5,000 - $15,000", label: "$5,000 – $15,000" },
    { value: "$15,000+", label: "$15,000+" },
    { value: "Let's discuss", label: "Let's discuss" },
  ]), { json: true }),
  F("contact.fTimeline", "Hire form: timeline label", "contact", "Timeline"),
  F("contact.pTimeline", "Hire form: timeline placeholder", "contact", "Select timeline"),
  F("contact.timelineOptions", "Hire form: timeline options (JSON)", "contact", J([
    { value: "ASAP", label: "ASAP (rush)" },
    { value: "1-2 weeks", label: "1–2 weeks" },
    { value: "1 month", label: "~1 month" },
    { value: "2-3 months", label: "2–3 months" },
    { value: "Flexible", label: "Flexible" },
  ]), { json: true }),
  F("contact.fDesc", "Hire form: description label", "contact", "Project Description"),
  F("contact.pDesc", "Hire form: description placeholder", "contact", "Tell me about your project, goals, and any specific requirements..."),
  F("contact.fSubject", "Message form: subject label", "contact", "Subject"),
  F("contact.pSubject", "Message form: subject placeholder", "contact", "What's this about?"),
  F("contact.fMessage", "Message form: message label", "contact", "Message"),
  F("contact.pMessage", "Message form: message placeholder", "contact", "Your message..."),
  F("contact.fWebsite", "Message form: website label", "contact", "Website (optional)"),
  F("contact.pWebsite", "Message form: website placeholder", "contact", "https://yoursite.com"),

  // ---------- Newsletter ----------
  F("newsletter.titleA", "Title part 1", "newsletter", "Stay in the"),
  F("newsletter.titleB", "Title part 2 (gradient)", "newsletter", "Loop"),
  F(
    "newsletter.sub",
    "Subtitle",
    "newsletter",
    "Get notified when I publish new articles on SaaS architecture, TypeScript patterns, and lessons from my freelance journey. No spam — just quality content, occasionally.",
    { multiline: true }
  ),
  F("newsletter.stats", "Stat badges (JSON)", "newsletter", J([
    { icon: "book", text: "6+ articles published" },
    { icon: "sparkles", text: "Monthly digest" },
    { icon: "check", text: "Unsubscribe anytime" },
  ]), { json: true }),
  F("newsletter.emailPlaceholder", "Email placeholder", "newsletter", "you@example.com"),
  F("newsletter.subscribe", "\"Subscribe\" button", "newsletter", "Subscribe"),
  F("newsletter.subscribing", "\"Subscribing...\" text", "newsletter", "Subscribing..."),
  F("newsletter.subscribedTitle", "Subscribed title", "newsletter", "You're subscribed!"),
  F("newsletter.subscribedSub", "Subscribed text", "newsletter", "Watch your inbox for the next article."),
  F("newsletter.footNote", "Footnote", "newsletter", "Join 120+ developers and founders who trust my content."),
  F("newsletter.invalidEmail", "Invalid email error", "newsletter", "Please enter a valid email address."),
  F("newsletter.subscribedOk", "Subscribe success title", "newsletter", "🎉 Subscribed successfully!"),
  F(
    "newsletter.subscribedOkSub",
    "Subscribe success text",
    "newsletter",
    "You'll get notified when I publish new articles on SaaS, TypeScript, and freelance dev life."
  ),
  F("newsletter.subscribedFail", "Subscribe failure title", "newsletter", "Subscription failed"),
  F("newsletter.subscribedFailSub", "Subscribe failure text", "newsletter", "Please try again later."),

  // ---------- Chat widget ----------
  F("chat.openChat", "Open-chat aria label", "chat", "Open chat"),
  F("chat.onlineWord", "\"online\" word", "chat", "online"),
  F("chat.onlineText", "Online status text", "chat", "🟢 Online · typically replies in minutes"),
  F("chat.connecting", "\"Connecting...\" text", "chat", "Connecting..."),
  F("chat.minimize", "Minimize aria label", "chat", "Minimize"),
  F("chat.greeting", "Empty-chat greeting", "chat", "Hi! Send a message to start the conversation."),
  F("chat.typing", "\"is typing...\" text", "chat", "is typing..."),
  F("chat.typePlaceholder", "Input placeholder", "chat", "Type a message..."),
  F("chat.sendMsg", "Send aria label", "chat", "Send message"),
  F("chat.connectingPanel", "Panel connecting text", "chat", "Connecting to chat..."),

  // ---------- Footer ----------
  F(
    "footer.tagline",
    "Brand tagline",
    "footer",
    `${developer.role} building production-grade SaaS applications with modern web technologies.`,
    { multiline: true }
  ),
  F("footer.linksTitle", "Quick links title", "footer", "Quick Links"),
  F("footer.quickLinks", "Quick links (JSON)", "footer", J(quickLinks), { json: true }),
  F("footer.contactTitle", "Contact title", "footer", "Contact"),
  F("footer.connectTitle", "Connect title", "footer", "Connect"),
  F("footer.newsPlaceholder", "Newsletter placeholder", "footer", "Your email for updates"),
  F("footer.newsButton", "Newsletter button", "footer", "Subscribe"),
  F("footer.subscribed", "Subscribed toast", "footer", "Subscribed!"),
  F("footer.subscribedFail", "Subscribe failure title", "footer", "Subscription failed"),
  F("footer.subscribedFailSub", "Subscribe failure text", "footer", "Please try again later."),
  F(
    "footer.subscribedSub",
    "Subscribed toast text",
    "footer",
    "Thanks for following my work. I'll keep you updated."
  ),
  F("footer.copyrightB", "Copyright tail", "footer", "using React & Next.js"),
  F("footer.backToTop", "Back-to-top button", "footer", "Back to top"),
  F("footer.brandTag", "Logo subtitle", "footer", "Full-Stack Developer"),

  // ---------- Widgets (command palette, back-to-top, stats) ----------
  F("palette.openAria", "Command palette trigger aria-label", "widgets", "Open command palette"),
  F("palette.quickSearch", "Command palette trigger text", "widgets", "Quick search"),
  F("palette.title", "Command palette dialog title (screen reader)", "widgets", "Command Palette — Quick Search"),
  F("palette.placeholder", "Command palette search placeholder", "widgets", "Search sections, projects, services, or actions..."),
  F("palette.noResultsA", "Command palette no-results prefix", "widgets", "No results for"),
  F("palette.noResultsB", "Command palette no-results hint", "widgets", "Try searching for sections, projects, or services"),
  F("palette.hintSection", "Command palette group: sections", "widgets", "Section"),
  F("palette.hintService", "Command palette group: services", "widgets", "Service"),
  F("palette.hintProject", "Command palette group: projects", "widgets", "Project"),
  F("palette.hintAction", "Command palette group: actions", "widgets", "Action"),
  F("palette.hintExternal", "Command palette group: external", "widgets", "External"),
  F("palette.other", "Command palette fallback group name", "widgets", "Other"),
  F("palette.hireMe", "Command palette action: hire me", "widgets", "Hire Me"),
  F("palette.downloadResume", "Command palette action: download resume", "widgets", "Download Resume"),
  F("palette.visitGithub", "Command palette action: visit GitHub", "widgets", "Visit GitHub Profile"),
  F("widgets.backToTop", "Back-to-top button aria-label", "widgets", "Back to top"),
  F("stats.title", "Stats widget title (loading)", "widgets", "Live Stats"),
  F("stats.analytics", "Stats widget heading", "widgets", "Live Analytics"),
  F("stats.live", "Stats widget live badge", "widgets", "Live"),
  F("stats.totalViews", "Stats card: total views", "widgets", "Total Views"),
  F("stats.today", "Stats card sub: today suffix", "widgets", "today"),
  F("stats.thisWeek", "Stats card: this week", "widgets", "This Week"),
  F("stats.per30d", "Stats card sub: 30d suffix", "widgets", "/ 30d"),
  F("stats.bookings", "Stats card: bookings", "widgets", "Bookings"),
  F("stats.pending", "Stats card sub: pending suffix", "widgets", "pending"),
  F("stats.testimonials", "Stats card: testimonials", "widgets", "Testimonials"),
  F("stats.approved", "Stats card sub: approved suffix", "widgets", "approved"),
  F("stats.subscribers", "Stats card: subscribers", "widgets", "Subscribers"),
  F("stats.newsletter", "Stats card sub: newsletter", "widgets", "newsletter"),
  F("stats.articles", "Stats card: articles", "widgets", "Articles"),
  F("stats.published", "Stats card sub: published", "widgets", "published"),
  F("stats.topSections", "Stats widget: most viewed heading", "widgets", "Most Viewed Sections"),

  // ---------- Accessibility ----------
  F("a11y.goTop", "Go-to-top aria-label", "accessibility", "Go to top"),
  F("a11y.toggleTheme", "Theme toggle aria-label", "accessibility", "Toggle theme"),
  F("a11y.menu", "Menu button aria-label", "accessibility", "Menu"),
  F("a11y.clearSearch", "Clear-search aria-label", "accessibility", "Clear search"),
  F("a11y.subscribeRss", "RSS subscribe aria-label", "accessibility", "Subscribe to RSS feed"),
  F("a11y.sortProjects", "Sort-projects aria-label", "accessibility", "Sort projects"),
  F("a11y.close", "Close-dialog aria-label", "accessibility", "Close"),
  F("a11y.scrollDown", "Scroll-down aria-label", "accessibility", "Scroll down"),
];

export const CONTENT_DEFAULTS: Record<string, string> = Object.fromEntries(
  CONTENT_FIELDS.map((f) => [f.key, f.def])
);

export const CONTENT_CATEGORIES: { id: string; label: string }[] = [
  { id: "brand", label: "Brand & Identity" },
  { id: "nav", label: "Navbar" },
  { id: "hero", label: "Hero" },
  { id: "marquee", label: "Marquee" },
  { id: "stats", label: "Stat Counters" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "projects", label: "Projects" },
  { id: "techstack", label: "Tech Stack" },
  { id: "experience", label: "Experience" },
  { id: "github", label: "GitHub Profile" },
  { id: "blog", label: "Blog" },
  { id: "booking", label: "Booking" },
  { id: "pricing", label: "Pricing" },
  { id: "testimonials", label: "Testimonials" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
  { id: "newsletter", label: "Newsletter" },
  { id: "chat", label: "Chat Widget" },
  { id: "widgets", label: "Widgets" },
  { id: "footer", label: "Footer" },
  { id: "accessibility", label: "Accessibility" },
];
