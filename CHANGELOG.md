# CHANGELOG

## [0.2.0] — Unreleased

### Added
- Cloudflare Workers deployment (`@cloudflare/vite-plugin`, `wrangler.jsonc`, pinned dependencies)
- Dashboard telemetry metrics (total links, total clicks, monetized links), search/filter bar, skeleton loaders, and empty states
- Link card redesign: destination favicon (`@unpic/react`), compact two-line layout (short URL + copy + icon-only click badge over destination URL), desktop inline actions vs. 3-dot popover menu below desktop width
- Delete confirmation via `AlertDialog` with destructive action button
- QR code viewing via `ResponsiveOverlay` (Drawer on mobile / Dialog on tablet-desktop) with PNG download
- `ui/popover.tsx` — Base UI anchored floating menu primitive
- `ui/alert-dialog.tsx` — Base UI destructive-action confirmation primitive
- `orientation` prop on `OAuthButtons` (`"vertical"` default | `"horizontal"`) — hero uses horizontal layout
- `src/server/auth/session.ts` — plain `getCurrentSession()` module helper

### Changed
- All internal and external links use TanStack Router `Link` instead of native anchors; images use `@unpic/react` `Image` instead of native `<img>` (AGENTS.md §10)
- Shorten flow unified into `ShortenDialog` (TanStack Form + Zod via `~/lib/schema`) rendered through the shared `ResponsiveOverlay` shell
- Session access moved from a server function to the plain helper `~/server/auth/session.ts`

### Fixed
- Click tracking silently failing: `db.transaction()` is unsupported by the `drizzle-orm/neon-http` driver — replaced with atomic `db.batch([insert, update])`
- Production submit failure caused by an unregistered `getSession` server function (Vite plugin does not register functions unreachable from the client route graph)

---

## [0.1.0] — Unreleased

### Added
- Initial project scaffold (TanStack Start + Bun)
- Drizzle ORM configured with Neon PostgreSQL
- Better Auth configured with Google and GitHub OAuth
- shadcn initialized with Base UI primitives
- Biome configured for linting and formatting
- Full folder structure per AGENTS.md
- Utility files: cn, formatDate, truncateUrl, generateQR, generateSlug, validateSlug
- DESIGN.md design system
- PRD.md product requirements
- AGENTS.md agent conventions
