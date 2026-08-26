/**
 * Shell-agnostic profile panel content.
 * Renders: (1) user identity header, (2) stats mini-card, (3) destructive logout button.
 * Mounted inside a Popover (tablet/desktop) or Drawer (mobile) by TopNav.
 * Used by: src/components/top-nav.tsx
 */
import { useQuery } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import { Link2, LogOut, MousePointerClick } from "lucide-react";
import { memo, useState } from "react";
import { Button } from "~/components/ui/button";
import { signOut, useSession } from "~/lib/auth";
import { cn } from "~/lib/utils";
import { getUserStats } from "~/server/functions/links";
import { Separator } from "./ui/separator";

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
          <span className="text-xs text-muted-foreground truncate leading-snug">{user.email}</span>
        </div>
      </div>

      {/* ── Hairline separator ───────────────────────────── */}
      <Separator />

      {/* ── Section 2: Stats mini-card ───────────────────── */}
      {/* Summary Telemetry Metrics */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              label: "Active",
              value: String(stats?.linkCount ?? 0),
              icon: <Link2 className="size-4" />,
              accent: "text-primary",
            },
            {
              label: "Clicks",
              value: stats?.totalClicks.toLocaleString(),
              icon: <MousePointerClick className="size-4" />,
              accent: "text-primary",
            },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-2xs"
            >
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className={metric.accent}>{metric.icon}</span>
                <span>{metric.label}</span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Section 3: Sign out ──────────────────────────── */}
      <Button
        variant="destructive"
        size="lg"
        className="w-full cursor-pointer"
        onClick={handleSignOut}
      >
        <LogOut />
        Sign out
      </Button>
    </div>
  );
});
