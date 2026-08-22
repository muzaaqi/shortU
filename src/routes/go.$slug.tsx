/**
 * Interstitial ad page route.
 * Surface Mode: Experience
 * Used by: TanStack Router for route "/go/$slug"
 */
import { createFileRoute } from "@tanstack/react-router";
import { getLinkBySlug } from "~/server/functions/links";

export const Route = createFileRoute("/go/$slug")({
  loader: async ({ params }) => {
    const link = await getLinkBySlug({ data: { slug: params.slug } });
    return { link };
  },
  component: InterstitialPage,
});

function InterstitialPage() {
  const { link } = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-6">
      <h1 className="text-2xl font-bold">Redirecting...</h1>
      {link ? (
        <p className="text-muted-foreground font-mono text-sm">{link.originalUrl}</p>
      ) : (
        <p className="text-destructive text-sm">Link not found.</p>
      )}
    </div>
  );
}
