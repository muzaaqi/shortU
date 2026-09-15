/**
 * Unit tests for QR code generation utility.
 * Verifies PNG base64 data URL and vector SVG output generation.
 */
import { describe, expect, it } from "bun:test";
import { generateQR, generateQRSvg } from "./qr";

describe("QR Code Generation Utility", () => {
  it("generates a valid PNG data URL from a URL", async () => {
    const dataUrl = await generateQR("https://shortu.dev/abc1234");
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    expect(dataUrl.length).toBeGreaterThan(100);
  });

  it("generates a valid SVG string from a URL", async () => {
    const svg = await generateQRSvg("https://shortu.dev/abc1234");
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("applies custom color options correctly", async () => {
    const svg = await generateQRSvg("https://shortu.dev/abc1234", {
      darkColor: "#ff0000",
      lightColor: "#00ff00",
    });
    expect(svg).toContain("#ff0000");
  });
});
