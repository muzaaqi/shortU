/**
 * Cross-platform Web Share and Clipboard helper.
 * Uses navigator.share on supported mobile/desktop browsers with automatic
 * fallback to navigator.clipboard and execCommand.
 * Used by: src/components/link-result.tsx, src/components/link-card.tsx
 */

export interface SharePayload {
  url: string;
  title?: string | undefined;
  text?: string | undefined;
}

export interface ShareResult {
  shared: boolean;
  copied: boolean;
}

/**
 * Checks if the browser supports the native Web Share API for links.
 */
export function canUseWebShare(): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }
  try {
    if (typeof navigator.canShare === "function") {
      return navigator.canShare({ url: "https://shortu.dev" });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Copies text to the clipboard with legacy fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy execCommand fallback
    }
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Attempts to trigger native share sheet; falls back to copying URL.
 */
export async function shareOrCopy(payload: SharePayload): Promise<ShareResult> {
  if (canUseWebShare()) {
    try {
      await navigator.share({
        title: payload.title ?? "shortU Link",
        text: payload.text ?? payload.url,
        url: payload.url,
      });
      return { shared: true, copied: false };
    } catch (err: unknown) {
      // If user aborted or dismissed the share sheet, return cleanly
      if (err instanceof Error && err.name === "AbortError") {
        return { shared: false, copied: false };
      }
      // Otherwise fall back to clipboard copy
    }
  }

  const copied = await copyToClipboard(payload.url);
  return { shared: false, copied };
}
