// Seed blog articles into the database
import { db } from "../src/lib/db";

const articles = [
  {
    slug: "building-scalable-saas-nextjs",
    title: "Building Scalable SaaS Applications with Next.js 16",
    excerpt:
      "A deep dive into architecting production-grade SaaS products using Next.js App Router, server actions, and multi-tenant database design patterns.",
    content: `# Building Scalable SaaS Applications with Next.js 16

When I started building SaaS products, I quickly learned that the architecture decisions you make on day one determine whether your app can handle 100 users or 100,000 users.

## The Foundation: Next.js App Router

Next.js 16's App Router is a game-changer for SaaS applications. The server-first approach means you can:

- Render pages on the server for fast initial loads
- Use Server Components to keep your client bundle small
- Leverage streaming and suspense for progressive page loading

## Multi-Tenant Database Design

The most critical decision in a SaaS app is how you isolate tenant data. I've used three patterns:

### 1. Shared Database, Shared Schema
Every row has a \`tenantId\` column. Simplest to implement, but requires careful querying to avoid data leaks.

### 2. Shared Database, Separate Schemas
Each tenant gets their own PostgreSQL schema. Good isolation without the overhead of separate databases.

### 3. Database-per-Tenant
Maximum isolation, but complex to manage migrations across hundreds of databases.

For most SaaS apps starting out, **pattern 1 with row-level security** is the sweet spot.

## Authentication & Authorization

I use NextAuth.js v4 with a custom JWT strategy. The key is to include the \`tenantId\` and \`role\` in the token so you can authorize on the server without extra DB queries.

\`\`\`typescript
const token = {
  sub: user.id,
  tenantId: user.tenantId,
  role: user.role,
  email: user.email,
};
\`\`\`

## Payment Integration

Stripe is the industry standard. I implement:

1. **Checkout Sessions** for one-time payments
2. **Subscriptions** with webhook handlers for lifecycle events
3. **Customer Portal** so users can manage their own billing

The webhook handler is critical — it's the source of truth for subscription status.

## Deployment & Scaling

Deploy on Vercel for automatic scaling, or use Docker on AWS for more control. I always set up:

- CDN for static assets
- Redis for session caching and rate limiting
- Database connection pooling
- Health check endpoints

## Conclusion

Building SaaS is a marathon, not a sprint. Start simple, measure everything, and refactor when the data tells you to. The architecture I've outlined has served me well across 3+ production SaaS products.`,
    tags: "Next.js,SaaS,Architecture,TypeScript",
    coverColor: "sky",
    readTime: 8,
    featured: true,
  },
  {
    slug: "typescript-best-practices-2026",
    title: "TypeScript Best Practices I Wish I Knew Earlier",
    excerpt:
      "Practical TypeScript patterns for building maintainable web applications — from type narrowing to branded types and everything in between.",
    content: `# TypeScript Best Practices I Wish I Knew Earlier

After 3+ years of full-time TypeScript development, here are the patterns that have saved me the most time and prevented the most bugs.

## 1. Use Branded Types for Domain Primitives

A \`UserId\` and a \`PostId\` are both strings, but they're not interchangeable. Branded types prevent this class of bug:

\`\`\`typescript
type Brand<T, B> = T & { __brand: B };
type UserId = Brand<string, "UserId">;
type PostId = Brand<string, "PostId">;

function getUser(id: UserId) { ... }
getUser("123" as PostId); // TypeError!
\`\`\`

## 2. Discriminated Unions Over Optional Fields

Don't do this:
\`\`\`typescript
type Response = { status: "success"; data?: any; error?: string };
\`\`\`

Do this instead:
\`\`\`typescript
type Response =
  | { status: "success"; data: any }
  | { status: "error"; error: string };
\`\`\`

The compiler will force you to handle each case correctly.

## 3. Use \`satisfies\` for Configuration Objects

The \`satisfies\` operator (TS 4.9+) lets you validate a value matches a type without widening it:

\`\`\`typescript
const config = {
  port: 3000,
  host: "localhost",
} satisfies AppConfig;
\`\`\`

## 4. Exhaustiveness Checking

Always add a default case that uses \`never\`:

\`\`\`typescript
function handle(status: Status) {
  switch (status) {
    case "loading": return ...;
    case "success": return ...;
    case "error": return ...;
    default:
      const _exhaustive: never = status;
      throw new Error(\`Unhandled: \${_exhaustive}\`);
  }
}
\`\`\`

If you add a new status later, TypeScript will error until you handle it.

## 5. Utility Types Are Your Friends

- \`Pick<T, K>\` and \`Omit<T, K>\` for deriving types
- \`Partial<T>\` for update operations
- \`Readonly<T>\` for immutable data
- \`ReturnType<T>\` for function return types

## Conclusion

TypeScript's type system is incredibly powerful. The more you lean into it, the more bugs the compiler catches before runtime. These patterns have become second nature, and I can't imagine building production apps without them.`,
    tags: "TypeScript,Best Practices,Web Development",
    coverColor: "pink",
    readTime: 6,
    featured: true,
  },
  {
    slug: "realtime-features-socketio",
    title: "Implementing Real-Time Features with Socket.io",
    excerpt:
      "How I built a real-time chat system with typing indicators, online presence, and message persistence — the same tech powering this portfolio's chat widget.",
    content: `# Implementing Real-Time Features with Socket.io

Real-time features make web apps feel alive. In this article, I'll walk through the architecture behind the chat widget on this very portfolio.

## Why Socket.io?

Socket.io provides a thin abstraction over WebSockets with:
- Automatic reconnection
- Fallback to long-polling
- Rooms and namespaces for message routing
- Built-in acknowledgment callbacks

## Architecture Overview

My chat service runs as a separate Node.js/Bun process on port 3003. The Next.js frontend connects via the Caddy gateway with \`XTransformPort\` query parameter.

\`\`\`
Browser → Caddy (port 81) → Chat Service (port 3003)
\`\`\`

## Key Features Implemented

### 1. Session-Based Rooms
Each visitor gets a unique session ID stored in localStorage. When they connect, they join a room named \`session:<id>\`.

### 2. Typing Indicators
Broadcast a \`typing\` event with a debounce. The receiver shows animated dots.

### 3. Online Presence
The server tracks \`io.engine.clientsCount\` and broadcasts \`online-count\` events on connect/disconnect.

### 4. Message Persistence
Messages are POSTed to the Next.js API, which stores them in SQLite via Prisma. History is sent on reconnect.

## Common Pitfalls

1. **Don't trust the client** — validate all messages server-side
2. **Rate limit** — prevent spam with per-connection message limits
3. **Handle disconnects gracefully** — clean up rooms and buffers
4. **Use refs, not state** — in React, store the socket in a ref to avoid re-renders

## Production Considerations

- Use sticky sessions if running multiple server instances
- Set up a Redis adapter for horizontal scaling
- Monitor connection counts and memory usage
- Implement graceful shutdown to drain connections

## Conclusion

Real-time features add significant value to web apps. With Socket.io, the implementation is straightforward — the complexity is in the edge cases around disconnection, persistence, and scaling.`,
    tags: "Socket.io,Real-time,WebSocket,Node.js",
    coverColor: "wood",
    readTime: 7,
    featured: false,
  },
  {
    slug: "database-design-prisma",
    title: "Database Design Patterns with Prisma ORM",
    excerpt:
      "From schema design to migrations — practical patterns for building robust data layers with Prisma and PostgreSQL/SQLite.",
    content: `# Database Design Patterns with Prisma ORM

Prisma has become my go-to ORM for TypeScript projects. Here's how I structure schemas for maintainability and performance.

## Schema Organization

Split your schema into logical domains. Prisma supports multiple models in one file, but I organize them with clear comment headers:

\`\`\`prisma
// ===== Auth Domain =====
model User { ... }
model Session { ... }

// ===== Billing Domain =====
model Subscription { ... }
model Invoice { ... }
\`\`\`

## Indexing Strategy

Always index:
- Foreign keys (Prisma does this automatically)
- Fields used in \`where\` clauses
- Sort fields (\`orderBy\`)
- Composite indexes for common query patterns

\`\`\`prisma
model Article {
  ...
  @@index([published, createdAt])
}
\`\`\`

## Relations

Prisma makes relations easy, but be careful with:
- **Cascading deletes** — use \`onDelete: Cascade\` carefully
- **Optional vs required relations** — affects whether you can create orphan records
- **Many-to-many** — Prisma handles the join table automatically

## Migrations

In development, use \`prisma db push\` for rapid iteration. In production:
1. Generate a migration: \`prisma migrate dev --name add_articles\`
2. Review the generated SQL
3. Test on a staging database
4. Deploy with \`prisma migrate deploy\`

## Common Patterns

### Soft Deletes
Add a \`deletedAt\` field and filter it in your queries. Or use a Prisma middleware.

### Audit Logging
Create an \`AuditLog\` model and write to it in a transaction with every mutation.

### Multi-tenancy
Add a \`tenantId\` to every model and enforce it with a Prisma extension.

## Conclusion

Prisma's type safety and declarative schema make database work enjoyable. The key is to think carefully about your access patterns before designing the schema — not after.`,
    tags: "Prisma,Database,PostgreSQL,SQLite",
    coverColor: "sky",
    readTime: 6,
    featured: false,
  },
  {
    slug: "tailwind-css-pro-tips",
    title: "Tailwind CSS Pro Tips for Beautiful UIs",
    excerpt:
      "Advanced Tailwind techniques including custom utilities, responsive patterns, and the design system powering this portfolio.",
    content: `# Tailwind CSS Pro Tips for Beautiful UIs

Tailwind CSS 4 has transformed how I build UIs. Here are the techniques I used to build this portfolio.

## Custom Theme with CSS Variables

Define your brand colors as CSS variables, then map them in \`@theme\`:

\`\`\`css
:root {
  --sky: #38bdf8;
  --pink: #ec4899;
  --wood: #b08968;
}
@theme inline {
  --color-sky: var(--sky);
  --color-pink: var(--pink);
}
\`\`\`

Now \`bg-sky\`, \`text-pink\`, etc. work everywhere.

## Glassmorphism

\`\`\`css
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.6);
}
\`\`\`

## 3D Perspective Cards

\`\`\`css
.perspective-1000 { perspective: 1000px; }
.transform-3d { transform-style: preserve-3d; }
\`\`\`

Then use JavaScript to track mouse position and apply \`rotateX\`/\`rotateY\`.

## Gradient Text

\`\`\`css
.text-gradient {
  background: linear-gradient(120deg, #0ea5e9, #ec4899);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
\`\`\`

## CSS-Only Entrance Animations

Don't rely solely on Framer Motion. CSS keyframes are more reliable:

\`\`\`css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.delay-200 { animation-delay: 0.2s; }
\`\`\`

## Responsive Patterns

- Mobile-first: write base styles, then \`sm:\`, \`md:\`, \`lg:\` overrides
- Use \`container mx-auto max-w-7xl px-4 sm:px-6\` for consistent gutters
- \`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3\` for responsive grids

## Custom Scrollbar

\`\`\`css
::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #38bdf8, #ec4899);
  border-radius: 8px;
}
\`\`\`

## Conclusion

Tailwind's utility-first approach combined with custom CSS gives you the best of both worlds — rapid development with full design control. The key is building a reusable set of utility classes for your common patterns.`,
    tags: "Tailwind CSS,Design,CSS",
    coverColor: "pink",
    readTime: 5,
    featured: false,
  },
  {
    slug: "freelance-developer-journey",
    title: "My Journey as a Freelance Developer in Pakistan",
    excerpt:
      "Lessons learned building 50+ projects as a freelance full-stack developer from Peshawar — from finding clients to delivering quality work.",
    content: `# My Journey as a Freelance Developer in Pakistan

Three years ago, I started freelancing from Peshawar with nothing but a laptop and determination. Here's what I've learned.

## Starting Out

My first client paid $50 for a landing page. I spent a week on it. Today, that same project would take me a day. The difference? Experience and a reusable component library.

## Finding Clients

### Where I Find Work
1. **Upwork & Fiverr** — good for building initial reviews
2. **LinkedIn** — share your work, clients will find you
3. **GitHub** — open source contributions build credibility
4. **Word of mouth** — happy clients refer others
5. **This portfolio** — a professional website is your best salesperson

### The Proposal That Wins
- Address the client's specific problem
- Show relevant work (not all your work)
- Include a timeline estimate
- Ask a thoughtful question about their project

## Pricing Strategy

I started at $15/hour. Today my rate is $50-80/hour depending on complexity. The key lessons:

1. **Don't compete on price** — compete on value
2. **Charge for outcomes, not hours** — fixed-price projects are better for both parties
3. **Raise rates with every 5 projects** — demand will tell you when
4. **Have a minimum** — turn down work below your floor

## Communication Is Everything

Technical skill gets you hired. Communication gets you rehired.

- Respond within 4 hours during business hours
- Send weekly progress updates
- Use Loom videos for complex explanations
- Be honest about delays — clients respect transparency

## Delivering Quality

1. **Write clean code** — your name is on it
2. **Test before delivery** — never ship broken work
3. **Document everything** — READMEs, comments, deployment guides
4. **Offer 30 days free support** — builds trust and reduces disputes

## Working with International Clients

From Pakistan, I face challenges: payment gateways, time zones, and perception. Solutions:

- **Payments**: Wise, Payoneer, Direct bank transfer
- **Time zones**: I work 9 AM – 9 PM PKT, overlapping with both EU mornings and US evenings
- **Perception**: A professional portfolio, GitHub presence, and clear communication overcome any bias

## Building a Personal Brand

This portfolio is a key part of my strategy. Every project I ship, every article I write, every open-source contribution builds my brand. The goal is for clients to come to me, not the other way around.

## Conclusion

Freelancing from Pakistan has its challenges, but the internet makes the world flat. With skill, communication, and persistence, you can build a thriving career from anywhere. If you're starting out, focus on delivering one excellent project — the rest will follow.`,
    tags: "Freelance,Career,Pakistan,Business",
    coverColor: "wood",
    readTime: 7,
    featured: true,
  },
];

async function main() {
  console.log("Seeding articles...");
  for (const article of articles) {
    const existing = await db.article.findUnique({
      where: { slug: article.slug },
    });
    if (existing) {
      console.log(`  ✓ ${article.slug} (already exists)`);
      continue;
    }
    await db.article.create({ data: article });
    console.log(`  + ${article.slug} (created)`);
  }
  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
