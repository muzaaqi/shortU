/**
 * Device-class detection for responsive overlays.
 * useMobile reports whether the viewport is below the mobile breakpoint,
 * backed by a matchMedia subscription via useSyncExternalStore (SSR-safe:
 * the server snapshot is always false, so SSR renders the desktop variant).
 * MobileContent/DesktopContent conditionally mount children so only one
 * overlay shell (Drawer vs Dialog) ever exists in the DOM.
 * Used by: src/components/ui/responsive-overlay.tsx
 */
import { type ReactNode, useSyncExternalStore } from "react";

/** Viewports narrower than this are treated as mobile (Drawer surfaces). */
export const MOBILE_BREAKPOINT = 768;

function subscribe(onChange: () => void): () => void {
  const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
  const mediaQueryList = window.matchMedia(query);
  mediaQueryList.addEventListener("change", onChange);
  return () => mediaQueryList.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Reports whether the current viewport is mobile-sized.
 * Used by: MobileContent, DesktopContent
 */
export function useMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Mounts children only on mobile-sized viewports.
 * Used by: src/components/ui/responsive-overlay.tsx
 */
export function MobileContent({ children }: { children: ReactNode }) {
  const isMobile = useMobile();
  if (!isMobile) return null;
  return <>{children}</>;
}

/**
 * Mounts children only on tablet/desktop viewports.
 * Used by: src/components/ui/responsive-overlay.tsx
 */
export function DesktopContent({ children }: { children: ReactNode }) {
  const isMobile = useMobile();
  if (isMobile) return null;
  return <>{children}</>;
}
