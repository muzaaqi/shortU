/**
 * Analytics server functions for click event ingestion and telemetry queries.
 * Used by: src/routes/$slug.tsx, src/routes/go.$slug.tsx, src/routes/dashboard.tsx
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { desc, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "~/server/db";
import { clicks, links } from "~/server/db/schema";

export interface TrackClickInput {
  linkId: string;
  userAgent?: string;
}

export interface GetLinkStatsInput {
  linkId: string;
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
