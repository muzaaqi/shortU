/**
 * Unified shorten flow mounted in ResponsiveOverlay (Drawer on mobile,
 * Dialog on tablet/desktop). All form logic, markup, and action rows live
 * in ShortenDialogContent — shared verbatim by both native shells.
 * The content remounts (keyed) on every open so drafts never leak between
 * opens and initialUrl prefills via mount defaults. Public API unchanged.
 * Used by: src/routes/index.tsx (via shorten-trigger), src/routes/dashboard.tsx
 */
import { memo, useEffect, useState } from "react";
import { ShortenDialogContent } from "~/components/shorten-dialog-content";
import { ResponsiveOverlay } from "~/components/ui/responsive-overlay";

export interface ShortenDialogProps {
  /** Whether the overlay is open. */
  open: boolean;
  /** Open-state change relayed by ResponsiveOverlay's active shell. */
  onOpenChange: (open: boolean) => void;
  /** Value used to prefill the destination URL field on open. */
  initialUrl?: string;
}

export const ShortenDialog = memo(function ShortenDialog({
  open,
  onOpenChange,
  initialUrl = "",
}: ShortenDialogProps) {
  // Bump a counter each time the overlay opens so the content remounts fresh
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    if (open) {
      setOpenCount((count) => count + 1);
    }
  }, [open]);

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={onOpenChange}
      title="Shorten a URL"
      description="Pick a random or custom slug. QR generation is optional."
    >
      <ShortenDialogContent
        key={openCount}
        initialUrl={initialUrl}
        onClose={() => onOpenChange(false)}
      />
    </ResponsiveOverlay>
  );
});
