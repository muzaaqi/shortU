/**
 * Reusable responsive overlay shell: bottom-sheet Drawer on mobile (<768px),
 * centered Dialog on tablet/desktop. Both shells render identical header,
 * body, and footer content — callers pass content once, the shell adapts.
 * Close actions in footers must call onOpenChange(false); never embed
 * shell-specific parts like DialogClose here (they break across contexts).
 * Used by: src/components/shorten-dialog.tsx, src/components/auth-modal.tsx
 */
import type { ReactNode } from "react";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { DesktopContent, MobileContent } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";

export interface ResponsiveOverlayProps {
  /** Whether the overlay is open. */
  open: boolean;
  /** Open-state change relayed by whichever shell is active. */
  onOpenChange: (open: boolean) => void;
  /** Heading rendered in the active shell's header. */
  title: string;
  /** Optional supporting text under the title. */
  description?: string;
  /** Body content — identical across shells. */
  children: ReactNode;
  /** Optional action row, right-aligned under a hairline separator. */
  footer?: ReactNode;
  /** Passthrough class for shell width tweaks (e.g. "sm:max-w-lg"). */
  contentClassName?: string;
}

/**
 * Renders children in a Drawer on mobile or a Dialog on tablet/desktop,
 * keeping markup, state, and focus management in exactly one live shell.
 * Used by: src/components/shorten-dialog.tsx, src/components/auth-modal.tsx
 */
export function ResponsiveOverlay({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  contentClassName,
}: ResponsiveOverlayProps) {
  return (
    <>
      {/* Mobile: bottom sheet */}
      <MobileContent>
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className={cn("max-h-[85vh] overflow-y-auto", contentClassName)}>
            <DrawerHeader className="text-left">
              <DrawerTitle>{title}</DrawerTitle>
              {description && <DrawerDescription>{description}</DrawerDescription>}
            </DrawerHeader>
            <div className="px-4 pb-2">{children}</div>
            {footer && (
              <DrawerFooter className="flex-row justify-end gap-2">{footer}</DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>
      </MobileContent>

      {/* Tablet/Desktop: centered dialog */}
      <DesktopContent>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogPopup className={cn("sm:max-w-md", contentClassName)}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
            <div className="py-2">{children}</div>
            {footer && (
              <div className="mt-2 flex justify-end gap-2 border-t border-border pt-3">
                {footer}
              </div>
            )}
          </DialogPopup>
        </Dialog>
      </DesktopContent>
    </>
  );
}
