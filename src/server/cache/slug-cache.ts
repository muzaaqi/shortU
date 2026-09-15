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
