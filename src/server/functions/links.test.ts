import { describe, expect, it } from "bun:test";
import { generateSlug, validateSlug } from "~/lib/slugify";
import { createLink, getLinkBySlug } from "./links";

describe("Slugify and validation utilities", () => {
  it("generates 7-character nanoid slugs", () => {
    const slug = generateSlug();
    expect(slug).toBeDefined();
    expect(slug.length).toBe(7);
  });

  it("validates alphanumeric custom slugs", () => {
    expect(validateSlug("my-custom-slug").valid).toBe(true);
    expect(validateSlug("ab").valid).toBe(false); // too short
    expect(validateSlug("api").valid).toBe(false); // reserved
    expect(validateSlug("dashboard").valid).toBe(false); // reserved
    expect(validateSlug("INVALID!SLUG").valid).toBe(false); // uppercase/symbols
  });
});

describe("Link server functions", () => {
  it("exports createLink and getLinkBySlug server functions", () => {
    expect(createLink).toBeDefined();
    expect(getLinkBySlug).toBeDefined();
  });
});
