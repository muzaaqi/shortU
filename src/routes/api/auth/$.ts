/**
 * Better Auth API catch-all route.
 * Handles all /api/auth/* requests (OAuth callbacks, sessions, etc).
 * Used by: Better Auth client and OAuth providers
 */
import { createFileRoute } from "@tanstack/react-router";
import { auth } from "~/lib/auth-server";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }) => auth.handler(request),
      POST: async ({ request }) => auth.handler(request),
    },
  },
});
