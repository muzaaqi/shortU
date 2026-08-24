/**
 * Responsive overlay shell: renders the FULL native Drawer on mobile (<768px)
 * or native Dialog on tablet/desktop around identical feature content.
 * Each shell supplies its own close affordance (DrawerClose/DialogClose X)
 * and default layout parts — callers provide only title/description/content.
 * Feature action rows belong inside children so they are shell-agnostic.
 * Shell selection uses a single early-return (muzone-universe pattern).
 * Used by: src/components/shorten-dialog.tsx, src/components/auth-modal.tsx
 */
import { X } from "lucide-react";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { useMobile } from "~/hooks/use-mobile";
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
  /** Feature content — body plus its own action row, identical in both shells. */
  children: ReactNode;
  /** Width passthrough for the desktop shell (e.g. "sm:max-w-sm"). */
  contentClassName?: string;
}

/**
 * Shared classes for the native close buttons in each shell. Safe because
 * the shells' own `fixed` positioning lives in the primitives and is never
 * overridden here (tailwind-merge would let a later position class win).
 */
const closeClasses =
  "absolute right-4 top-4 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer";

/**
 * Picks Drawer vs Dialog via a single early-return: one hook read, exactly
 * one live shell tree, zero wrapper components.
 * Used by: src/components/shorten-dialog.tsx, src/components/auth-modal.tsx
 */
export function ResponsiveOverlay({
  open,
  onOpenChange,
  title,
  description,
  children,
  contentClassName,
}: ResponsiveOverlayProps) {
  const isMobile = useMobile();

  if (isMobile) {
    return (
      // No "relative" here — DrawerContent's own `fixed bottom-0` positioning
      // must survive the className merge
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className={contentClassName}>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
          <div className="px-4 pb-4">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    // No "relative" here — DialogPopup's own `fixed left-1/2 top-1/2
    // -translate-x/y-1/2` centering must survive the className merge.
    // `fixed` already positions absolute children (the close button).
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className={cn("sm:max-w-md", contentClassName)}>
        <DialogClose className={closeClasses} title="Close">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-2">{children}</div>
      </DialogPopup>
    </Dialog>
  );
}
