/**
 * Link expiration and limits utility.
 * Calculates TTL expiration dates and evaluates whether a link is expired
 * by timestamp or click count cap.
 * Used by: src/server/functions/links.ts, src/components/shorten-dialog-content.tsx
 */

export type ExpirationDuration = "1h" | "24h" | "7d" | "30d" | "never";

export interface ExpirationCheckInput {
  expiresAt?: Date | string | null | undefined;
  maxClicks?: number | null | undefined;
  clickCount: number;
}

/**
 * Computes the future Date for a given duration string from a base timestamp.
 * Returns null if duration is "never" or undefined.
 */
export function calculateExpirationDate(
  duration?: ExpirationDuration | string | undefined,
  baseDate: Date = new Date()
): Date | null {
  if (!duration || duration === "never") return null;

  const msMap: Record<string, number> = {
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  };

  const ms = msMap[duration];
  if (!ms) return null;

  return new Date(baseDate.getTime() + ms);
}

/**
 * Checks whether a link is expired based on its timestamp or maxClicks limit.
 */
export function isLinkExpired(link: ExpirationCheckInput): boolean {
  if (link.expiresAt) {
    const expirationTime = new Date(link.expiresAt).getTime();
    if (Date.now() > expirationTime) {
      return true;
    }
  }

  if (link.maxClicks != null && link.maxClicks > 0) {
    if (link.clickCount >= link.maxClicks) {
      return true;
    }
  }

  return false;
}
