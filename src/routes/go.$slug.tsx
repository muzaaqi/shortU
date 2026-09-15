/**
 * Interstitial ad route handler (/go/$slug).
 * Renders destination preview, sponsored ad placement, and automated countdown.
 * Click telemetry is awaited before rendering: on Cloudflare Workers,
 * fire-and-forget promises can be cancelled once the response flushes.
 * Surface Mode: Experience
 * Used by: TanStack Router for route "/go/$slug"
 */
import { createFileRoute, notFound } from "@tanstack/react-router";
import { InterstitialPage } from "~/components/interstitial-page";
import { trackClick } from "~/server/functions/analytics";
import { getLinkBySlug } from "~/server/functions/links";

export const Route = createFileRoute("/go/$slug")({
  loader: async ({ params, cause }) => {
    const slug = params.slug;
    const link = await getLinkBySlug({ data: { slug } });

    if (!link) {
      throw notFound();
    }

    // Fire-and-forget click telemetry. Skipped on hover/intent prefetches
    // (cause === "preload") so phantom loader runs never inflate the counter.
    if (cause !== "preload") {
      await trackClick({ data: { linkId: link.id } });
    }

    return { link };
  },
  component: GoSlugRoute,
});

function GoSlugRoute() {
  const { link } = Route.useLoaderData();
  return <InterstitialPage link={link} />;
}
