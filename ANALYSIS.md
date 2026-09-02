# Web Analysis — Yaseen Ahmad Portfolio

**Repo:** `MrYaseen0/yaseenahmadexe` (branch `arena/01a06117-yaseenahmadexe`)
**Analyzed:** 2026-09-02 · **Method:** full static review + type-check, lint, production build attempt, and live dev-server smoke tests

---

## 1. What it is

A single-page **developer portfolio / freelancer landing site** (`yaseenahmadexe.vercel.app`) for Yaseen Ahmad — Full-Stack Developer, Peshawar, Pakistan. Built with **Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui + Framer Motion + Prisma (PostgreSQL) + Socket.io**. It is a feature-heavy, "everything-in-one-page" portfolio: 16 sections, ~20 API routes, an admin dashboard, visitor analytics, a real-time chat widget, blog CMS, booking with `.ics` export, and a resume generator.

---

## 2. Stack & architecture

| Layer | Technology |
|---|---|
| Framework | Next.js 16.3 (Turbopack), App Router, React 19, TypeScript (strict) |
| Styling | Tailwind CSS 4 (CSS-first `@theme`), tw-animate-css, custom sky/pink/wood/cream palette, glassmorphism, CSS 3D transforms |
| UI kit | shadcn/ui (60+ components), Framer Motion, lucide-react |
| Data | Prisma 6 + PostgreSQL (`DATABASE_URL`), 11 models |
| Auth | Custom HS256 JWT (Node `crypto`), env-based admin credentials, 24h tokens |
| Realtime | Self-contained Socket.io mini-service (`mini-services/chat-service`, port 3003), persisted via HTTP to `/api/chat-history` |
| External | GitHub REST API (repos/profile/README, 5-min in-memory cache + curated fallback), Google Fonts (Geist) |
| Deploy | Vercel (metadata canonical URL) **and** a custom function-compute image (`.zscripts/` + Caddy `:81` gateway with `XTransformPort` proxying) |
| Config | `z-ai-web-dev-sdk` scaffold artifacts: `.zscripts/*`, `tests/*`, `examples/`, `download/` |

### Page structure (`src/app/page.tsx`, one route + `/admin`)
`Hero → Marquee → AchievementStats → About → Services → Projects → TechStack → Experience → GithubProfile → Blog → Newsletter → Booking → Pricing → Testimonials → FAQ → Contact → Footer`, plus floating **ChatWidget**, **CommandPalette** (Ctrl/Cmd+K), **StatsWidget**, **BackToTop**, **SectionTracker**.

### API surface (~20 routes)
- **Public writes (rate-limited):** `POST /api/contact`, `/api/hire`, `/api/booking`, `/api/subscribe`, `/api/testimonials`, `/api/chat-history`, `/api/track`
- **Public reads:** `/api/github`, `/api/github/profile`, `/api/github/readme`, `/api/blog` + `/[slug]`, `/api/blog/rss`, `/api/stats`, `/api/testimonials`, `/api/booking/calendar` (`.ics`), `/api/resume` (HTML)
- **Admin (Bearer JWT):** `/api/admin/auth`, `/api/admin/analytics`, `/api/admin/content` (GET is public), `/api/admin/subscribers`, `/api/admin/testimonials`, plus admin GETs on contact/hire/booking

### Data model
`User, Post` (scaffold leftovers, unused) · `ContactMessage, HireRequest, ChatMessage, Subscriber, Testimonial, Article, Booking, Visit, SiteContent`

---

## 3. What's good

- **Clean, consistent design system.** One palette (sky #38bdf8 / pink #ec4899 / wood #b08968 / cream #faf8f5) applied via CSS variables with proper dark mode. Custom utilities (`transform-3d`, `perspective-2000`, `glass`, gradient text, custom scrollbar).
- **Thoughtful engineering in the backend.** Constant-time credential comparison, HS256 JWT verification, per-IP sliding-window rate limiting, input length caps, email regex validation, `Retry-After` headers, graceful GitHub fallback (verified live: `/api/github` returned `source: "fallback"` with curated projects when upstream failed), 5-min cache, no PII in analytics (referrer reduced to origin).
- **Real depth of functionality.** Booking → calendar email → `.ics` download; admin dashboard (analytics, bookings, testimonials moderation, subscriber export, content editor); anonymous section analytics with IntersectionObserver tracking; blog with TOC + reading progress; live GitHub integration; command palette; resume generator.
- **TypeScript is genuinely strict and clean** — `tsc --noEmit` passes with **zero errors** across ~8.5k lines of source.
- **Good defensive habits:** fire-and-forget analytics that never breaks UX, best-effort persistence from the chat service, `noopener noreferrer` on external links, markdown rendered as React elements (no `dangerouslySetInnerHTML`).
- **Well-documented** `worklog.md` (12 QA rounds) and `.env.example`; secrets correctly kept out of the app code (admin auth is env-driven, unlike what the worklog's stale "default key" text claims).

---

## 4. Findings (by severity)

### 🔴 High

**1. `npm start` can't work from the committed config — production build pipeline depends on a config that isn't committed.**
`package.json` → `"start": "NODE_ENV=production bun .next/standalone/server.js"`, and `.zscripts/build.sh` **injects** `output: "standalone"` into `next.config.ts` if the standalone server wasn't produced ("自愈" / self-heal, with a hard failure path). But the committed `next.config.ts` has **no `output: "standalone"`**, so a plain `next build` won't emit `.next/standalone/server.js`, and `npm run start` fails. The pipeline only works because the deploy script mutates the file at build time. The repo should commit `output: "standalone"` (or the start script should be `next start`).

**2. Real-time chat is Caddy-local, not production-portable — and the owner secret is hardcoded.**
The widget connects with `io("/?XTransformPort=3003")`, which relies on the on-prem **Caddy** rewrite rule. On plain Vercel there is no chat service and no such proxy, so the chat advertised in the hero/metadata ("chat in real-time") silently dead-ends. Separately, `mini-services/chat-service/index.ts` hardcodes `data?.key !== "yaseen-owner-2026"` as the "owner" auth — a committed shared secret that grants anyone with repo access the ability to impersonate Yaseen to every visitor (the owner UI isn't even in this repo, so the key grants a backdoor with no visible surface).

**3. Deployment DB mismatch: Postgres schema vs SQLite packaging pipeline.**
`prisma/schema.prisma` declares `provider = "postgresql"`, but `.zscripts/database-runtime-build.sh`, `start.sh`, and the tests assume `DATABASE_URL="file:/app/db/custom.db"` (SQLite) and run `prisma db push` against it. Prisma rejects `file:` URLs for a Postgres datasource, so the packaged-DB deployment path would fail; the `tests/` fake `bun` only simulates success. The two deployment stories (Vercel/Postgres vs FC/SQLite-embedded) are not reconciled.

### 🟠 Medium

**4. Lint is red — contrary to the worklog.**
`npm run lint` → **9 errors, all `react-hooks/set-state-in-effect`** (admin page ×2, command-palette ×2, achievement-stats, blog, projects, shadcn `carousel.tsx`, `use-mobile.ts`). Some are shadcn boilerplate, but several are the project's own `setLoading(true)`-in-`useEffect` patterns. `worklog.md` repeatedly claims "lint passes clean" — that's stale. (Build is unaffected, since ESLint doesn't gate it.)

**5. Mobile viewport is a forced "desktop mirror" (`width=1280`).**
`layout.tsx` exports `viewport: { width: 1280, initialScale: undefined }` — live HTML confirms `<meta name="viewport" content="width=1280"/>`. Phones render the full 1280px desktop layout scaled down (~0.4× on a 390px phone), so body text is physically tiny and tap targets shrink. Pinch-zoom stays enabled and the code comments explain this was a deliberate trade-off, but it's an accessibility/UX risk (WCAG 1.4.4 readability) and an outlier versus the mobile-first layout in the CSS (`sm:hidden` mobile cards exist, yet are unreachable on phones because the viewport is desktop-width).

**6. Untrusted input reaches a GitHub fetch and an RSS/render path.**
`/api/github/readme?repo=<...>` interpolates the user-controlled `repo` into `https://raw.githubusercontent.com/${username}/${repo}/...` without a repo allowlist (path traversal to `..` is partially mitigated by URL normalization, but an arbitrary repo name under `MrYaseen0` is still fetchable, and its raw content is returned to the browser). Also `GET /api/admin/content` is documented "public read" — fine — but its values feed the admin "content editor", not the public site. The custom markdown renderers (duplicated in `projects.tsx` and `blog.tsx`) render links without URL scheme validation (`javascript:` URLs are possible via `[x](javascript:...)` in README/article content).

**7. Analytics write amplification / unbounded growth.**
`/api/track` inserts one `Visit` row per section-intersection per session/per reload (verified in code; the hook fires on 50% visibility). There's no dedupe, no retention/cleanup job, and `/api/stats` aggregates with `count()` over the whole table. For a portfolio this is fine short-term, but the table grows unbounded and `visit.count()` gets slower.

**8. Admin auth storage & throttling are single-instance.**
JWT in `localStorage` (24h, no revocation) + in-memory rate-limiter (`new Map`) means: token theft isn't revocable, and on serverless each instance enforces its own 10/min login limit and 5/min form limits. Acceptable for a portfolio, worth documenting. Also `getClientIp()` trusts `X-Forwarded-For` blindly — behind Vercel this is set by the platform, but the limiter would be bypassable if the app is ever exposed directly.

### 🟡 Low

**9. Build depends on live Google Fonts.** `next/font/google` requires `fonts.googleapis.com` at build time. Verified in this sandbox: `npm run build` **fails** ("Failed to fetch Geist") because the font host isn't reachable, while npm and GitHub are; the dev server warns and falls back. Recommended to self-host (`next/font/local` or bundled woff2) — this also makes CI/offline builds deterministic.

**10. ~12 declared dependencies are unused** (verified by import scan): `@mdxeditor/editor`, `react-markdown`, `next-intl`, `date-fns`, `zustand`, `uuid`, `@dnd-kit/*`, `@tanstack/react-table`, `react-syntax-highlighter`, `@reactuses/core`, `@hookform/resolvers`, `z-ai-web-dev-sdk`, `tailwindcss-animate`. The heavy ones (`@mdxeditor/editor`, `react-markdown`) are especially wasteful since the app hand-rolls two markdown renderers instead. `node_modules` is ~967 MB.

**11. Dead config files.** `tailwind.config.ts` is a Tailwind v3 config whose `content` globs (`./pages`, `./components`, `./app`) don't match the real `src/` tree, and it isn't loaded under Tailwind v4 (`components.json` sets `"tailwind": { "config": "" }`, theme lives in `globals.css` `@theme`). Misleading but harmless.

**12. Content inconsistencies.** `stats`/hero/achievement-stats say **15+** projects; the resume route and several copy blocks say **50+** projects / **30+** clients / **1.2K stars** / **1K followers**. GitHub stars are also claimed statically even though live stars are fetched (currently 0). `portfolio-data.ts` says "Software Engineering Student" while the resume/hero say "Full-Stack Developer" — fine, but claims should be one source of truth.

**13. SEO is single-page only.** `robots.txt` exists (allows all), but there's **no `sitemap.ts`**, no per-article URLs (RSS `<link>` points to `/#blog`, GUID = slug), and no `metadataBase`/OG images configured (`openGraph` has no `images`). RSS is `force-static` with a 1h revalidate — if the build-time DB is unreachable, the feed is baked empty.

**14. Fresh-clone DX.** No `postinstall` `prisma generate`; a fresh `npm install && npm run dev` returns **500** on every DB route ("@prisma/client did not initialize yet") until `npx prisma generate` + `DATABASE_URL` are set. Route catch-all fallbacks don't cover client-initialization failure. (In this sandbox `prisma generate` also couldn't download its engine — TLS interception — so DB routes couldn't be end-to-end verified here.)

**15. "3D" is CSS, not WebGL.** No `three.js` dependency; the 3D feel comes from CSS `perspective`/`rotateX/Y` + Framer Motion. Fine, but the project is described as "3D motion portfolio" and the fallback repo blurb claims Three.js.

---

## 5. What I verified (live evidence)

| Check | Result |
|---|---|
| `tsc --noEmit` (strict) | ✅ 0 errors |
| `npm run lint` | ❌ 9 errors (`react-hooks/set-state-in-effect`) |
| `npm run build` | ❌ blocked only by Google Fonts fetch (Turbopack reached dependency compile; `tsconfig` excludes mini-services/examples) |
| Dev server `http://127.0.0.1:3000` | ✅ 200, viewport meta `width=1280` confirmed |
| `GET /api/github` | ✅ 200 `source: "fallback"` — graceful degradation works (upstream TLS-blocked in sandbox) |
| `GET /api/github/profile` | ✅ Correct 502 + error JSON on upstream failure |
| `GET /api/booking/calendar` | ✅ 200, valid `BEGIN:VCALENDAR … DTSTART … VALARM` |
| DB-backed routes (`/api/stats|blog|testimonials`) | ⚠️ 500 in sandbox (Prisma client ungenerated; needs local generate + DATABASE_URL) |
| `/admin`, `/robots.txt` | ✅ 200 |
| npm registry / GitHub reachability | ✅ (via curl) — only `fonts.googleapis.com` is blocked in this sandbox |

**Sandbox caveat:** the DB and Google Fonts couldn't be exercised here (TLS interception blocks Prisma's engine download and the font CDN; Node fetch is affected while curl is not). The DB-backed flows were verified in prior rounds per `worklog.md`; they should be re-verified against a real `DATABASE_URL`.

---

## 6. Recommendations (priority order)

1. **Commit `output: "standalone"`** in `next.config.ts` (or change `start` to `next start`) so the repo is deployable without the `.zscripts` self-heal mutation; also add `postinstall: "prisma generate"` for fresh-clone DX.
2. **Decide the chat story:** either (a) deploy the Socket.io service alongside the site (document the exact host/port, replace `/?XTransformPort=3003` with an env-driven `NEXT_PUBLIC_CHAT_URL`), or (b) remove the widget from production; **never** keep the hardcoded owner key — wire it to `AUTH_SECRET`-style env.
3. **Reconcile the DB:** pick Postgres everywhere (remove/update the SQLite `file:` packaging scripts and tests) or switch the schema to `sqlite`.
4. **Fix lint** (9 errors): the shadcn files can get targeted `eslint-disable` or be regenerated; the app files should move `setLoading`/`setQuery` out of synchronous effect bodies (or use `useSyncExternalStore`-style init).
5. **Remove the `width=1280` viewport override** and rely on the existing `sm:hidden` mobile layouts — or at minimum set `width=device-width` with `minimum-scale=1` and verify 16px+ body text on 390px.
6. **Trim dependencies** (~12 unused; especially `@mdxeditor/editor`, `react-markdown`, `next-intl`, `z-ai-web-dev-sdk`) and use `react-markdown` (already installed) instead of the two hand-rolled renderers; validate link schemes.
7. **Single source of truth for stats claims** (15+ vs 50+, 1.2K stars) and run a dedupe/cleanup strategy for `Visit` rows; add a `sitemap.ts` + OG image.
8. **Self-host the Geist fonts** to remove the build-time Google Fonts dependency.

---

## 7. Verdict

**7.5 / 10 — genuinely impressive single-page portfolio with production-minded engineering underneath.** The backend (auth, rate limiting, caching, fallbacks, analytics privacy) is notably more careful than typical AI-generated portfolios, and the UI work (puzzle photo reveal, glassmorphism, command palette, blog reader) is polished and cohesive. The main drag is **deployment inconsistency** (standalone config, chat service/Caddy coupling, Postgres-vs-SQLite pipeline) and a handful of **stale-worklog issues** (lint failures, dead deps, claim mismatches) that were lost between QA rounds. Fixing items 1–5 would take it to ~8.5–9/10.
