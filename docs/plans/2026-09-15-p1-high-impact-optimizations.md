# Phase 1: High-Impact Optimizations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Phase 1 high-impact performance, architecture, and UX upgrades for shortU: (1) in-memory/edge caching for redirect hot-paths, (2) on-demand QR code generation eliminating Postgres Base64 bloat, and (3) a dedicated branded 404 "Link Not Found" route.

**Architecture:** 
- Hot-path slug lookup caching via an in-memory TTL cache with cache-on-write invalidation, reducing database latency on `/$slug` redirects.
- QR generation transitioned to on-demand client/edge rendering via `qrcode` utility, removing `qr_code` storage from Postgres `links` table and keeping DB rows lightweight.
- Global and route-level 404 handling using TanStack Router's `notFoundComponent` and `notFound()` loader exceptions styled with DESIGN.md tokens.

**Tech Stack:** TanStack Router, TanStack Start, Drizzle ORM, Neon PostgreSQL, Biome, TypeScript strict mode, Bun test runner.

---

### Task 1: In-Memory / Edge Caching Layer for Slug Lookups (`getLinkBySlug`)

**Files:**
- Create: `src/server/cache/slug-cache.ts`
- Test: `src/server/cache/slug-cache.test.ts`
- Modify: `src/server/functions/links.ts`

**Step 1: Write the failing unit tests for slug cache**

Create `src/server/cache/slug-cache.test.ts`:
```ts
import { describe, expect, it, beforeEach } from "bun:test";
import {
  getCachedLink,
  setCachedLink,
  invalidateCachedLink,
  clearSlugCache,
  type CachedLinkData,
} from "./slug-cache";

describe("Slug Cache Layer", () => {
  beforeEach(() => {
    clearSlugCache();
  });

  it("returns undefined on cache miss", () => {
    expect(getCachedLink("nonexistent")).toBeUndefined();
  });

  it("stores and retrieves cached link data", () => {
    const mockLink: CachedLinkData = {
      id: "link-1",
      slug: "test-slug",
      originalUrl: "https://example.com",
      adEnabled: false,
      userId: "user-1",
      clickCount: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCachedLink("test-slug", mockLink);
    const cached = getCachedLink("test-slug");
    expect(cached).toBeDefined();
    expect(cached?.id).toBe("link-1");
    expect(cached?.originalUrl).toBe("https://example.com");
  });

  it("supports caching null for non-existent slugs to prevent repeated DB misses", () => {
    setCachedLink("missing-slug", null);
    const cached = getCachedLink("missing-slug");
    expect(cached).toBeNull();
  });

  it("invalidates specific slug entries", () => {
    const mockLink: CachedLinkData = {
      id: "link-2",
      slug: "to-delete",
      originalUrl: "https://example.com/delete",
      adEnabled: true,
      userId: null,
      clickCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCachedLink("to-delete", mockLink);
    expect(getCachedLink("to-delete")?.id).toBe("link-2");

    invalidateCachedLink("to-delete");
    expect(getCachedLink("to-delete")).toBeUndefined();
  });

  it("expires cached entries after TTL", async () => {
    const mockLink: CachedLinkData = {
      id: "link-3",
      slug: "short-lived",
      originalUrl: "https://example.com/expire",
      adEnabled: false,
      userId: null,
      clickCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCachedLink("short-lived", mockLink, 50); // 50ms TTL
    expect(getCachedLink("short-lived")?.id).toBe("link-3");

    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(getCachedLink("short-lived")).toBeUndefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test src/server/cache/slug-cache.test.ts`
Expected: FAIL (module not found).

**Step 3: Implement `src/server/cache/slug-cache.ts`**

Create `src/server/cache/slug-cache.ts`:
```ts
/**
 * In-memory TTL cache for slug lookups.
 * Speeds up redirect hot path (/$slug) and reduces Neon database roundtrips.
 * Preserves state across warm serverless/worker invocations.
 * Used by: src/server/functions/links.ts
 */

export interface CachedLinkData {
  id: string;
  slug: string;
  originalUrl: string;
  adEnabled: boolean;
  userId: string | null;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CacheEntry {
  data: CachedLinkData | null;
  expiresAt: number;
}

const DEFAULT_HIT_TTL_MS = 60 * 1000; // 60 seconds for active links
const DEFAULT_MISS_TTL_MS = 10 * 1000; // 10 seconds for null/missing links
const MAX_CACHE_SIZE = 5000;

const cache = new Map<string, CacheEntry>();

/**
 * Retrieves a cached link lookup by slug.
 * Returns undefined if entry does not exist or has expired.
 * Returns null if the slug was cached as non-existent (negative caching).
 */
export function getCachedLink(slug: string): CachedLinkData | null | undefined {
  const entry = cache.get(slug);
  if (!entry) return undefined;

  if (Date.now() > entry.expiresAt) {
    cache.delete(slug);
    return undefined;
  }

  return entry.data;
}

/**
 * Stores a link lookup in cache with specified TTL.
 */
export function setCachedLink(
  slug: string,
  data: CachedLinkData | null,
  ttlMs: number = data ? DEFAULT_HIT_TTL_MS : DEFAULT_MISS_TTL_MS
): void {
  // Evict oldest entry if size limit reached
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }

  cache.set(slug, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Invalidates a specific slug in cache (e.g. on update or deletion).
 */
export function invalidateCachedLink(slug: string): void {
  cache.delete(slug);
}

/**
 * Clears the entire cache (useful for tests or full invalidation).
 */
export function clearSlugCache(): void {
  cache.clear();
}
```

**Step 4: Integrate cache into `src/server/functions/links.ts`**

Update `getLinkBySlug`, `createLink`, `toggleAdMode`, and `deleteLink` in `src/server/functions/links.ts` to use `getCachedLink`, `setCachedLink`, and `invalidateCachedLink`.

**Step 5: Run tests and verify they pass**

Run: `bun test`
Expected: All tests PASS.

**Step 6: Commit**

```bash
git add src/server/cache/slug-cache.ts src/server/cache/slug-cache.test.ts src/server/functions/links.ts
git commit -m "feat(perf): add in-memory ttl caching layer for slug lookups"
```

---

### Task 2: Remove Base64 QR Bloat from Database & Transition to On-Demand QR Generation

**Files:**
- Modify: `src/lib/qr.ts`
- Modify: `src/server/db/schema.ts`
- Modify: `src/server/functions/links.ts`
- Modify: `src/components/qr-preview.tsx`
- Modify: `src/components/link-result.tsx`
- Modify: `src/components/link-card.tsx`
- Modify: `src/routes/dashboard.tsx`
- Generate: Drizzle migration via `bun db:generate`

**Step 1: Update `src/lib/qr.ts` with SVG and PNG generation helpers**

Update `src/lib/qr.ts`:
```ts
/**
 * QR code generation utility.
 * Generates PNG data URLs and vector SVG strings on-demand.
 * Can be safely called on client or server.
 * Used by: src/components/qr-preview.tsx, src/server/functions/links.ts
 */
import QRCode from "qrcode";

export interface QROptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

/**
 * Generates a base64-encoded PNG data URL from a URL string.
 */
export async function generateQR(url: string, options?: QROptions): Promise<string> {
  return QRCode.toDataURL(url, {
    width: options?.width ?? 300,
    margin: options?.margin ?? 2,
    color: {
      dark: options?.darkColor ?? "#000000",
      light: options?.lightColor ?? "#ffffff",
    },
  });
}

/**
 * Generates an SVG string from a URL string.
 */
export async function generateQRSvg(url: string, options?: QROptions): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    width: options?.width ?? 300,
    margin: options?.margin ?? 2,
    color: {
      dark: options?.darkColor ?? "#000000",
      light: options?.lightColor ?? "#ffffff",
    },
  });
}
```

**Step 2: Update `src/components/qr-preview.tsx` to accept `url` and generate dynamically**

Update `src/components/qr-preview.tsx`:
- Accept `url: string` (or `qrCode?: string` for backward-compatibility).
- Dynamically generate PNG data URL on mount/change if `url` is provided.
- Provide direct download button with loading state.

**Step 3: Update `src/components/link-result.tsx` and `src/components/link-card.tsx`**

- In `LinkResult`: Pass `url={result.shortUrl}` to `<QrPreview />`.
- In `LinkCard`: Render QR code button unconditionally (since any link can produce a QR code on-demand) and pass `url={shortUrl}` to `<QrPreview />`.

**Step 4: Update `src/server/db/schema.ts` to drop `qrCode` column & run migration**

In `src/server/db/schema.ts`:
- Remove `qrCode: text("qr_code")` from `links` table.
- Remove `qrCode` references in `createLink` insert and `CreateLinkInput`.

Run: `bun db:generate`
Expected: Migration generated.

**Step 5: Run tests and quality checks**

Run: `bun test && bun lint:fix && bun typecheck && bun run build`
Expected: Zero errors.

**Step 6: Commit**

```bash
git add src/lib/qr.ts src/components/qr-preview.tsx src/components/link-result.tsx src/components/link-card.tsx src/server/db/schema.ts src/server/functions/links.ts drizzle/
git commit -m "refactor(qr): switch to on-demand qr generation and remove database base64 bloat"
```

---

### Task 3: Branded 404 "Link Not Found / Expired" Route

**Files:**
- Create: `src/components/not-found-page.tsx`
- Modify: `src/routes/__root.tsx`
- Modify: `src/routes/$slug.tsx`
- Modify: `src/routes/go.$slug.tsx`
- Test: `src/components/not-found-page.test.tsx` or route tests

**Step 1: Write tests for NotFoundPage**

Create `src/components/not-found-page.test.tsx`:
```tsx
import { describe, expect, it } from "bun:test";
import { renderToString } from "react-dom/server";
import { NotFoundPage } from "./not-found-page";

describe("NotFoundPage Component", () => {
  it("renders 404 heading and friendly explanation", () => {
    const html = renderToString(<NotFoundPage />);
    expect(html).toContain("404");
    expect(html).toContain("Link not found or expired");
    expect(html).toContain("Shorten a New URL");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test src/components/not-found-page.test.tsx`
Expected: FAIL (component not found).

**Step 3: Implement `src/components/not-found-page.tsx`**

Create `src/components/not-found-page.tsx`:
- Designed with DESIGN.md tokens and Impeccable standards (no Inter default, terminal signature motif `> 404: SLUG_NOT_FOUND`, proper colors).
- Include action buttons: "Shorten a New URL" (links to `/`), "Go to Dashboard" (links to `/dashboard`).

**Step 4: Update `src/routes/__root.tsx`, `src/routes/$slug.tsx`, and `src/routes/go.$slug.tsx`**

- In `src/routes/__root.tsx`: Add `notFoundComponent: NotFoundPage` to `createRootRoute`.
- In `src/routes/$slug.tsx`: Replace `throw redirect({ to: "/" })` with `throw notFound()`.
- In `src/routes/go.$slug.tsx`: Replace `throw redirect({ to: "/" })` with `throw notFound()`.

**Step 5: Run tests and quality verification**

Run:
```bash
bun test
bun lint:fix
bun typecheck
bun run build
```
Expected: All tests pass, zero TypeScript errors, build succeeds.

**Step 6: Commit**

```bash
git add src/components/not-found-page.tsx src/components/not-found-page.test.tsx src/routes/__root.tsx src/routes/$slug.tsx src/routes/go.$slug.tsx
git commit -m "feat(ux): add branded 404 link not found page and replace silent redirects"
```

---

## Execution Handoff

After approval, execute task-by-task with strict quality checks.
