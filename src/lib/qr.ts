/**
 * QR code generation utility.
 * Always called server-side inside createLink server function.
 * Used by: src/server/functions/links.ts
 */
import QRCode from "qrcode";

/**
 * Generates a QR code from a URL.
 * Returns a base64-encoded PNG data URL suitable for <img src={...} />.
 */
export async function generateQR(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}
