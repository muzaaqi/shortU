/**
 * Server function for authentication session retrieval.
 * Wraps Better Auth session checks for loaders and client hooks.
 * Used by: src/routes/__root.tsx, src/routes/dashboard.tsx, src/server/functions/links.ts
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "~/lib/auth-server";

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const request = getRequest();
      const session = await auth.api.getSession({
        headers: request?.headers || new Headers(),
      });
      return session;
    } catch {
      return null;
    }
  }
);
