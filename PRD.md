# PRD — shortU

**Version:** 1.0.0
**Status:** In Development
**Last Updated:** 2026-08-21

---

## 1. What We're Building

A full-stack URL shortener and QR code generator web application. Users can shorten long URLs into compact slugs, generate QR codes from those shortened URLs, and optionally enable an interstitial ad page before redirecting visitors to the destination.

---

## 2. Who It's For

**Primary users:** Anyone who needs to share links cleanly — content creators, marketers, students, developers.

**Authenticated users** get a personal dashboard to manage their links, view analytics, and configure per-link behavior.

**Anonymous users** can shorten links without signing in, but their links are not persisted to an account.

---

## 3. Why We're Building It

A learning project that demonstrates a full production-grade TanStack Start fullstack app — from auth to database to deployment — while delivering a genuinely useful tool.

---

## 4. Core Features

### 4.1 URL Shortener

| Feature | Description |
|---|---|
| Random slug | Auto-generate a 7-character nanoid slug on submit |
| Custom slug | User can specify their own slug (validated for uniqueness and format) |
| Slug validation | Alphanumeric + hyphens only, 3–50 chars, no reserved words |
| Copy to clipboard | One-click copy of the shortened URL |
| Anonymous links | Links created without auth are ephemeral (session-scoped, not persisted to DB) |

### 4.2 QR Code Generator

| Feature | Description |
|---|---|
| Auto-generate | QR code is generated from the shortened URL on creation |
| Download | User can download the QR code as PNG |
| Preview | Live preview in the dashboard and creation flow |
| Storage | Stored as base64 string in the database |

### 4.3 Authentication

| Feature | Description |
|---|---|
| OAuth | Sign in with Google and/or GitHub via Better Auth |
| Session management | Better Auth handles session cookies and token refresh |
| Protected routes | Dashboard and link management require authentication |

### 4.4 Dashboard

| Feature | Description |
|---|---|
| Link list | Paginated list of all user's shortened links |
| Link detail | Slug, original URL, QR code, creation date, click count, ad toggle state |
| Delete link | Soft delete or hard delete |
| Toggle ad mode | Per-link switch to enable/disable interstitial ad page |

### 4.5 Interstitial Ad Page (Per-Link Toggle)

| Feature | Description |
|---|---|
| Toggle | Each link can independently enable or disable the ad page |
| Ad mode ON | Visitor lands on a branded interstitial page with a "Continue to URL" button; ad slot is displayed |
| Ad mode OFF | Visitor is redirected immediately (301) to the original URL |
| Design | Interstitial page shows the destination URL, a countdown or button, and an ad placement zone |

---

## 5. Out of Scope (v1)

- Custom domains (e.g. `short.mysite.com`)
- Link expiry / TTL
- Advanced analytics (device, country, referrer breakdown)
- Team/organization workspaces
- API access for external developers
- Bulk link import/export
- Password-protected links
- Email/password auth (OAuth only in v1)

---

## 6. User Flows

### 6.1 Shorten a URL (Authenticated)

```
Landing page
  → Enter URL + optional custom slug
  → Submit → server function creates link, generates QR
  → Success state: shows short URL + QR preview + copy button
  → Link appears in dashboard
```

### 6.2 Redirect Flow — Ad Mode OFF

```
Visitor hits /{slug}
  → Server loader looks up slug in DB
  → Throws redirect (301) to original URL
```

### 6.3 Redirect Flow — Ad Mode ON

```
Visitor hits /{slug}
  → Server loader looks up slug in DB
  → Renders interstitial page (/go/{slug})
  → Shows destination URL, ad slot, "Continue" button
  → On click → navigates to original URL
```

### 6.4 Dashboard Management

```
Authenticated user → /dashboard
  → Sees paginated link list
  → Can toggle ad mode per link (optimistic UI)
  → Can copy short URL
  → Can download QR code
  → Can delete link
```

---

## 7. Tech Decisions

| Decision | Choice | Reason |
|---|---|---|
| Framework | TanStack Start (Vite) | Full-stack with server functions; no separate backend needed for this scope |
| Data fetching | TanStack Query | Server function integration, optimistic updates, cache management |
| Database | Neon (PostgreSQL) | Serverless Postgres, generous free tier, Drizzle-compatible |
| ORM | Drizzle | Type-safe, lightweight, familiar from other projects |
| Auth | Better Auth | OAuth-first, TanStack Start adapter, session management built-in |
| UI primitives | shadcn with Base UI | Not Radix — Base UI primitives only |
| Slug generation | nanoid(7) | URL-safe, short, collision-resistant |
| QR generation | qrcode (npm) | Server-side, outputs base64/PNG, no external service dependency |
| Styling | Tailwind CSS v4 | Utility-first, consistent with shadcn |
| Runtime | Bun | Fast installs, fast test runner, consistent with other projects |
| Linting/Formatting | Biome | Replaces ESLint + Prettier, Bun-compatible |

---

## 8. Database Schema (Canonical)

```sql
-- users managed by Better Auth
users (id, email, name, image, created_at, updated_at)

-- shortened links
links (
  id          TEXT PRIMARY KEY,        -- nanoid
  user_id     TEXT REFERENCES users,   -- null = anonymous
  slug        TEXT UNIQUE NOT NULL,    -- the short code
  original_url TEXT NOT NULL,
  qr_code     TEXT,                    -- base64 data URL
  ad_enabled  BOOLEAN DEFAULT FALSE,
  click_count INTEGER DEFAULT 0,
  created_at  TIMESTAMP NOT NULL,
  updated_at  TIMESTAMP NOT NULL
)

-- click events (lightweight analytics)
clicks (
  id          TEXT PRIMARY KEY,
  link_id     TEXT REFERENCES links,
  clicked_at  TIMESTAMP NOT NULL,
  user_agent  TEXT
)
```

---

## 9. Non-Functional Requirements

- Redirect response time < 100ms (DB lookup is the only operation in the hot path)
- QR code generation happens at link creation time, not on every request
- No client-side secrets — all DB access through server functions
- All routes are type-safe end-to-end (TanStack Router file-based routing)

---

## 10. Success Criteria (v1)

- [ ] User can shorten a URL and get a working short link
- [ ] QR code is generated and downloadable
- [ ] OAuth sign-in works (Google and/or GitHub)
- [ ] Dashboard lists and manages user's links
- [ ] Ad mode toggle works per-link
- [ ] Redirect is fast and correct in both modes
- [ ] App builds and deploys without errors
