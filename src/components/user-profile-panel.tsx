/**
 * Shell-agnostic profile panel content.
 * Renders: (1) user identity header, (2) stats mini-card, (3) destructive logout button.
 * Mounted inside a Popover (tablet/desktop) or Drawer (mobile) by TopNav.
 * Used by: src/components/top-nav.tsx
 */
import { useQuery } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import { Link2, MousePointerClick } from "lucide-react";
import { memo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { signOut, useSession } from "~/lib/auth";
import { cn } from "~/lib/utils";
import { getUserStats } from "~/server/functions/links";

/** Query key for user aggregate stats. */
export const USER_STATS_KEYS = {
  all: ["user-stats"] as const,
};

interface UserProfilePanelProps {
  /** Called when the user triggers sign-out — use to close the containing popover/drawer. */
  onClose?: () => void;
  className?: string;
}

function getInitials(name?: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const UserProfilePanel = memo(function UserProfilePanel({
  onClose,
  className,
}: UserProfilePanelProps) {
  const { data: session } = useSession();
  const [imageError, setImageError] = useState(false);

  const { data: stats } = useQuery({
    queryKey: USER_STATS_KEYS.all,
    queryFn: () => getUserStats(),
    enabled: !!session?.user,
  });

  const handleSignOut = async () => {
    onClose?.();
    await signOut();
    window.location.href = "/";
  };

  if (!session?.user) return null;

  const user = session.user;
  const initials = getInitials(user.name);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* ── Section 1: Identity ──────────────────────────── */}
      <div className="flex items-center gap-3 px-1">
        {/* Avatar */}
        {user.image && !imageError ? (
          <Image
            src={user.image}
            width={40}
            height={40}
            alt={user.name || "User avatar"}
            layout="constrained"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={() => setImageError(true)}
            className="size-10 rounded-full object-cover border border-border ring-1 ring-border/50 shrink-0"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold select-none shrink-0">
            {initials}
          </div>
        )}
        {/* Name + email */}
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-foreground truncate leading-snug">
            {user.name || "User"}
          </span>
          <span className="text-xs text-muted-foreground truncate leading-snug">
            {user.email}
          </span>
        </div>
      </div>

      {/* ── Hairline separator ───────────────────────────── */}
      <div className="border-t border-border" />

      {/* ── Section 2: Stats mini-card ───────────────────── */}
      <Card size="sm" className="mx-1">
        <CardContent className="flex items-center justify-around gap-2 py-2">
          {/* URL count */}
          <div className="flex flex-col items-center gap-0.5" title="Total links">
            <Link2 className="size-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {stats?.linkCount ?? 0}
            </span>
          </div>
          {/* Divider */}
          <div className="w-px h-6 bg-border" />
          {/* Total clicks */}
          <div className="flex flex-col items-center gap-0.5" title="Total clicks">
            <MousePointerClick className="size-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {stats?.totalClicks ?? 0}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: Sign out ──────────────────────────── */}
      <div className="mx-1">
        <Button
          variant="destructive"
          className="w-full cursor-pointer"
          onClick={handleSignOut}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
});
