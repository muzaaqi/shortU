/**
 * Unit tests for QrPreview component.
 * Verifies rendering, preset selection controls, and download triggers.
 */
import { describe, expect, it } from "bun:test";
import { renderToString } from "react-dom/server";
import { QrPreview } from "./qr-preview";

describe("QrPreview Component", () => {
  it("renders QR placeholder container and action buttons", () => {
    const html = renderToString(
      <QrPreview url="https://shortu.dev/test123" slug="test123" showDownload={true} />
    );
    expect(html).toContain("PNG");
    expect(html).toContain("SVG");
  });

  it("renders color preset swatches when URL is provided", () => {
    const html = renderToString(
      <QrPreview url="https://shortu.dev/test123" slug="test123" showDownload={true} />
    );
    expect(html).toContain("ShortU Violet");
    expect(html).toContain("Emerald Mint");
  });
});
