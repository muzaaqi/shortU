import { describe, expect, test } from "bun:test";
import { shortenFormSchema } from "./shorten-form";

describe("shortenFormSchema", () => {
  test("accepts a bare-domain URL without a custom slug", () => {
    const parsed = shortenFormSchema.parse({ url: "example.com/page", customSlug: "" });
    expect(parsed.url).toBe("example.com/page");
  });

  test("rejects an empty url", () => {
    expect(shortenFormSchema.safeParse({ url: "", customSlug: "" }).success).toBe(false);
  });

  test("rejects a malformed url", () => {
    expect(
      shortenFormSchema.safeParse({ url: "ht!tp:bad url", customSlug: "" }).success,
    ).toBe(false);
  });

  test("accepts a valid custom slug", () => {
    const parsed = shortenFormSchema.parse({ url: "https://example.com", customSlug: "my-link-1" });
    expect(parsed.customSlug).toBe("my-link-1");
  });

  test("rejects a custom slug violating the regex", () => {
    expect(
      shortenFormSchema.safeParse({ url: "https://example.com", customSlug: "Bad Slug!" }).success,
    ).toBe(false);
  });

  test("rejects a reserved custom slug", () => {
    expect(
      shortenFormSchema.safeParse({ url: "https://example.com", customSlug: "admin" }).success,
    ).toBe(false);
  });

  test("allows an empty custom slug", () => {
    expect(shortenFormSchema.safeParse({ url: "https://example.com", customSlug: "" }).success).toBe(true);
  });
});
