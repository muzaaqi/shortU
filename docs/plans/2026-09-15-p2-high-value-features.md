# Phase 2: High-Value Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Phase 2 high-value product enhancements for shortU: (1) customizable vector SVG & color-themed QR generator studio, (2) link expiration by time-to-live (TTL) and max-click limits, and (3) dashboard 7-day click telemetry sparkline chart.

**Architecture:**
- **QR Customizer Studio:** Pure client-side SVG/PNG canvas renderer in `QrPreview` with preset brand color swatches and instant vector SVG / high-res PNG download.
- **Link Expiration & Ephemeral Links:** Database columns `expires_at` and `max_clicks` with server-side validation in `createLink` and hot-path evaluation in `getLinkBySlug`, automatically returning 404 for expired or capped links.
- **7-Day Click Telemetry Sparkline:** Lightweight server function `getLinkDailyClicks` aggregating click timestamps over the last 7 days, visualized with a zero-dependency accessible SVG bar sparkline inside `LinkCard`.

**Tech Stack:** TanStack Router, TanStack Start server functions, TanStack Form, Drizzle ORM, Neon PostgreSQL, Biome, TypeScript strict mode, Bun test runner.

---

### Task 1: Vector SVG & Color-Themed QR Customizer (P2.1)

**Files:**
- Modify: `src/lib/qr.ts`
- Test: `src/lib/qr.test.ts`
- Modify: `src/components/qr-preview.tsx`
- Test: `src/components/qr-preview.test.tsx`

**Step 1: Write unit tests for QR color presets & SVG options in `src/lib/qr.test.ts`**

Update `src/lib/qr.test.ts`:
```ts
import { describe, expect, it } from "bun:test";
import { QR_COLOR_PRESETS, generateQR, generateQRSvg } from "./qr";

describe("QR Code Generation Utility", () => {
  it("generates a valid PNG data URL from a URL", async () => {
    const dataUrl = await generateQR("https://shortu.dev/abc1234");
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    expect(dataUrl.length).toBeGreaterThan(100);
  });

  it("generates a valid SVG string from a URL", async () => {
    const svg = await generateQRSvg("https://shortu.dev/abc1234");
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("exports valid color presets with accessible contrast", () => {
    expect(QR_COLOR_PRESETS.length).toBeGreaterThanOrEqual(4);
    for (const preset of QR_COLOR_PRESETS) {
      expect(preset.name).toBeDefined();
      expect(preset.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("applies custom color presets correctly to SVG", async () => {
    const preset = QR_COLOR_PRESETS[1];
    const svg = await generateQRSvg("https://shortu.dev/abc1234", {
      darkColor: preset.color,
    });
    expect(svg).toContain(preset.color);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test src/lib/qr.test.ts`
Expected: FAIL (`QR_COLOR_PRESETS` not exported).

**Step 3: Implement `QR_COLOR_PRESETS` and enhanced options in `src/lib/qr.ts`**

Update `src/lib/qr.ts`:
```ts
/**
 * QR code generation utility.
 * Generates PNG data URLs and vector SVG strings on-demand with color presets.
 * Can be safely called on client or server.
 * Used by: src/components/qr-preview.tsx, src/server/functions/links.ts
 */
import QRCode from "qrcode";

export interface QROptions {
  width?: number | undefined;
  margin?: number | undefined;
  darkColor?: string | undefined;
  lightColor?: string | undefined;
}

export interface QRColorPreset {
  id: string;
  name: string;
  color: string;
  bg: string;
}

export const QR_COLOR_PRESETS: QRColorPreset[] = [
  { id: "classic", name: "Classic Dark", color: "#0f172a", bg: "#ffffff" },
  { id: "brand", name: "ShortU Violet", color: "#7c3aed", bg: "#ffffff" },
  { id: "mint", name: "Emerald Mint", color: "#059669", bg: "#ffffff" },
  { id: "coral", name: "Sunset Coral", color: "#e11d48", bg: "#ffffff" },
  { id: "indigo", name: "Deep Indigo", color: "#2563eb", bg: "#ffffff" },
];

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

**Step 4: Update `src/components/qr-preview.tsx` with live color switcher**

Update `src/components/qr-preview.tsx`:
- Render color preset pill buttons with active ring highlight.
- Re-generate QR in real-time when user selects a color preset.
- Support instant vector SVG download and high-resolution PNG download.

**Step 5: Write component tests in `src/components/qr-preview.test.tsx`**

Create `src/components/qr-preview.test.tsx` testing preset rendering and download controls.

**Step 6: Run tests and verify they pass**

Run: `bun test src/lib/qr.test.ts src/components/qr-preview.test.tsx`
Expected: PASS.

**Step 7: Commit**

```bash
git add src/lib/qr.ts src/lib/qr.test.ts src/components/qr-preview.tsx src/components/qr-preview.test.tsx
git commit -m "feat(qr): add color preset switcher and vector svg export in qr preview"
```

---

### Task 2: Link Expiration & Temporary Links (P2.2)

**Files:**
- Modify: `src/server/db/schema.ts`
- Modify: `src/lib/schema/shorten-form.ts`
- Modify: `src/server/functions/links.ts`
- Modify: `src/components/shorten-dialog-content.tsx`
- Test: `src/server/functions/links.test.ts`
- Generate: Drizzle migration via `bun db:generate`

**Step 1: Write failing unit tests for link expiration logic in `src/server/functions/links.test.ts`**

Update `src/server/functions/links.test.ts` with tests for:
- Date expiration (`expiresAt` in past causes `getLinkBySlug` to return `null` and invalidate cache).
- Max click limit (`clickCount >= maxClicks` causes `getLinkBySlug` to return `null`).

**Step 2: Run test to verify it fails**

Run: `bun test src/server/functions/links.test.ts`
Expected: FAIL.

**Step 3: Update `src/server/db/schema.ts` with `expires_at` and `max_clicks`**

Update `links` table in `src/server/db/schema.ts`:
```ts
export const links = pgTable(
  "links",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    slug: text("slug").notNull().unique(),
    originalUrl: text("original_url").notNull(),
    adEnabled: boolean("ad_enabled").notNull().default(false),
    clickCount: integer("click_count").notNull().default(0),
    expiresAt: timestamp("expires_at"),
    maxClicks: integer("max_clicks"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [
    index("links_user_id_idx").on(table.userId),
    index("links_user_id_created_at_idx").on(table.userId, table.createdAt),
    index("links_expires_at_idx").on(table.expiresAt),
  ],
);
```

**Step 4: Update `src/lib/schema/shorten-form.ts` and `src/server/functions/links.ts`**

- In `shortenFormSchema`: Add optional `expiresIn: z.enum(["1h", "24h", "7d", "30d", "never"]).optional()` and `maxClicks: z.number().int().positive().max(1000000).optional()`.
- In `createLink`: Calculate `expiresAt` based on `expiresIn` and persist `expiresAt` & `maxClicks`.
- In `getLinkBySlug`: Evaluate whether `link.expiresAt && now > link.expiresAt` or `link.maxClicks && link.clickCount >= link.maxClicks`. If expired, return `null` and invalidate cache.
- In `src/components/shorten-dialog-content.tsx`: Render optional "Expiration & Limits" expandable controls for signed-in users.
- Run `bun db:generate`.

**Step 5: Run tests and verify they pass**

Run: `bun test`
Expected: PASS.

**Step 6: Commit**

```bash
git add src/server/db/schema.ts src/lib/schema/shorten-form.ts src/server/functions/links.ts src/server/functions/links.test.ts src/components/shorten-dialog-content.tsx drizzle/
git commit -m "feat(links): add link expiration ttl and max-clicks limit"
```

---

### Task 3: Dashboard 7-Day Click Telemetry Sparkline (P2.3)

**Files:**
- Modify: `src/server/functions/analytics.ts`
- Test: `src/server/functions/analytics.test.ts`
- Create: `src/components/click-sparkline.tsx`
- Test: `src/components/click-sparkline.test.tsx`
- Modify: `src/components/link-card.tsx`

**Step 1: Write failing unit test for `getLinkDailyClicks` in `src/server/functions/analytics.test.ts`**

Update `src/server/functions/analytics.test.ts`:
```ts
import { describe, expect, it } from "bun:test";
import { getLinkDailyClicks, getLinkStats, trackClick } from "./analytics";

describe("Analytics server functions", () => {
  it("exports trackClick, getLinkStats, and getLinkDailyClicks as server functions", () => {
    expect(typeof trackClick).toBe("function");
    expect(typeof getLinkStats).toBe("function");
    expect(typeof getLinkDailyClicks).toBe("function");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test src/server/functions/analytics.test.ts`
Expected: FAIL (`getLinkDailyClicks` not defined).

**Step 3: Implement `getLinkDailyClicks` in `src/server/functions/analytics.ts`**

Add `getLinkDailyClicks`:
- Accepts `{ linkId: string }`.
- Queries clicks for `linkId` created within the past 7 days (`now - 7 * 86400000`).
- Aggregates click counts into 7 daily buckets (`{ date: string, label: string, count: number }[]`).
- Returns the 7-day array for rapid client sparkline rendering.

**Step 4: Implement `src/components/click-sparkline.tsx`**

Create `src/components/click-sparkline.tsx`:
- Accepts `linkId: string` and optional `initialData?: { date: string; label: string; count: number }[]`.
- Uses `useQuery` to fetch `getLinkDailyClicks`.
- Renders an accessible SVG mini-bar chart with subtle rounded corners and hover tooltip.
- Zero external charting dependencies — fast and lightweight.

**Step 5: Integrate `ClickSparkline` into `src/components/link-card.tsx`**

Add expandable / inline 7-day activity sparkline in `LinkCard` so dashboard users can immediately visualize link traffic velocity.

**Step 6: Run full verification suite**

Run:
```bash
bun lint:fix
bun typecheck
bun test
bun run build
```
Expected: Zero errors.

**Step 7: Commit**

```bash
git add src/server/functions/analytics.ts src/server/functions/analytics.test.ts src/components/click-sparkline.tsx src/components/click-sparkline.test.tsx src/components/link-card.tsx
git commit -m "feat(dashboard): add 7-day click telemetry sparkline chart"
```

---

## Execution Handoff

After saving the plan, offer execution choice:

**"Plan complete and saved to `docs/plans/2026-09-15-p2-high-value-features.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?"**
