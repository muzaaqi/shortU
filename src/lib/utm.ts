/**
 * UTM Campaign parameter utilities.
 * Handles parsing, building, and sanitizing Google Analytics / standard UTM query strings.
 * Used by: src/components/shorten-dialog-content.tsx
 */

export interface UtmParams {
  utmSource?: string | undefined;
  utmMedium?: string | undefined;
  utmCampaign?: string | undefined;
  utmTerm?: string | undefined;
  utmContent?: string | undefined;
}

const UTM_KEYS: Record<keyof UtmParams, string> = {
  utmSource: "utm_source",
  utmMedium: "utm_medium",
  utmCampaign: "utm_campaign",
  utmTerm: "utm_term",
  utmContent: "utm_content",
};

/**
 * Checks if any UTM parameter has a non-empty string value.
 */
export function hasUtmParams(params: UtmParams | undefined | null): boolean {
  if (!params) return false;
  return Object.values(params).some(
    (value) => typeof value === "string" && value.trim().length > 0
  );
}

/**
 * Appends non-empty UTM parameters to a base URL, preserving existing search params and hash.
 */
export function buildUtmUrl(baseUrl: string, params: UtmParams): string {
  if (!baseUrl.trim() || !hasUtmParams(params)) {
    return baseUrl;
  }

  try {
    const parsed = new URL(
      baseUrl.startsWith("http://") || baseUrl.startsWith("https://")
        ? baseUrl
        : `https://${baseUrl}`
    );

    for (const [key, paramName] of Object.entries(UTM_KEYS) as [keyof UtmParams, string][]) {
      const val = params[key]?.trim();
      if (val) {
        parsed.searchParams.set(paramName, val);
      } else {
        parsed.searchParams.delete(paramName);
      }
    }

    return parsed.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * Extracts UTM parameters from a URL and returns the clean base URL along with parsed UTM values.
 */
export function parseUtmParams(urlStr: string): { baseUrl: string; utm: UtmParams } {
  const utm: UtmParams = {};
  try {
    const parsed = new URL(
      urlStr.startsWith("http://") || urlStr.startsWith("https://")
        ? urlStr
        : `https://${urlStr}`
    );

    for (const [key, paramName] of Object.entries(UTM_KEYS) as [keyof UtmParams, string][]) {
      const val = parsed.searchParams.get(paramName);
      if (val) {
        utm[key] = val;
        parsed.searchParams.delete(paramName);
      }
    }

    return {
      baseUrl: parsed.toString(),
      utm,
    };
  } catch {
    return { baseUrl: urlStr, utm };
  }
}
