import { describe, expect, it } from "bun:test";
import { getSession } from "./auth";

describe("getSession server function", () => {
  it("should be defined and callable", () => {
    expect(getSession).toBeDefined();
    expect(typeof getSession).toBe("function");
  });
});
