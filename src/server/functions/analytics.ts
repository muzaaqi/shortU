/**
 * Analytics server functions for click event ingestion and telemetry queries.
 * Used by: src/routes/$slug.tsx, src/routes/go.$slug.tsx, src/routes/dashboard.tsx
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "~/server/db";
import { clicks, links } from "~/server/db/schema";

export interface TrackClickInput {
  linkId: string;
  userAgent?: string | undefined;
}

export interface GetLinkStatsInput {
  linkId: string;
}

export interface DailyClickPoint {
  date: string;
  label: string;
  count: number;
}

/**
 * Aggregates raw click events into a continuous daily time series.
 * Driver-agnostic in-memory bucketing.
 */
export function aggregateDailyClicks(
  rawClicks: { clickedAt: Date | string }[],
  days: number = 7,
  baseDate: Date = new Date()
): DailyClickPoint[] {
  const result: DailyClickPoint[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = dayNames[d.getUTCDay()] ?? "";
    result.push({
      date: dateStr,
      label: dayLabel,
      count: 0,
    });
  }

  for (const click of rawClicks) {
    const clickDate = new Date(click.clickedAt).toISOString().slice(0, 10);
    const entry = result.find((item) => item.date === clickDate);
    if (entry) {
      entry.count += 1;
    }
  }

  return result;
}

/**
 * Tracks a click on a shortened link.
 * Inserts an event into the clicks table and atomically increments the link's
 * click count via db.batch — the neon-http driver executes batched statements
 * as a single server-side transaction over one HTTP round-trip.
 * Fail-safe: Returns null on database error rather than interrupting user redirection.
 */
export const trackClick = createServerFn({ method: "POST" })
  .validator((data: TrackClickInput) => data)
  .handler(async ({ data }) => {
    try {
      if (!data.linkId) return { success: false };

      let userAgent = data.userAgent;
      if (!userAgent) {
        try {
          const req = getRequest();
          userAgent = req?.headers.get("user-agent") || undefined;
        } catch {
          // No active request context
        }
      }

      const clickId = nanoid();
      const now = new Date();

      // Atomic pair: click event insert + counter increment.
      // db.transaction() is unsupported on neon-http; batch() is its
      // transactional equivalent on this driver.
      await db.batch([
        db.insert(clicks).values({
          id: clickId,
          linkId: data.linkId,
          clickedAt: now,
          userAgent: userAgent ?? null,
        }),
        db
          .update(links)
          .set({
            clickCount: sql`${links.clickCount} + 1`,
            updatedAt: now,
          })
          .where(eq(links.id, data.linkId)),
      ]);

      return { success: true, clickId };
    } catch (error) {
      // In offline/test or transient DB outages, avoid crashing redirect hot-path
      console.error("Failed to track click event:", error);
      return { success: false, error: (error as Error).message };
    }
  });

/**
 * Retrieves click telemetry and history for a given link.
 * Used by: Analytics dashboards or link inspectors.
 */
export const getLinkStats = createServerFn({ method: "GET" })
  .validator((data: GetLinkStatsInput) => data)
  .handler(async ({ data }) => {
    try {
      const link = await db.query.links.findFirst({
        where: eq(links.id, data.linkId),
      });

      if (!link) {
        return { link: null, recentClicks: [] };
      }

      const recentClicks = await db.query.clicks.findMany({
        where: eq(clicks.linkId, data.linkId),
        orderBy: [desc(clicks.clickedAt)],
        limit: 50,
      });

      return {
        link,
        totalClicks: link.clickCount,
        recentClicks,
      };
    } catch (error) {
      console.error("Failed to fetch link stats:", error);
      return { link: null, recentClicks: [] };
    }
  });

/**
 * Retrieves daily click counts for a link over the past 7 days.
 * Returns structured array for sparkline rendering.
 * Used by: src/components/click-sparkline.tsx, src/components/link-card.tsx
 */
export const getLinkDailyClicks = createServerFn({ method: "GET" })
  .validator((data: { linkId: string }) => data)
  .handler(async ({ data }) => {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const linkClicks = await db
        .select({ clickedAt: clicks.clickedAt })
        .from(clicks)
        .where(
          and(
            eq(clicks.linkId, data.linkId),
            gte(clicks.clickedAt, sevenDaysAgo)
          )
        );

      return aggregateDailyClicks(linkClicks, 7, now);
    } catch (error) {
      console.error("Failed to fetch daily clicks:", error);
      return aggregateDailyClicks([], 7);
    }
  });
