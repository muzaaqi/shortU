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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const URL_MAX_LENGTH = 2048;

/**
 * Protocols that are never valid shortening targets.
 * javascript: and data: enable XSS; file: leaks local paths;
 * ftp:/blob:/void: are not HTTP resources.
 */
const BLOCKED_PROTOCOLS = [
  "javascript:",
  "data:",
  "vbscript:",
  "file:",
  "blob:",
  "ftp:",
  "void:",
  "about:",
  "chrome:",
  "chrome-extension:",
];

/**
 * Private / reserved IP ranges that must not be reachable via a short link.
 * Prevents Server-Side Request Forgery (SSRF) if the redirect is ever
 * followed server-side (e.g. for link previews or analytics pings).
 * Covers: loopback, private RFC-1918, link-local, IANA reserved.
 */
const SSRF_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,         // 127.0.0.0/8 loopback
  /^10\.\d+\.\d+\.\d+$/,          // 10.0.0.0/8 private
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/, // 172.16.0.0/12 private
  /^192\.168\.\d+\.\d+$/,         // 192.168.0.0/16 private
  /^169\.254\.\d+\.\d+$/,         // 169.254.0.0/16 link-local (AWS metadata etc.)
  /^0\.0\.0\.0$/,
  /^\[?::1\]?$/,                  // IPv6 loopback
  /^\[?fc[0-9a-f]{2}:/i,          // IPv6 ULA fc00::/7
  /^\[?fe80:/i,                   // IPv6 link-local fe80::/10
  /^metadata\.google\.internal$/i, // GCP metadata endpoint
  /^169\.254\.169\.254$/,         // AWS / Azure metadata endpoint
];

/**
 * Ports that are not standard HTTP/HTTPS ports and commonly map to internal
 * services. Blocking them raises the bar for SSRF even if the hostname
 * passes the pattern check above.
 */
const BLOCKED_PORTS = new Set([
  "22",    // SSH
  "23",    // Telnet
  "25",    // SMTP
  "3306",  // MySQL
  "5432",  // PostgreSQL
  "6379",  // Redis
  "8080",  // Common dev server
  "8443",  // Common dev HTTPS
  "9200",  // Elasticsearch
  "27017", // MongoDB
]);

// ---------------------------------------------------------------------------
// URL validator helper
// ---------------------------------------------------------------------------

function getAppHostname(): string {
  const envUrl =
    (typeof process !== "undefined" ? process.env?.BETTER_AUTH_URL : undefined) ||
    import.meta.env?.BETTER_AUTH_URL;
  if (envUrl) {
    try {
      return new URL(envUrl).hostname.toLowerCase();
    } catch {
      return envUrl.toLowerCase();
    }
  }
  return "shortu.muzaaqi.my.id";
}

/**
 * Deep-validates a URL string beyond what normalizeInputUrl checks.
 * Returns null on success, or an error message string on failure.
 * Used by: shortenFormSchema (client form) and createLink (server validator)
 */
export function deepValidateUrl(raw: string): string | null {
  // 1. Length guard — browsers cap at ~2048; anything longer is suspicious
  if (raw.length > URL_MAX_LENGTH) {
    return `URL must be ${URL_MAX_LENGTH} characters or fewer`;
  }

  // 2. Strip surrounding whitespace and check for embedded whitespace /
  //    unicode control characters that can be used to obfuscate URLs
  const trimmed = raw.trim();
  // Reject null bytes, unicode direction overrides, zero-width chars
  // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional security check for URL obfuscation
  if (/[\u0000-\u001F\u007F\u200B-\u200D\u2028\u2029\uFEFF\u202A-\u202E]/.test(trimmed)) {
    return "URL contains invalid characters";
  }

  // 3. Protocol allowlist check for known blocked protocols first
  const lowerRaw = trimmed.toLowerCase();
  if (BLOCKED_PROTOCOLS.some((p) => lowerRaw.startsWith(p))) {
    return "This type of URL cannot be shortened";
  }

  // 4. Normalize + parse via browser URL API
  const normalized = normalizeInputUrl(trimmed);
  if (!normalized) return "Please enter a valid URL";

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return "Please enter a valid URL";
  }

  // 5. Only http: and https: are accepted
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "Only http:// and https:// URLs are supported";
  }

  // 5. Hostname must exist and not be a bare IP-like string with no TLD
  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || hostname === ".") {
    return "Please enter a valid URL";
  }

  // 6. SSRF / private network check
  if (SSRF_HOSTNAME_PATTERNS.some((pattern) => pattern.test(hostname))) {
    return "This URL points to a private or reserved address and cannot be shortened";
  }

  // 7. Port check — reject well-known internal service ports
  if (parsed.port && BLOCKED_PORTS.has(parsed.port)) {
    return "This URL uses a port that cannot be shortened";
  }

  // 8. Hostname must contain at least one dot (rejects bare hostnames like
  //    "http://intranet" or "http://myservice")
  if (!hostname.includes(".")) {
    return "Please enter a complete URL with a valid domain";
  }

  // 9. TLD must be at least 2 characters (rejects "http://foo.x")
  const tld = hostname.split(".").at(-1) ?? "";
  if (tld.length < 2) {
    return "Please enter a URL with a valid domain extension";
  }

  // 10. Reject URLs that resolve to the app itself (self-referential short links
  //     that create redirect loops).
  const appHost = getAppHostname();
  if (hostname === appHost || hostname.endsWith(`.${appHost}`)) {
    return "You cannot shorten a shortU link";
  }

  return null; // all checks passed
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const shortenFormSchema = z.object({
  url: z
    .string()
    .min(1, "Please enter a destination URL")
    .superRefine((val, ctx) => {
      const error = deepValidateUrl(val);
      if (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error,
        });
      }
    }),

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

  expiresIn: z.enum(["1h", "24h", "7d", "30d", "never"]).optional(),

  maxClicks: z
    .number()
    .int("Max clicks must be a whole number")
    .positive("Max clicks must be greater than 0")
    .max(1000000, "Max clicks cannot exceed 1,000,000")
    .optional(),
});

/** Inferred form values type — the only shape ShortenDialog's form handles. */
export type ShortenFormValues = z.infer<typeof shortenFormSchema>;