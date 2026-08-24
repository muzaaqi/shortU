/**
 * OAuth Sign-In Modal component rendered through ResponsiveOverlay
 * (Drawer on mobile, Dialog on tablet/desktop).
 * Provider buttons live in the shared OAuthButtons component.
 * Used by: src/components/user-nav.tsx, src/routes/dashboard.tsx,
 *          src/components/shorten-dialog-content.tsx
 */
import { ShieldCheck } from "lucide-react";
import { memo } from "react";
import { OAuthButtons } from "~/components/oauth-buttons";
import { ResponsiveOverlay } from "~/components/ui/responsive-overlay";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthModal = memo(function AuthModal({
  open,
  onOpenChange,
}: AuthModalProps) {
  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={onOpenChange}
      title="Sign In to shortU"
      description="Connect your account to save your shortened links, manage custom aliases, and access click telemetry."
      contentClassName="sm:max-w-sm"
    >
      <OAuthButtons />
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          <span>Secured OAuth sign-in</span>
        </div>
      </div>
    </ResponsiveOverlay>
  );
});
