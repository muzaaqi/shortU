/**
 * SSR entry point for TanStack Start.
 * Handles server-side rendering of pages and API routes.
 */
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { auth } from "~/lib/auth-server";

export default createServerEntry({
  fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/auth")) {
      return auth.handler(request);
    }
    return handler.fetch(request);
  },
});
