/**
 * Server functions for link management.
 * Handles creating shortened links, querying links by slug, listing links,
 * deleting links, and toggling interstitial ad mode with QR code generation.
 * Used by: src/routes/index.tsx, src/routes/dashboard.tsx, src/routes/$slug.tsx, src/routes/go.$slug.tsx
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { generateQR } from "~/lib/qr";
import { generateSlug, validateSlug } from "~/lib/slugify";
import { db } from "~/server/db";
import { links } from "~/server/db/schema";
import { getSession } from "./auth";

export interface CreateLinkInput {
  originalUrl: string;
  customSlug?: string;
  adEnabled?: boolean;
}

/**
 * Resolves the public origin used to build short URLs.
 * Prefers the incoming request host (so URLs match the visiting domain),
 * falling back to BETTER_AUTH_URL from env, then localhost.
 * Server-only — env is never accessed from client modules.
 * Used by: createLink handler, getAppOrigin server function
 */
async function resolveOrigin(): Promise<string> {
  const fallback = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  try {
    const request = getRequest();
    const host = request?.headers.get("host") || request?.headers.get("x-forwarded-host");
    const proto = request?.headers.get("x-forwarded-proto") || "http";
    if (host) {
      return `${proto}://${host}`;
    }
  } catch {
    // No request context (e.g. called outside a request scope) — use env fallback
  }
  return fallback;
}

/**
 * Returns the app's public origin (e.g. "https://shortu.dev") for client-side
 * display, such as the custom-slug input prefix.
 * Used by: src/components/link-form.tsx
 */
export const getAppOrigin = createServerFn({ method: "GET" }).handler(async () => {
  return resolveOrigin();
});

/**
 * Creates a new short link.
 * Validates original URL and optional custom slug, checks collision,
 * generates QR code, and persists record to Neon PostgreSQL.
 * Used by: src/components/link-form.tsx
 */
export const createLink = createServerFn({ method: "POST" })
  .validator((data: CreateLinkInput) => {
    if (!data.originalUrl || typeof data.originalUrl !== "string") {
      throw new Error("A valid destination URL is required.");
    }

    let url = data.originalUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    try {
      new URL(url);
    } catch {
      throw new Error("Invalid URL format. Please enter a valid web address.");
    }

    if (data.customSlug) {
      const check = validateSlug(data.customSlug.trim());
      if (!check.valid) {
        throw new Error(check.reason || "Invalid custom slug.");
      }
    }

    return {
      originalUrl: url,
      customSlug: data.customSlug?.trim() || undefined,
      adEnabled: Boolean(data.adEnabled),
    };
  })
  .handler(async ({ data }) => {
    let slug = data.customSlug;
    if (!slug) {
      slug = generateSlug();
    }

    // Check slug collision
    const existing = (await db.select().from(links).where(eq(links.slug, slug)))[0];

    if (existing) {
      throw new Error("This slug is already taken. Please choose a different one.");
    }

    // Determine host origin for short URL
    const origin = await resolveOrigin();

    const shortUrl = `${origin}/${slug}`;
    const qrCode = await generateQR(shortUrl);

    // Check optional authenticated user session
    const session = await getSession();
    const userId = session?.user?.id || null;

    if (data.customSlug && !userId) {
      throw new Error("Custom slug aliases require signing in to shortU.");
    }

    const id = nanoid();
    const now = new Date();

    const [newLink] = await db
      .insert(links)
      .values({
        id,
        userId,
        slug,
        originalUrl: data.originalUrl,
        qrCode,
        adEnabled: data.adEnabled,
        clickCount: 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return {
      ...newLink,
      shortUrl,
    };
  });

/**
 * Looks up a shortened link by its slug.
 * Used by: src/routes/$slug.tsx, src/routes/go.$slug.tsx
 */
export const getLinkBySlug = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => {
    if (!data.slug) throw new Error("Slug is required.");
    return data;
  })
  .handler(async ({ data }) => {
    const [link] = await db
      .select()
      .from(links)
      .where(eq(links.slug, data.slug));

    return link || null;
  });

/**
 * Retrieves the current authenticated user's links.
 * Used by: src/routes/dashboard.tsx
 */
export const getLinks = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session?.user?.id) {
    return [];
  }

  const userLinks = await db
    .select()
    .from(links)
    .where(eq(links.userId, session.user.id))
    .orderBy(desc(links.createdAt));

  return userLinks;
});

/**
 * Deletes a link owned by the current authenticated user.
 * Used by: src/components/link-card.tsx
 */
export const deleteLink = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => {
    if (!data.id) throw new Error("Link ID is required.");
    return data;
  })
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new Error("Unauthorized. Please sign in to delete links.");
    }

    const [deleted] = await db
      .delete(links)
      .where(and(eq(links.id, data.id), eq(links.userId, session.user.id)))
      .returning();

    if (!deleted) {
      throw new Error("Link not found or unauthorized.");
    }

    return { success: true, id: deleted.id };
  });

/**
 * Toggles the interstitial adEnabled mode for a user's link.
 * Used by: src/components/ad-toggle.tsx
 */
export const toggleAdMode = createServerFn({ method: "POST" })
  .validator((data: { id: string; adEnabled: boolean }) => {
    if (!data.id) throw new Error("Link ID is required.");
    return data;
  })
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new Error("Unauthorized. Please sign in to update link settings.");
    }

    const [updated] = await db
      .update(links)
      .set({ adEnabled: data.adEnabled, updatedAt: new Date() })
      .where(and(eq(links.id, data.id), eq(links.userId, session.user.id)))
      .returning();

    if (!updated) {
      throw new Error("Link not found or unauthorized.");
    }

    return updated;
  });
