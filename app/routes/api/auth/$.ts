/**
 * Better Auth API catch-all route.
 * Handles all /api/auth/* requests (OAuth callbacks, session, etc).
 * Do not modify this file.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
  component: () => null,
});
