# Yaseen Ahmad — 3D Animated Portfolio

A full-stack, real-time interactive portfolio for **Yaseen Ahmad** (Full-Stack Developer, Peshawar, Pakistan). Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui, with a **real WebGL 3D** hero scene (react-three-fiber), live GitHub projects, real-time chat, blog, booking with calendar export, visitor analytics and an admin dashboard.

## Features

- 🎨 Sky / pink / wood / cream design system with dark mode
- 🌐 Real WebGL 3D hero (animated torus knot + particle field + mouse parallax) with CSS fallback
- 🧩 Animated puzzle-photo reveal, tilt cards, command palette (Ctrl/Cmd+K)
- 📦 Live GitHub repos + profile + README previews (5-min cache, curated fallback)
- 💬 Real-time chat (Socket.io mini-service) with typing indicators & history
- 📝 Blog CMS with markdown reader, TOC, reading progress, RSS
- 📅 Consultation booking with `.ics` calendar export
- 📊 Anonymous visitor analytics (session-deduped, no PII)
- 🛡️ Admin dashboard (`/admin`): analytics, bookings, testimonials moderation, subscribers, content editor
- ✉️ Contact / hire / newsletter / testimonials forms (rate-limited)

## Stack

Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS 4 · shadcn/ui · Framer Motion · Three.js / react-three-fiber / drei · Prisma 6 (PostgreSQL) · Socket.io · custom HS256 JWT auth

## Getting started

```bash
npm install            # postinstall runs `prisma generate` (offline-safe)
cp .env.example .env   # set DATABASE_URL, AUTH_SECRET, ADMIN_*, GITHUB_TOKEN
npm run db:setup       # prisma generate + prisma db push
npm run dev            # http://localhost:3000
```

### Chat service (optional, local)

```bash
cd mini-services/chat-service
bun install
CHAT_OWNER_KEY="$(openssl rand -hex 32)" APP_URL="http://localhost:3000" bun start
```

The widget connects to `NEXT_PUBLIC_CHAT_URL` when set; otherwise it uses the on-prem Caddy gateway path (`/?XTransformPort=3003`).

## Environment variables

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string (**required**) |
| `GITHUB_TOKEN` | Optional read-only token (raises API limit) |
| `AUTH_SECRET` | JWT signing secret (**required** for `/admin`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` | Admin credentials (SHA-256 hash of password) |
| `NEXT_PUBLIC_CHAT_URL` | Public chat service URL (optional) |
| `CHAT_OWNER_KEY` | Chat owner secret (**required in production** for the chat service) |
| `APP_URL` | Base URL the chat service uses to persist messages |

## Scripts

`dev` · `build` (standalone output for `npm run start`) · `lint` · `db:generate` · `db:push` · `db:migrate` · `db:setup`

## Deployment

- **Vercel:** set the env vars above, add Postgres (Supabase/Neon), deploy. Chat/analytics need a persistent server or an external service.
- **Self-hosted (function-compute image):** `.zscripts/` + `Caddyfile` provide the gateway; `DATABASE_URL` must be `postgres://…` (schema is PostgreSQL). Legacy `file:` SQLite packaging remains supported by the scripts if the datasource is ever switched.

## Security notes

- Admin auth: env credentials → constant-time compare → 24h HS256 JWT verified server-side on every private route; tokens re-validated by the client on load (never trusted by format alone).
- Rate limiting on all public write endpoints (in-memory per instance).
- Markdown (READMEs, articles) rendered with `react-markdown`; `javascript:`/`data:` links are rewritten to `#`.
- `repo` query param is validated against GitHub naming rules before URL interpolation.
- Analytics records section + origin only; deduped once per section per session.

## License

Private / portfolio project — all content © Yaseen Ahmad.
