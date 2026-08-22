/**
 * Dashboard page route.
 * Displays user's shortened links, analytics telemetry, QR codes, and ad toggles.
 * Surface Mode: Operate
 * Used by: TanStack Router for route "/dashboard"
 */
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  Link2,
  LogIn,
  Plus,
  Radio,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";
import { useState } from "react";
import { AuthModal } from "~/components/auth-modal";
import { LinkCard, type LinkItem } from "~/components/link-card";
import { LinkForm } from "~/components/link-form";
import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { useSession } from "~/lib/auth";
import { getLinks } from "~/server/functions/links";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: session, isPending: isAuthPending } = useSession();
  const [showCreate, setShowCreate] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [search, setSearch] = useState("");

  const { data: links = [], isLoading: isLinksLoading } = useQuery<LinkItem[]>({
    queryKey: ["links", "list"],
    queryFn: () => getLinks() as Promise<LinkItem[]>,
    enabled: Boolean(session?.user),
  });

  const totalClicks = links.reduce((sum, item) => sum + (item.clickCount || 0), 0);
  const totalAdLinks = links.filter((item) => item.adEnabled).length;

  const filteredLinks = links.filter((link) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      link.slug.toLowerCase().includes(q) ||
      link.originalUrl.toLowerCase().includes(q)
    );
  });

  // Auth Loading Skeleton
  if (isAuthPending) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    );
  }

  // Unauthenticated Gateway Screen
  if (!session?.user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24 text-center animate-in fade-in duration-200">
        <Empty className="py-12 bg-card border-border shadow-xs">
          <EmptyHeader>
            <EmptyMedia className="bg-primary/10 text-primary">
              <ShieldAlert className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Sign In to View Your Dashboard</EmptyTitle>
            <EmptyDescription>
              Your links, QR codes, and click analytics are securely linked to your account. Sign in with Google or GitHub to manage them.
            </EmptyDescription>
          </EmptyHeader>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => setShowAuthModal(true)}
              className="gap-2 bg-primary text-primary-foreground font-semibold cursor-pointer h-10 px-5"
            >
              <LogIn className="size-4" />
              <span>Sign In with Account</span>
            </Button>
          </div>
        </Empty>
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Link Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your short URLs, download QR codes, and monitor click analytics.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          className="gap-2 bg-primary text-primary-foreground font-semibold shadow-xs cursor-pointer"
        >
          {showCreate ? (
            "Close Form"
          ) : (
            <>
              <Plus className="size-4" />
              Create New Link
            </>
          )}
        </Button>
      </div>

      {/* Summary Telemetry Metrics */}
      {links.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Link2 className="size-3.5 text-primary" />
              <span>Total Active Links</span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {links.length}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <BarChart3 className="size-3.5 text-primary" />
              <span>Total Clicks Tracked</span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {totalClicks}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Radio className="size-3.5 text-[var(--brand-amber)]" />
              <span>Monetized Ad Links</span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {totalAdLinks}
            </p>
          </div>
        </div>
      )}

      {/* Expandable Link Creation Form */}
      {showCreate && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <h2 className="text-base font-semibold text-foreground mb-4 text-left">
            Shorten a New URL
          </h2>
          <LinkForm />
        </div>
      )}

      {/* Search & Filter Bar */}
      {links.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search links by slug or destination URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 bg-card"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                title="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          {search && (
            <p className="text-xs text-muted-foreground text-left sm:text-right">
              Showing {filteredLinks.length} of {links.length} links
            </p>
          )}
        </div>
      )}

      {/* Link List Section */}
      {isLinksLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-xs"
            >
              <Skeleton className="size-10 rounded-lg shrink-0" />
              <div className="space-y-2 flex-1 w-full">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      ) : links.length === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia>
              <Link2 className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No shortened links yet</EmptyTitle>
            <EmptyDescription>
              Create your first shortened link and instant QR code to get started.
            </EmptyDescription>
          </EmptyHeader>
          <div className="mt-4">
            <Button
              onClick={() => setShowCreate(true)}
              className="gap-2 font-semibold bg-primary text-primary-foreground cursor-pointer"
            >
              <Plus className="size-4" />
              Shorten Your First Link
            </Button>
          </div>
        </Empty>
      ) : filteredLinks.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border">
          No links match your search "{search}".
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearch("")}
              className="text-xs cursor-pointer"
            >
              Clear filter
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLinks.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      )}
    </div>
  );
}
