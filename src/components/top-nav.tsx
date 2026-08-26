/**
 * Top navigation bar — single source of truth for the app header.
 * Left: logo/wordmark. Right: Dashboard link (auth only) + ThemeToggle + avatar trigger.
 * Avatar opens UserProfilePanel in a Popover (tablet/desktop) or Drawer (mobile).
 * Used by: src/routes/__root.tsx
 */
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { LayoutDashboard, Link2, LogIn } from "lucide-react";
import { memo, useState } from "react";
import { AuthModal } from "~/components/auth-modal";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { UserProfilePanel } from "~/components/user-profile-panel";
import { useMobile } from "~/hooks/use-mobile";
import { useSession } from "~/lib/auth";
import { cn } from "~/lib/utils";

/**
 * Circular avatar button — trigger for the profile panel.
 * Uses @unpic/react Image per AGENTS.md. width+height required.
 */
const AvatarButton = memo(function AvatarButton({
  image,
  name,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  image?: string | null | undefined;
  name?: string | null | undefined;
}) {
  const [imageError, setImageError] = useState(false);
  const initials = !name
    ? "U"
    : name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

  return (
    <button
      type="button"
      className={cn(
        "flex size-8 items-center justify-center rounded-full border border-border ring-1 ring-border/50 cursor-pointer transition-opacity hover:opacity-85 active:scale-95 overflow-hidden shrink-0",
        className
      )}
      aria-label="Open profile menu"
      {...props}
    >
      {image && !imageError ? (
        <Image
          src={image}
          width={32}
          height={32}
          alt={name || "User avatar"}
          layout="constrained"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={() => setImageError(true)}
          className="size-full object-cover"
        />
      ) : (
        <span className="flex size-full items-center justify-center bg-primary text-primary-foreground text-xs font-bold select-none">
          {initials}
        </span>
      )}
    </button>
  );
});

export const TopNav = memo(function TopNav() {
  const { data: session, isPending } = useSession();
  const isMobile = useMobile();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-[60px] max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-foreground tracking-tight"
        >
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Link2 className="size-4" />
          </div>
          <span>
            short<span className="text-primary font-bold">U</span>
          </span>
        </Link>

        {/* Right cluster */}
        <nav className="flex items-center gap-2">
          {/* Dashboard link — only visible when logged in */}
          {user && (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors [&.active]:text-foreground [&.active]:font-semibold [&.active]:bg-secondary/80"
            >
              <LayoutDashboard className="size-3.5 shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          )}

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Profile area */}
          {isPending ? (
            <div className="size-8 rounded-full bg-secondary/60 animate-pulse" />
          ) : !user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAuthModal(true)}
                className="gap-1.5 text-xs font-semibold h-8 px-3 border-border hover:bg-secondary cursor-pointer transition-all active:scale-[0.98]"
              >
                <LogIn className="size-3.5" />
                <span>Sign In</span>
              </Button>
              <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
            </>
          ) : isMobile ? (
            /* Mobile — Drawer (<640px) */
            <Drawer open={profileOpen} onOpenChange={setProfileOpen}>
              <DrawerTrigger
                render={
                  <AvatarButton
                    image={user.image}
                    name={user.name}
                  />
                }
              />
              <DrawerContent>
                <DrawerHeader className="text-left pb-0">
                  <DrawerTitle className="sr-only">Profile</DrawerTitle>
                </DrawerHeader>
                <div className="flex-1 overflow-y-auto px-4 py-3">
                  <UserProfilePanel onClose={() => setProfileOpen(false)} />
                </div>
                <DrawerFooter />
              </DrawerContent>
            </Drawer>
          ) : (
            /* Tablet/Desktop — Popover (>=640px) */
            <Popover open={profileOpen} onOpenChange={setProfileOpen}>
              <PopoverTrigger
                render={
                  <AvatarButton
                    image={user.image}
                    name={user.name}
                  />
                }
              />
              <PopoverContent
                side="bottom"
                align="end"
                sideOffset={8}
                className="w-72 p-3"
              >
                <UserProfilePanel onClose={() => setProfileOpen(false)} />
              </PopoverContent>
            </Popover>
          )}
        </nav>
      </div>
    </header>
  );
});
