/**
 * Unit tests for analytics server functions and helpers.
 */
import { describe, expect, it } from "bun:test";
import {
  aggregateDailyClicks,
  getLinkDailyClicks,
  getLinkStats,
  trackClick,
} from "./analytics";

describe("Analytics server functions", () => {
  it("should export trackClick, getLinkStats, and getLinkDailyClicks as server functions", () => {
    expect(trackClick).toBeDefined();
    expect(getLinkStats).toBeDefined();
    expect(getLinkDailyClicks).toBeDefined();
    expect(typeof trackClick).toBe("function");
    expect(typeof getLinkStats).toBe("function");
    expect(typeof getLinkDailyClicks).toBe("function");
  });

  it("aggregates raw click timestamps into a continuous 7-day series", () => {
    const now = new Date("2026-09-15T12:00:00Z");
    const twoDaysAgo = new Date("2026-09-13T08:00:00Z");
    const threeDaysAgo = new Date("2026-09-12T10:00:00Z");

    const rawClicks = [
      { clickedAt: now },
      { clickedAt: now },
      { clickedAt: twoDaysAgo },
      { clickedAt: threeDaysAgo },
    ];

    const series = aggregateDailyClicks(rawClicks, 7, now);
    expect(series.length).toBe(7);

    // Today should have 2 clicks
    const todayEntry = series[6];
    expect(todayEntry?.count).toBe(2);

    // 2 days ago should have 1 click
    const twoDaysAgoEntry = series[4];
    expect(twoDaysAgoEntry?.count).toBe(1);

    // 3 days ago should have 1 click
    const threeDaysAgoEntry = series[3];
    expect(threeDaysAgoEntry?.count).toBe(1);

    // Other days should be 0
    expect(series[0]?.count).toBe(0);
    expect(series[1]?.count).toBe(0);
  });
});
