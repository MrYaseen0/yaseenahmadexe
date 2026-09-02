# Fix Plan — Portfolio Hardening + Real 3D Upgrade

Companion to `ANALYSIS.md`. Every flaw from the analysis is tracked below with its final status.
Legend: ✅ done · ⚠️ done in code, env-dependent at runtime

---

## Phase 1 — Ship-breakers & correctness (HIGH)

| # | Issue | Fix | Status |
|---|-------|-----|--------|
| 1 | `npm start` broken: no `output: "standalone"` in `next.config.ts` | Committed `output: "standalone"` + security headers | ✅ |
| 2 | Chat only works behind Caddy; no env-driven URL | `NEXT_PUBLIC_CHAT_URL` env; legacy Caddy path kept as fallback | ✅ |
| 3 | Hardcoded owner key `yaseen-owner-2026` in chat service | `CHAT_OWNER_KEY` env, constant-time compare, fail-closed in production (verified: wrong key → rejected, right key → owner-ready) | ✅ |
| 4 | Postgres schema vs SQLite packaging scripts | Provider-aware `.zscripts` + fail-early startup; legacy `file:` path kept | ✅ |
| 5 | Chat service persistence calls `localhost:3000` | Env-driven `APP_URL` with safe default | ✅ |

## Phase 2 — Real 3D animated portfolio

| # | Feature | Status |
|---|---------|--------|
| 6 | Install `three` + `@react-three/fiber` + `@react-three/drei` | ✅ |
| 7 | 3D hero scene: animated distorted torus knot + orbiting gems + sparkles + starfield + mouse parallax (`ssr:false`, lazy-loaded, low dpr) | ✅ |
| 8 | Glow orb CSS fallback when WebGL unavailable / reduced motion | ✅ |
| 9 | No SSR/hydration breakage; hero buttons stay clickable (`pointer-events-none` canvas) | ✅ |

## Phase 3 — Stack quality & security (MED)

| # | Issue | Fix | Status |
|---|-------|-----|--------|
| 10 | Lint red (9 × `react-hooks/set-state-in-effect`) | Refactored all 9 sites to rule-compliant patterns (canonical `.then` fetch effects, lazy init, rAF callbacks) — `npm run lint` clean | ✅ |
| 11 | Forced `width=1280` mobile viewport | Restored `width=device-width, initial-scale=1` (verified in rendered HTML) | ✅ |
| 12 | Unvalidated `repo` param in README route | GitHub name regex `^[A-Za-z0-9._-]{1,100}$` (verified: `..%2F..%2Fetc` → 400) | ✅ |
| 13 | Hand-rolled markdown renderers | Shared `react-markdown` renderer; `javascript:`/`data:` links rewritten to `#`; external links + noopener | ✅ |
| 14 | Analytics writes ×reloads (unbounded growth) | Session-scoped dedupe (`sessionStorage` + in-memory Set) | ✅ |
| 15 | Admin token trusted by format only | Client verifies token against `/api/admin/auth` on load; invalid → cleared | ✅ |
| 16 | Inconsistent stats claims (15+ vs 50+) | `keyStats` single source of truth in `portfolio-data.ts`; hero + resume read it | ✅ |
| 17 | No sitemap / OG image / `metadataBase` | `sitemap.ts`, `metadataBase`, generated `og.png` (verified in HTML + 200) | ✅ |
| 18 | Build depends on Google Fonts | Self-hosted via official `geist` package (`next/font` local) — build no longer calls fonts.googleapis.com | ✅ |
| 19 | ~12 unused deps + dead `tailwind.config.ts` | Removed unused packages + dead config (kept `react-markdown`, now used) | ✅ |
| 20 | Fresh-clone 500s: no Prisma generate step | `postinstall` generate + `db:setup` script + full README | ✅ |

## Phase 4 — Verification & shipping

| # | Action | Result |
|---|--------|--------|
| 21 | `tsc --noEmit` (strict) | ✅ 0 errors |
| 22 | `npm run lint` | ✅ 0 errors / 0 warnings |
| 23 | `next build` | ✅ all 25 routes compiled, self-hosted fonts, standalone server emitted |
| 24 | Runtime smoke (dev server) | ✅ `/`, `/sitemap.xml`, `/robots.txt`, GitHub (202 with fallback), `.ics`, `/api/resume`, `og.png`, hero3d chunk 200 |
| 25 | Chat service auth smoke | ✅ fail-closed without key; owner rejected/approved correctly |
| 26 | Push to GitHub + PR | ✅ branch `arena/01a06117-yaseenahmadexe` |

## Environment notes (not code bugs)
- **Prisma engine download is blocked in this sandbox** (`binaries.prisma.sh` TLS), so `prisma generate` cannot run locally; the production build was verified with a temporary mock DB module (restored after — real `db.ts` untouched). DB-backed flows need a real `DATABASE_URL` + `prisma generate` on a normal network (Vercel/FC run this via `postinstall`).
- The FC `start.sh` now requires `DATABASE_URL` (`postgres://` for this schema) or a packaged `file:` DB and fails fast otherwise — set the env var in the deployment.
