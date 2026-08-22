/**
 * Slug generation and validation utilities.
 * Used by: src/server/functions/links.ts, src/components/link-form.tsx
 */
import { nanoid } from "nanoid";

/** Generates a random 7-character URL-safe slug. */
export const generateSlug = (): string => nanoid(7);

/** Valid slug pattern: 3–50 lowercase alphanumeric characters or hyphens. */
export const SLUG_REGEX = /^[a-z0-9-]{3,50}$/;

/**
 * Route segments and keywords reserved by the app.
 * Custom slugs matching these are rejected.
 */
export const RESERVED_SLUGS = [
  "api",
  "dashboard",
  "go",
  "auth",
  "admin",
  "login",
  "logout",
  "signup",
  "register",
  "health",
];

/** Validates a custom slug string. Returns valid status and optional reason. */
export function validateSlug(slug: string): { valid: boolean; reason?: string } {
  if (!SLUG_REGEX.test(slug)) {
    return {
      valid: false,
      reason: "Slug must be 3–50 lowercase alphanumeric characters or hyphens.",
    };
  }
  if (RESERVED_SLUGS.includes(slug)) {
    return { valid: false, reason: "This slug is reserved. Please choose another." };
  }
  return { valid: true };
}
