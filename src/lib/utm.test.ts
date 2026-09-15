import { describe, expect, it } from "bun:test";
import {
  buildUtmUrl,
  hasUtmParams,
  parseUtmParams,
  type UtmParams,
} from "./utm";

describe("UTM Parameter Utilities", () => {
  it("builds a URL with basic UTM parameters", () => {
    const params: UtmParams = {
      utmSource: "twitter",
      utmMedium: "social",
      utmCampaign: "launch_2026",
    };
    const result = buildUtmUrl("https://example.com/product", params);
    expect(result).toBe(
      "https://example.com/product?utm_source=twitter&utm_medium=social&utm_campaign=launch_2026"
    );
  });

  it("preserves existing query parameters and hash anchors", () => {
    const params: UtmParams = {
      utmSource: "newsletter",
      utmMedium: "email",
      utmTerm: "sale",
      utmContent: "header_cta",
    };
    const result = buildUtmUrl("https://example.com/pricing?ref=promo#annual", params);
    expect(result).toBe(
      "https://example.com/pricing?ref=promo&utm_source=newsletter&utm_medium=email&utm_term=sale&utm_content=header_cta#annual"
    );
  });

  it("ignores empty, undefined, or whitespace-only parameters", () => {
    const params: UtmParams = {
      utmSource: "google",
      utmMedium: "   ",
      utmCampaign: undefined,
    };
    const result = buildUtmUrl("https://example.com", params);
    expect(result).toBe("https://example.com/?utm_source=google");
  });

  it("returns base URL unchanged if all UTM parameters are empty", () => {
    const params: UtmParams = {
      utmSource: "",
      utmMedium: undefined,
    };
    const result = buildUtmUrl("https://example.com/blog", params);
    expect(result).toBe("https://example.com/blog");
  });

  it("detects whether UTM parameters are populated", () => {
    expect(hasUtmParams({})).toBe(false);
    expect(hasUtmParams({ utmSource: "   " })).toBe(false);
    expect(hasUtmParams({ utmSource: "twitter" })).toBe(true);
    expect(hasUtmParams({ utmCampaign: "spring" })).toBe(true);
  });

  it("parses UTM parameters from a URL", () => {
    const url = "https://example.com/store?cat=shoes&utm_source=ig&utm_campaign=summer#top";
    const { baseUrl, utm } = parseUtmParams(url);
    expect(baseUrl).toBe("https://example.com/store?cat=shoes#top");
    expect(utm.utmSource).toBe("ig");
    expect(utm.utmCampaign).toBe("summer");
    expect(utm.utmMedium).toBeUndefined();
  });
});
