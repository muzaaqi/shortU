/**
 * User Navigation & Profile Header Component.
 * Displays OAuth sign-in trigger or authenticated user profile menu with Sign Out.
 * Used by: src/routes/__root.tsx
 */
import { Link } from "@tanstack/react-router";
import { LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { memo, useState } from "react";
import { AuthModal } from "~/components/auth-modal";
import { Button } from "~/components/ui/button";
import { signOut, useSession } from "~/lib/auth";

export const UserNav = memo(function UserNav() {
  const { data: session, isPending } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  if (isPending) {
    return (
      <div className="h-8 w-20 rounded-md bg-secondary/60 animate-pulse" />
    );
  }

  if (!session?.user) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAuthModal(true)}
          className="gap-2 text-xs font-semibold h-8.5 px-3 border-border hover:bg-secondary cursor-pointer transition-all active:scale-[0.98]"
        >
          <LogIn className="size-3.5" />
          <span>Sign In</span>
        </Button>
        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
        />
      </>
    );
  }

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/dashboard"
        className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-secondary/60 [&.active]:text-foreground [&.active]:font-semibold [&.active]:bg-secondary/80"
      >
        <LayoutDashboard className="size-3.5" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>

      <div className="flex items-center gap-2 pl-2 border-l border-border">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            className="size-7 rounded-full object-cover border border-border ring-1 ring-border/50"
          />
        ) : (
          <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold select-none shadow-2xs">
            {initials}
          </div>
        )}

        <span className="text-xs font-medium text-foreground hidden md:inline max-w-[120px] truncate" title={user.name || user.email}>
          {user.name || user.email}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="size-3.5" />
        </Button>
      </div>
    </div>
  );
});
