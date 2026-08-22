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
  Plus,
  Radio,
  Search,
} from "lucide-react";
import { useState } from "react";
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
import { Spinner } from "~/components/ui/spinner";
import { getLinks } from "~/server/functions/links";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");

  const { data: links = [], isLoading } = useQuery<LinkItem[]>({
    queryKey: ["links", "list"],
    queryFn: () => getLinks() as Promise<LinkItem[]>,
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
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {links.length}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <BarChart3 className="size-3.5 text-primary" />
              <span>Total Clicks Tracked</span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {totalClicks}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Radio className="size-3.5 text-[var(--brand-amber)]" />
              <span>Monetized Ad Links</span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">
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
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search links by slug or destination URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
      )}

      {/* Link List Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner className="size-6 text-primary" />
          <p className="text-sm text-muted-foreground">Loading your links...</p>
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
