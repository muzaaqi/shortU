import { describe, expect, it } from "bun:test";
import { getLinkStats, trackClick } from "./analytics";

describe("Analytics server functions", () => {
  it("should export trackClick and getLinkStats as server functions", () => {
    expect(trackClick).toBeDefined();
    expect(getLinkStats).toBeDefined();
    expect(typeof trackClick).toBe("function");
    expect(typeof getLinkStats).toBe("function");
  });
});
