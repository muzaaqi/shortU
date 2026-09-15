import { describe, expect, it } from "bun:test";
import { canUseWebShare, copyToClipboard, shareOrCopy } from "./share";

describe("Share & Clipboard Utility", () => {
  it("detects Web Share API availability safely", () => {
    expect(typeof canUseWebShare()).toBe("boolean");
  });

  it("handles copyToClipboard fallback gracefully in test environment", async () => {
    const success = await copyToClipboard("https://shortu.dev/test1234");
    expect(typeof success).toBe("boolean");
  });

  it("shareOrCopy executes without throwing errors", async () => {
    const result = await shareOrCopy({
      url: "https://shortu.dev/test1234",
      title: "shortU Link",
      text: "Check out this shortened link",
    });
    expect(typeof result.shared).toBe("boolean");
    expect(typeof result.copied).toBe("boolean");
  });
});
