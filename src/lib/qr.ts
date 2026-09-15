/**
 * QR code generation utility.
 * Generates PNG data URLs and vector SVG strings on-demand.
 * Can be safely called on client or server.
 * Used by: src/components/qr-preview.tsx, src/server/functions/links.ts
 */
import QRCode from "qrcode";

export interface QROptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

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
