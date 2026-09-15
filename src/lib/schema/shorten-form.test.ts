import { describe, expect, test } from "bun:test";
import { deepValidateUrl, shortenFormSchema } from "./shorten-form";

describe("deepValidateUrl", () => {
  test("allows valid http and https URLs", () => {
    expect(deepValidateUrl("https://example.com/some/path")).toBeNull();
    expect(deepValidateUrl("http://sub.domain.org")).toBeNull();
  });

  test("rejects dangerous protocols", () => {
    expect(deepValidateUrl("javascript:alert(1)")).toBe("This type of URL cannot be shortened");
    expect(deepValidateUrl("data:text/html,<h1>test</h1>")).toBe("This type of URL cannot be shortened");
    expect(deepValidateUrl("file:///etc/passwd")).toBe("This type of URL cannot be shortened");
  });

  test("rejects internal SSRF hostnames and IP addresses", () => {
    expect(deepValidateUrl("http://localhost:8080")).toBe(
      "This URL points to a private or reserved address and cannot be shortened",
    );
    expect(deepValidateUrl("http://127.0.0.1/admin")).toBe(
      "This URL points to a private or reserved address and cannot be shortened",
    );
    expect(deepValidateUrl("http://169.254.169.254/latest/meta-data/")).toBe(
      "This URL points to a private or reserved address and cannot be shortened",
    );
    expect(deepValidateUrl("http://192.168.1.1")).toBe(
      "This URL points to a private or reserved address and cannot be shortened",
    );
  });

  test("rejects blocked service ports", () => {
    expect(deepValidateUrl("http://example.com:22/")).toBe(
      "This URL uses a port that cannot be shortened",
    );
    expect(deepValidateUrl("http://example.com:5432/")).toBe(
      "This URL uses a port that cannot be shortened",
    );
  });
});

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
