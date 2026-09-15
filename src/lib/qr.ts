/**
 * QR code generation utility.
 * Generates PNG data URLs and vector SVG strings on-demand with color presets.
 * Can be safely called on client or server.
 * Used by: src/components/qr-preview.tsx, src/server/functions/links.ts
 */
import QRCode from "qrcode";

export interface QROptions {
  width?: number | undefined;
  margin?: number | undefined;
  darkColor?: string | undefined;
  lightColor?: string | undefined;
}

export interface QRColorPreset {
  id: string;
  name: string;
  color: string;
  bg: string;
}

export const QR_COLOR_PRESETS: QRColorPreset[] = [
  { id: "classic", name: "Classic Dark", color: "#0f172a", bg: "#ffffff" },
  { id: "brand", name: "ShortU Violet", color: "#7c3aed", bg: "#ffffff" },
  { id: "mint", name: "Emerald Mint", color: "#059669", bg: "#ffffff" },
  { id: "coral", name: "Sunset Coral", color: "#e11d48", bg: "#ffffff" },
  { id: "indigo", name: "Deep Indigo", color: "#2563eb", bg: "#ffffff" },
];

/**
 * Generates a base64-encoded PNG data URL from a URL string.
 */
export async function generateQR(url: string, options?: QROptions): Promise<string> {
  return QRCode.toDataURL(url, {
    width: options?.width ?? 300,
    margin: options?.margin ?? 2,
    color: {
      dark: options?.darkColor ?? "#000000",
      light: options?.lightColor ?? "#ffffff",
    },
  });
}

/**
 * Generates an SVG string from a URL string.
 */
export async function generateQRSvg(url: string, options?: QROptions): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    width: options?.width ?? 300,
    margin: options?.margin ?? 2,
    color: {
      dark: options?.darkColor ?? "#000000",
      light: options?.lightColor ?? "#ffffff",
    },
  });
}
