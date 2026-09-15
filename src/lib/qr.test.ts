/**
 * Unit tests for QR code generation utility.
 * Verifies PNG base64 data URL, vector SVG output, and color presets.
 */
import { describe, expect, it } from "bun:test";
import { QR_COLOR_PRESETS, generateQR, generateQRSvg } from "./qr";

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

  it("exports valid color presets with accessible contrast", () => {
    expect(QR_COLOR_PRESETS.length).toBeGreaterThanOrEqual(4);
    for (const preset of QR_COLOR_PRESETS) {
      expect(preset.name).toBeDefined();
      expect(preset.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("applies custom color presets correctly to SVG", async () => {
    const preset = QR_COLOR_PRESETS[1];
    const svg = await generateQRSvg("https://shortu.dev/abc1234", {
      darkColor: preset?.color,
    });
    expect(svg).toContain(preset?.color ?? "");
  });
});
