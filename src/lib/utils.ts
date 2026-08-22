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
