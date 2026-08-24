/**
 * Barrel for all Zod schemas and their inferred types.
 * Consumers import exclusively from "~/lib/schema" so schema files can be
 * renamed/reorganized without touching call sites.
 * Used by: any module needing validation schemas or inferred types
 */
export * from "./shorten-form";
