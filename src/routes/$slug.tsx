/**
 * Slug redirection handler.
 * Hot-path loader that looks up slug in database and executes direct 301 redirect
 * or forwards to /go/$slug when adEnabled is true.
 * Used by: TanStack Router for route "/$slug"
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { trackClick } from "~/server/functions/analytics";
import { getLinkBySlug } from "~/server/functions/links";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const slug = params.slug;
    const link = await getLinkBySlug({ data: { slug } });

    if (!link) {
      throw redirect({
        to: "/",
      });
    }

    if (link.adEnabled) {
      throw redirect({
        to: "/go/$slug",
        params: { slug },
      });
    }

    // Fire-and-forget click telemetry for direct 301 redirection
    trackClick({ data: { linkId: link.id } }).catch(() => {
      // ignore telemetry errors
    });

    // Direct HTTP 301 redirect
    throw redirect({
      href: link.originalUrl,
      statusCode: 301,
    });
  },
  component: () => null,
});
