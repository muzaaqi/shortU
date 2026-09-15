/**
 * Slug redirection handler.
 * Hot-path loader that looks up slug in database and executes direct 301 redirect
 * or forwards to /go/$slug when adEnabled is true.
 * Click telemetry is awaited before the redirect: on Cloudflare Workers,
 * fire-and-forget promises are cancelled once the response flushes.
 * Used by: TanStack Router for route "/$slug"
 */
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { trackClick } from "~/server/functions/analytics";
import { getLinkBySlug } from "~/server/functions/links";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params, cause }) => {
    const slug = params.slug;
    const link = await getLinkBySlug({ data: { slug } });

    if (!link) {
      throw notFound();
    }

    if (link.adEnabled) {
      throw redirect({
        to: "/go/$slug",
        params: { slug },
      });
    }

    // Fire-and-forget click telemetry for direct 301 redirection.
    // Skipped on hover/intent prefetches (cause === "preload") so phantom
    // loader runs never inflate the click counter — only real navigations count.
    if (cause !== "preload") {
      await trackClick({ data: { linkId: link.id } });
    }

    // Direct HTTP 301 redirect
    throw redirect({
      href: link.originalUrl,
      statusCode: 301,
    });
  },
  component: () => null,
});
