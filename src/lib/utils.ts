/**
 * Shared utility functions.
 * Used by: all components
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind class names safely, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a date to a readable string. */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Truncates a URL for display. */
export function truncateUrl(url: string, maxLength = 50): string {
  if (url.length <= maxLength) return url;
  return `${url.slice(0, maxLength)}...`;
}

/**
 * Normalizes raw user URL input into an absolute http(s) URL string.
 * Trims whitespace and prepends "https://" when no scheme is present.
 * Returns null for empty input, unsupported schemes, or unparseable values.
 * Used by: src/lib/schema/shorten-form.ts, src/components/shorten-dialog.tsx
 */
export function normalizeInputUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Reject explicit non-http(s) schemes instead of letting the https://
  // prepend silently swallow them into malformed URLs
  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
  if (hasScheme && !/^https?:\/\//i.test(trimmed)) return null;
  const candidate = hasScheme ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Derives a "host/" display prefix for slug inputs from an origin string.
 * Returns "" for nullish or malformed origins so callers can render nothing.
 * Used by: src/components/shorten-dialog.tsx
 */
export function slugPrefixFromOrigin(origin: string | null | undefined): string {
  if (!origin) return "";
  try {
    return `${new URL(origin).host}/`;
  } catch {
    return "";
  }
}
