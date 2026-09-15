/**
 * Unit tests for in-memory slug cache.
 * Verifies hit/miss behavior, negative caching, invalidation, and TTL expiration.
 */
import { beforeEach, describe, expect, it } from "bun:test";
import {
  type CachedLinkData,
  clearSlugCache,
  getCachedLink,
  invalidateCachedLink,
  setCachedLink,
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

    await new Promise((resolve) => setTimeout(resolve, 70));
    expect(getCachedLink("short-lived")).toBeUndefined();
  });
});
