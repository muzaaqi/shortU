import { describe, expect, test } from "bun:test";
import { normalizeInputUrl, slugPrefixFromOrigin } from "./utils";

describe("normalizeInputUrl", () => {
  test("returns null for empty or blank input", () => {
    expect(normalizeInputUrl("")).toBeNull();
    expect(normalizeInputUrl("   ")).toBeNull();
  });

  test("prepends https:// when scheme is missing", () => {
    expect(normalizeInputUrl("example.com/page")).toBe("https://example.com/page");
  });

  test("preserves an explicit http scheme", () => {
    expect(normalizeInputUrl("http://example.com")).toBe("http://example.com/");
  });

  test("rejects non-http schemes", () => {
    expect(normalizeInputUrl("ftp://files.example.com")).toBeNull();
  });

  test("rejects strings that cannot form a URL", () => {
    expect(normalizeInputUrl("ht!tp:bad url")).toBeNull();
  });
});

describe("slugPrefixFromOrigin", () => {
  test("renders host with trailing slash", () => {
    expect(slugPrefixFromOrigin("https://shortu.dev")).toBe("shortu.dev/");
  });

  test("keeps the port", () => {
    expect(slugPrefixFromOrigin("http://localhost:3000")).toBe("localhost:3000/");
  });

  test("returns empty string for nullish or malformed origins", () => {
    expect(slugPrefixFromOrigin(null)).toBe("");
    expect(slugPrefixFromOrigin(undefined)).toBe("");
    expect(slugPrefixFromOrigin("::::")).toBe("");
  });
});
