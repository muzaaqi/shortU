/**
 * Landing page route.
 * Renders the main shortU URL shortener form and feature presentation.
 * Used by: /
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-4xl text-center">
      <h1 className="text-4xl font-medium tracking-tight mb-4">
        short<span className="text-[var(--accent)]">U</span>
      </h1>
      <p className="text-[var(--muted)] text-lg mb-8">
        Clean URL shortener and QR code generator.
      </p>
    </main>
  );
}
