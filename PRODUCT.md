# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Creators, developers, marketers, and power users who need fast URL shortening, instant downloadable QR codes, click tracking, and optional interstitial ad monetization.

- **Anonymous Users:** Can shorten URLs and generate QR codes immediately on the landing page with zero friction.
- **Authenticated Users (Creators / Marketers):** Manage links in a persistent dashboard, view click analytics, customize slugs, download QR codes, and toggle per-link interstitial ad monetization.

## Product Purpose

A streamlined fullstack URL shortener and QR generator that turns long URLs into compact 7-character slugs with instant QR code generation, click count telemetry, and an optional interstitial ad monetization page per link.

## Positioning

Unlike bloated enterprise link shorteners or generic ad-heavy redirectors, shortU provides a developer-grade, warm-minimal utility with zero ads on standard links and a clean, creator-controlled interstitial option (`/go/$slug`) when ad mode is toggled on.

## Operating Context

- **Desktop & Mobile Web:** Responsive single-page landing with instant hero URL shortening, QR generation, and link copying.
- **Dashboard (`/dashboard`):** Clean management list for authenticated users showing slug, destination URL, QR download action, click count, and ad mode toggle.
- **Redirect Hot Path (`/$slug`):** Lean HTTP 301 direct redirect (when ad mode is OFF) or seamless route to `/go/$slug` (when ad mode is ON).
- **Interstitial View (`/go/$slug`):** Dedicated dark-surface landing page displaying destination URL, ad placeholder slot, and "Continue" button.

## Capabilities and Constraints

- **Capabilities:**
  - 7-character nanoid URL shortening with custom slug support (alphanumeric and hyphens, 3–50 chars, reserved keywords checked).
  - Server-side high-resolution QR code generation (base64 PNG data URL).
  - Fire-and-forget click tracking with user-agent logging.
  - Per-link ad mode switch with optimistic UI updates.
  - OAuth authentication via Google and GitHub with Better Auth.
- **Constraints:**
  - Database access restricted entirely to server functions — zero client-side direct database queries.
  - Strict typing and Biome formatting.
  - Base UI primitives for shadcn components (strictly no `@radix-ui/*`).

## Brand Commitments

- **Name:** shortU
- **Aesthetic Tone:** Warm-light canvas (`#fafaf7`) with high-contrast ink (`#0f1117`), monospace terminal outputs (`JetBrains Mono`) for the shortened slug and QR code result moment, and muted indigo accent (`#5c6bc0`).
- **Personality:** Quiet, considered utility everywhere; visual identity shines at the terminal-styled result readout.

## Evidence on Hand

- `PRD.md`: Full product requirements and technical architecture specification.
- `DESIGN.md`: Complete design system tokens, color palettes, typography scale, component specs, and dark mode contracts.
- `AGENTS.md`: Code conventions, server function contracts, database schema, and UI rules.

## Product Principles

1. **Instant Utility First:** The landing page allows immediate shortening without registration or unnecessary steps.
2. **Creator Control Over Monetization:** Interstitial ad mode is strictly opt-in per link, keeping default redirects clean and fast (301 HTTP).
3. **High-Contrast Terminal Craft:** The result state is a distinct terminal-inspired readout celebrating the created link and QR code.
4. **Resilient Server-Side Architecture:** Zero client-side credentials or direct database connections; all operations pass through validated server functions.

## Accessibility & Inclusion

- WCAG AA compliant contrast on all interactive states and text.
- Keyboard accessible forms, accessible button focus rings (`--ring`), and semantic HTML throughout.
- High-contrast white backing on all rendered QR codes to ensure reliable camera scanning.
