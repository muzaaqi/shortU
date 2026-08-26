/**
 * Interstitial ad route handler (/go/$slug).
 * Renders destination preview, sponsored ad placement, and automated countdown.
 * Surface Mode: Experience
 * Used by: TanStack Router for route "/go/$slug"
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { InterstitialPage } from "~/components/interstitial-page";
import { trackClick } from "~/server/functions/analytics";
import { getLinkBySlug } from "~/server/functions/links";

export const Route = createFileRoute("/go/$slug")({
  loader: async ({ params, cause }) => {
    const slug = params.slug;
    const link = await getLinkBySlug({ data: { slug } });

    if (!link) {
      throw redirect({
        to: "/",
      });
    }

    // Fire-and-forget click telemetry. Skipped on hover/intent prefetches
    // (cause === "preload") so phantom loader runs never inflate the counter.
    if (cause !== "preload") {
      trackClick({ data: { linkId: link.id } }).catch(() => {
        // ignore telemetry errors
      });
    }

    return { link };
  },
  component: GoSlugRoute,
});

function GoSlugRoute() {
  const { link } = Route.useLoaderData();
  return <InterstitialPage link={link} />;
}
