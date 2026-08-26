/**
 * Hook and utility for reading text from the system clipboard.
 * Gracefully handles permission denials, unsupported environments (SSR),
 * and clipboard access errors.
 * Used by: src/components/shorten-dialog-content.tsx, src/components/shorten-trigger.tsx
 */
import { useCallback } from "react";

/**
 * Reads plain text from navigator.clipboard when available.
 * Returns trimmed string or null on permission rejection / unavailable clipboard API.
 */
export async function readClipboardText(): Promise<string | null> {
  try {
    if (typeof navigator === "undefined" || !navigator.clipboard?.readText) {
      return null;
    }
    const text = await navigator.clipboard.readText();
    const trimmed = text?.trim();
    return trimmed ? trimmed : null;
  } catch {
    // Clipboard permission denied, document not focused, or unsupported browser context
    return null;
  }
}

/**
 * React hook that exposes a paste handler which reads clipboard text
 * and optionally passes it to an onPaste callback.
 */
export function useClipboardPaste(onPaste?: (text: string) => void) {
  const paste = useCallback(async () => {
    const text = await readClipboardText();
    if (text && onPaste) {
      onPaste(text);
    }
    return text;
  }, [onPaste]);

  return { paste };
}
