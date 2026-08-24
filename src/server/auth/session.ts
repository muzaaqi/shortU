/**
 * Resolves the current Better Auth session from the incoming request.
 * Deliberately a plain server module — NOT a createServerFn — so other
 * server functions can call it without an internal RPC hop, which breaks
 * on Cloudflare Workers ("Server function info not found" surfacing on the
 * client during response deserialization).
 * Used by: src/server/functions/links.ts
 */
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "~/lib/auth-server";

/**
 * Returns the authenticated session for the current request, or null when
 * unauthenticated or when Better Auth fails. Never throws.
 * Used by: createLink/getLinks/deleteLink/toggleAdMode handlers
 */
export async function getCurrentSession() {
  try {
    const request = getRequest();
    return await auth.api.getSession({
      headers: request?.headers || new Headers(),
    });
  } catch {
    // Session resolution must never break the surrounding handler
    return null;
  }
}
