# shortU

A full-stack URL shortener and QR code generator. Turn long URLs into 7-character slugs, get an instant downloadable QR code, track clicks, and optionally enable a per-link interstitial ad page (`/go/$slug`) for monetization.

## Features

- **Instant shortening** — anonymous users can shorten URLs from the landing page with zero friction
- **QR codes** — server-side generated PNG with one-click download
- **Click analytics** — per-link click counter plus lightweight click-event telemetry
- **Ad monetization** — opt-in interstitial ad page per link with countdown and pause control
- **Custom slugs** — 3–50 chars, lowercase alphanumeric + hyphens, reserved-word protection
- **OAuth sign-in** — Google and GitHub via Better Auth; authenticated users manage links in a dashboard
- **Responsive UI** — warm-light/dark theme, adaptive Drawer/Dialog overlays, mobile-first layouts

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | TanStack Start (Vite) + TanStack Router/Query/Form |
| Database | Neon PostgreSQL + Drizzle ORM |
| Auth | Better Auth (Google / GitHub OAuth) |
| UI | shadcn on Base UI primitives, Tailwind CSS v4 |
| QR generation | `qrcode` (server-side) |
| Runtime | Bun · Biome lint/format · TypeScript strict |
| Deployment | Cloudflare Workers |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1+
- A [Neon](https://neon.tech/) Postgres database
- Google and GitHub OAuth app credentials

### Setup

1. Install dependencies:

```bash
bun install
```

2. Create `.env` in the project root:

```bash
DATABASE_URL=             # Neon PostgreSQL connection string
BETTER_AUTH_SECRET=       # Random secret for Better Auth
BETTER_AUTH_URL=          # App base URL (e.g. http://localhost:3000)

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

3. Push the schema to your database:

```bash
bun db:push
```

4. Start the dev server:

```bash
bun dev
```

## Scripts

```bash
# Development
bun dev                   # Start dev server

# Database
bun db:generate           # Generate Drizzle migrations from schema
bun db:push               # Push schema to Neon (dev only)
bun db:migrate            # Run migrations
bun db:studio             # Open Drizzle Studio

# Code quality
bun lint                  # Biome lint check
bun lint:fix              # Biome lint with auto-fix
bun format                # Biome format
bun typecheck             # tsc --noEmit
bun test                  # Run all tests

# Build & deploy
bun run build             # Production build (Cloudflare Workers target)
bun run preview           # Preview production build locally
bun run deploy            # Deploy to Cloudflare Workers via wrangler
```

## Architecture

Full conventions live in [AGENTS.md](./AGENTS.md); design tokens in [DESIGN.md](./DESIGN.md); product scope in [PRD.md](./PRD.md).

```
src/
├── routes/               # File-based routing
│   ├── index.tsx         # Landing — hero shorten form
│   ├── dashboard.tsx     # Link management (auth required)
│   ├── $slug.tsx         # 301 redirect hot path
│   └── go.$slug.tsx      # Interstitial ad page
├── server/
│   ├── auth/session.ts   # getCurrentSession() helper
│   ├── db/               # Drizzle client + canonical schema
│   └── functions/        # Server functions (all DB access lives here)
├── components/
│   ├── ui/               # Base UI primitives (Card, Dialog, Drawer, Popover, …)
│   │   └── responsive-overlay.tsx   # Drawer(<768px)/Dialog(≥768px) modal shell
│   └── ...               # Feature components (link-card, shorten-dialog, …)
├── hooks/
└── lib/                  # auth clients, qr, slugify, utils, zod schemas
```

Key rules:

- **All database access happens inside server functions** — nothing touches the DB client-side.
- The Neon HTTP driver does not support transactions; multi-statement writes use `db.batch()`.
- All modal surfaces render through the shared `ResponsiveOverlay` shell.

## Deployment

The app deploys to **Cloudflare Workers** via git-integrated Workers Builds (or manually):

```bash
bun run deploy
```

`wrangler.jsonc` targets the TanStack Start server entry with `nodejs_compat`. Set all environment variables as Worker secrets before deploying.

## License

Private project — all rights reserved.
