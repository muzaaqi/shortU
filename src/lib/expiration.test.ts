/**
 * Unit tests for link expiration calculations and validation.
 */
import { describe, expect, it } from "bun:test";
import { calculateExpirationDate, isLinkExpired } from "./expiration";

describe("Link Expiration Helpers", () => {
  it("calculates future expiration date from duration strings", () => {
    const now = new Date("2026-01-01T00:00:00Z");

    const in1h = calculateExpirationDate("1h", now);
    expect(in1h?.getTime()).toBe(now.getTime() + 60 * 60 * 1000);

    const in24h = calculateExpirationDate("24h", now);
    expect(in24h?.getTime()).toBe(now.getTime() + 24 * 60 * 60 * 1000);

    const in7d = calculateExpirationDate("7d", now);
    expect(in7d?.getTime()).toBe(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const in30d = calculateExpirationDate("30d", now);
    expect(in30d?.getTime()).toBe(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    expect(calculateExpirationDate("never", now)).toBeNull();
    expect(calculateExpirationDate(undefined, now)).toBeNull();
  });

  it("identifies unexpired links correctly", () => {
    const future = new Date(Date.now() + 100000);
    expect(isLinkExpired({ expiresAt: future, clickCount: 5, maxClicks: 10 })).toBe(false);
    expect(isLinkExpired({ expiresAt: null, clickCount: 5, maxClicks: null })).toBe(false);
  });

  it("identifies links expired by timestamp", () => {
    const past = new Date(Date.now() - 10000);
    expect(isLinkExpired({ expiresAt: past, clickCount: 0, maxClicks: null })).toBe(true);
  });

  it("identifies links expired by max clicks cap", () => {
    expect(isLinkExpired({ expiresAt: null, clickCount: 10, maxClicks: 10 })).toBe(true);
    expect(isLinkExpired({ expiresAt: null, clickCount: 15, maxClicks: 10 })).toBe(true);
  });
});
