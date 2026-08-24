/**
 * Zod schema for the shorten-link dialog form — single source of truth for
 * both runtime validation and the ShortenFormValues TypeScript type.
 * The custom-slug rules mirror createLink's server validator in
 * src/server/functions/links.ts (SLUG_REGEX + reserved list).
 * Used by: src/components/shorten-dialog.tsx (re-exported via ~/lib/schema)
 */
import { z } from "zod";
import { SLUG_REGEX, RESERVED_SLUGS } from "~/lib/slugify";
import { normalizeInputUrl } from "~/lib/utils";

export const shortenFormSchema = z.object({
  url: z
    .string()
    .min(1, "Please enter a destination URL")
    .refine((val) => normalizeInputUrl(val) !== null, "Please enter a valid URL address"),
  customSlug: z
    .string()
    .refine(
      (val) => !val || SLUG_REGEX.test(val),
      "Slug must be 3–50 lowercase alphanumeric characters or hyphens",
    )
    .refine(
      (val) => !val || !RESERVED_SLUGS.includes(val),
      "This custom slug is reserved",
    ),
});

/** Inferred form values type — the only shape ShortenDialog's form handles. */
export type ShortenFormValues = z.infer<typeof shortenFormSchema>;
