/**
 * Device-class detection for responsive overlays (muzone-universe pattern).
 * State syncs with matchMedia inside an effect, so SSR renders the desktop
 * shell first with zero hydration mismatch — mobile sees one brief
 * desktop-styled frame before correcting.
 * Used by: src/components/ui/responsive-overlay.tsx
 */
import { useEffect, useState } from "react";

/** Viewports narrower than this are treated as mobile (Drawer surfaces). */
export const MOBILE_BREAKPOINT = 640;

/**
 * Reports whether the current viewport is mobile-sized.
 * Used by: src/components/ui/responsive-overlay.tsx
 */
export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
    );
    const handleChange = () => setIsMobile(mediaQueryList.matches);
    setIsMobile(mediaQueryList.matches);
    mediaQueryList.addEventListener("change", handleChange);
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}
