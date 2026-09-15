# Phase 3: Polish & Nice-to-Have Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Phase 3 polish and high-value marketer/creator features for shortU: (1) an integrated UTM Campaign Parameter Builder for custom campaign tracking, and (2) native Web Share API integration across result screens and dashboard cards with resilient clipboard fallbacks.

**Architecture:**
- **UTM Campaign Parameter Builder:** Pure TypeScript parsing and URL building module in `src/lib/utm.ts` wired into an expandable "UTM Campaign Tracking" accordion inside `ShortenDialogContent`, offering real-time parameterized URL preview and automatic parameter injection.
- **Native Web Share & Quick Actions:** Unified share helper in `src/lib/share.ts` with cross-platform capability detection (`navigator.share`, `navigator.canShare`, `navigator.clipboard`), integrated directly into `LinkResult` and `LinkCard` with contextual UI feedback.

**Tech Stack:** TypeScript strict mode, TanStack Form, TanStack Router, Lucide icons, Base UI primitives, Biome, Bun test runner.

---

### Task 1: UTM Campaign Parameter Builder (P3.1)

**Files:**
- Create: `src/lib/utm.ts`
- Create: `src/lib/utm.test.ts`
- Modify: `src/components/shorten-dialog-content.tsx`
- Modify: `src/lib/schema/shorten-form.ts`

**Step 1: Write unit tests for UTM URL building and parsing in `src/lib/utm.test.ts`**

Create `src/lib/utm.test.ts`:
```ts
import { describe, expect, it } from "bun:test";
import {
  buildUtmUrl,
  hasUtmParams,
  parseUtmParams,
  type UtmParams,
} from "./utm";

describe("UTM Parameter Utilities", () => {
  it("builds a URL with basic UTM parameters", () => {
    const params: UtmParams = {
      utmSource: "twitter",
      utmMedium: "social",
      utmCampaign: "launch_2026",
    };
    const result = buildUtmUrl("https://example.com/product", params);
    expect(result).toBe(
      "https://example.com/product?utm_source=twitter&utm_medium=social&utm_campaign=launch_2026"
    );
  });

  it("preserves existing query parameters and hash anchors", () => {
    const params: UtmParams = {
      utmSource: "newsletter",
      utmMedium: "email",
      utmTerm: "sale",
      utmContent: "header_cta",
    };
    const result = buildUtmUrl("https://example.com/pricing?ref=promo#annual", params);
    expect(result).toBe(
      "https://example.com/pricing?ref=promo&utm_source=newsletter&utm_medium=email&utm_term=sale&utm_content=header_cta#annual"
    );
  });

  it("ignores empty, undefined, or whitespace-only parameters", () => {
    const params: UtmParams = {
      utmSource: "google",
      utmMedium: "   ",
      utmCampaign: undefined,
    };
    const result = buildUtmUrl("https://example.com", params);
    expect(result).toBe("https://example.com/?utm_source=google");
  });

  it("returns base URL unchanged if all UTM parameters are empty", () => {
    const params: UtmParams = {
      utmSource: "",
      utmMedium: undefined,
    };
    const result = buildUtmUrl("https://example.com/blog", params);
    expect(result).toBe("https://example.com/blog");
  });

  it("detects whether UTM parameters are populated", () => {
    expect(hasUtmParams({})).toBe(false);
    expect(hasUtmParams({ utmSource: "   " })).toBe(false);
    expect(hasUtmParams({ utmSource: "twitter" })).toBe(true);
    expect(hasUtmParams({ utmCampaign: "spring" })).toBe(true);
  });

  it("parses UTM parameters from a URL", () => {
    const url = "https://example.com/store?cat=shoes&utm_source=ig&utm_campaign=summer#top";
    const { baseUrl, utm } = parseUtmParams(url);
    expect(baseUrl).toBe("https://example.com/store?cat=shoes#top");
    expect(utm.utmSource).toBe("ig");
    expect(utm.utmCampaign).toBe("summer");
    expect(utm.utmMedium).toBeUndefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test src/lib/utm.test.ts`
Expected: FAIL (`src/lib/utm.ts` does not exist).

**Step 3: Implement `src/lib/utm.ts`**

Create `src/lib/utm.ts`:
```ts
/**
 * UTM Campaign parameter utilities.
 * Handles parsing, building, and sanitizing Google Analytics / standard UTM query strings.
 * Used by: src/components/shorten-dialog-content.tsx
 */

export interface UtmParams {
  utmSource?: string | undefined;
  utmMedium?: string | undefined;
  utmCampaign?: string | undefined;
  utmTerm?: string | undefined;
  utmContent?: string | undefined;
}

const UTM_KEYS: Record<keyof UtmParams, string> = {
  utmSource: "utm_source",
  utmMedium: "utm_medium",
  utmCampaign: "utm_campaign",
  utmTerm: "utm_term",
  utmContent: "utm_content",
};

/**
 * Checks if any UTM parameter has a non-empty string value.
 */
export function hasUtmParams(params: UtmParams | undefined | null): boolean {
  if (!params) return false;
  return Object.values(params).some(
    (value) => typeof value === "string" && value.trim().length > 0
  );
}

/**
 * Appends non-empty UTM parameters to a base URL, preserving existing search params and hash.
 */
export function buildUtmUrl(baseUrl: string, params: UtmParams): string {
  if (!baseUrl.trim() || !hasUtmParams(params)) {
    return baseUrl;
  }

  try {
    const parsed = new URL(
      baseUrl.startsWith("http://") || baseUrl.startsWith("https://")
        ? baseUrl
        : `https://${baseUrl}`
    );

    for (const [key, paramName] of Object.entries(UTM_KEYS) as [keyof UtmParams, string][]) {
      const val = params[key]?.trim();
      if (val) {
        parsed.searchParams.set(paramName, val);
      } else {
        parsed.searchParams.delete(paramName);
      }
    }

    return parsed.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * Extracts UTM parameters from a URL and returns the clean base URL along with parsed UTM values.
 */
export function parseUtmParams(urlStr: string): { baseUrl: string; utm: UtmParams } {
  const utm: UtmParams = {};
  try {
    const parsed = new URL(
      urlStr.startsWith("http://") || urlStr.startsWith("https://")
        ? urlStr
        : `https://${urlStr}`
    );

    for (const [key, paramName] of Object.entries(UTM_KEYS) as [keyof UtmParams, string][]) {
      const val = parsed.searchParams.get(paramName);
      if (val) {
        utm[key] = val;
        parsed.searchParams.delete(paramName);
      }
    }

    return {
      baseUrl: parsed.toString(),
      utm,
    };
  } catch {
    return { baseUrl: urlStr, utm };
  }
}
```

**Step 4: Update `src/lib/schema/shorten-form.ts` and `src/components/shorten-dialog-content.tsx`**

- In `src/lib/schema/shorten-form.ts`, add optional UTM fields:
```ts
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  utmTerm: z.string().max(100).optional(),
  utmContent: z.string().max(100).optional(),
```
- In `src/components/shorten-dialog-content.tsx`:
  - Add collapsible "UTM Campaign Builder" accordion section.
  - When open, users can enter Source, Medium, Campaign, Term, and Content.
  - Display live destination URL preview with highlighted UTM query string.
  - In `mutationFn`, pass `buildUtmUrl(normalized, values)` to `createLink`.

**Step 5: Run tests and verify they pass**

Run: `bun test src/lib/utm.test.ts src/lib/schema/shorten-form.test.ts`
Expected: PASS.

**Step 6: Commit**

```bash
git add src/lib/utm.ts src/lib/utm.test.ts src/lib/schema/shorten-form.ts src/components/shorten-dialog-content.tsx
git commit -m "feat(links): add utm campaign parameter builder in shorten dialog"
```

---

### Task 2: Native Web Share API Integration & Quick Actions (P3.2)

**Files:**
- Create: `src/lib/share.ts`
- Create: `src/lib/share.test.ts`
- Modify: `src/components/link-result.tsx`
- Modify: `src/components/link-card.tsx`

**Step 1: Write unit tests for Web Share helper in `src/lib/share.test.ts`**

Create `src/lib/share.test.ts`:
```ts
import { beforeEach, describe, expect, it } from "bun:test";
import { canUseWebShare, copyToClipboard, shareOrCopy } from "./share";

describe("Share & Clipboard Utility", () => {
  it("detects Web Share API availability safely", () => {
    // In Node / Bun environment without navigator.share, should be false
    expect(typeof canUseWebShare()).toBe("boolean");
  });

  it("handles copyToClipboard fallback gracefully", async () => {
    const success = await copyToClipboard("https://shortu.dev/test1234");
    expect(typeof success).toBe("boolean");
  });

  it("shareOrCopy executes without throwing errors", async () => {
    const result = await shareOrCopy({
      url: "https://shortu.dev/test1234",
      title: "shortU Link",
      text: "Check out this shortened link",
    });
    expect(typeof result.shared).toBe("boolean");
    expect(typeof result.copied).toBe("boolean");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test src/lib/share.test.ts`
Expected: FAIL (`src/lib/share.ts` does not exist).

**Step 3: Implement `src/lib/share.ts`**

Create `src/lib/share.ts`:
```ts
/**
 * Cross-platform Web Share and Clipboard helper.
 * Uses navigator.share on supported mobile/desktop browsers with automatic
 * fallback to navigator.clipboard and execCommand.
 * Used by: src/components/link-result.tsx, src/components/link-card.tsx
 */

export interface SharePayload {
  url: string;
  title?: string | undefined;
  text?: string | undefined;
}

export interface ShareResult {
  shared: boolean;
  copied: boolean;
}

/**
 * Checks if the browser supports the native Web Share API for links.
 */
export function canUseWebShare(): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }
  try {
    if (typeof navigator.canShare === "function") {
      return navigator.canShare({ url: "https://shortu.dev" });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Copies text to the clipboard with legacy fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy execCommand fallback
    }
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Attempts to trigger native share sheet; falls back to copying URL.
 */
export async function shareOrCopy(payload: SharePayload): Promise<ShareResult> {
  if (canUseWebShare()) {
    try {
      await navigator.share({
        title: payload.title ?? "shortU Link",
        text: payload.text ?? payload.url,
        url: payload.url,
      });
      return { shared: true, copied: false };
    } catch (err: unknown) {
      // If user aborted or dismissed the share sheet, return cleanly
      if (err instanceof Error && err.name === "AbortError") {
        return { shared: false, copied: false };
      }
      // Otherwise fall back to clipboard copy
    }
  }

  const copied = await copyToClipboard(payload.url);
  return { shared: false, copied };
}
```

**Step 4: Update `src/components/link-result.tsx` and `src/components/link-card.tsx`**

- In `src/components/link-result.tsx`:
  - Import `canUseWebShare` and `shareOrCopy` from `~/lib/share`.
  - Display "Share Link" (`Share2` icon) next to "Copy Short Link" when Web Share is supported, or let the primary action trigger `shareOrCopy` with feedback state (`Shared!` or `Copied to clipboard!`).
- In `src/components/link-card.tsx`:
  - Add native "Share" option in desktop action cluster and mobile popover menu.

**Step 5: Run full verification suite**

Run:
```bash
bun lint:fix
bun typecheck
bun test
bun run build
```
Expected: All 0 errors.

**Step 6: Commit**

```bash
git add src/lib/share.ts src/lib/share.test.ts src/components/link-result.tsx src/components/link-card.tsx
git commit -m "feat(share): add native web share api support and unified clipboard helper"
```

---

## Execution Handoff

After saving the plan, offer execution choice:

**"Plan complete and saved to `docs/plans/2026-09-16-p3-polish-features.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?"**
