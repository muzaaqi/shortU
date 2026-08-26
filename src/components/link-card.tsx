/**
 * Single link card row in the dashboard list.
 * Left segment: destination favicon, short URL + copy + click count,
 * destination URL beneath. Right segment: QR / ad toggle / delete inline on
 * desktop, collapsed into a 3-dot popover menu below desktop width.
 * QR preview opens in a ResponsiveOverlay (Drawer <768px, Dialog ≥768px).
 * Delete asks confirmation via AlertDialog with a destructive action.
 * Surface Mode: Operate
 * Used by: src/routes/dashboard.tsx
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import {
  Ad,
  Check,
  Copy,
  Globe,
  MoreVertical,
  MousePointerClick,
  QrCode,
  Trash2,
} from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { AdToggle } from "~/components/ad-toggle";
import { QrPreview } from "~/components/qr-preview";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { ResponsiveOverlay } from "~/components/ui/responsive-overlay";
import { cn } from "~/lib/utils";
import { deleteLink } from "~/server/functions/links";

export interface LinkItem {
  id: string;
  slug: string;
  originalUrl: string;
  qrCode: string | null;
  adEnabled: boolean;
  clickCount: number;
  createdAt: Date | string;
}

interface LinkCardProps {
  link: LinkItem;
}

export const LinkCard = memo(function LinkCard({ link }: LinkCardProps) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [faviconFailed, setFaviconFailed] = useState(false);

  const shortUrl =
    typeof window !== "undefined" ? `${window.location.origin}/${link.slug}` : `/${link.slug}`;

  // Destination hostname drives the favicon source and letter fallback.
  const domain = useMemo(() => {
    try {
      return new URL(link.originalUrl).hostname;
    } catch {
      return "";
    }
  }, [link.originalUrl]);

  const handleCopy = useCallback(() => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shortUrl);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = shortUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shortUrl]);

  const openQr = useCallback(() => {
    setMenuOpen(false);
    setQrOpen(true);
  }, []);

  const askDelete = useCallback(() => {
    setMenuOpen(false);
    setConfirmOpen(true);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: () => deleteLink({ data: { id: link.id } }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["links", "list"] });
      const previousLinks = queryClient.getQueryData<LinkItem[]>(["links", "list"]);

      queryClient.setQueryData<LinkItem[]>(["links", "list"], (old) =>
        old?.filter((item) => item.id !== link.id)
      );

      return { previousLinks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLinks) {
        queryClient.setQueryData(["links", "list"], context.previousLinks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["links", "list"] });
    },
  });

  return (
    <>
      <Card className="flex-row items-center gap-3 px-3 py-3 transition-colors duration-150 hover:bg-surface-strong sm:px-4">
        {/* Left segment */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {faviconFailed || !domain ? (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary border border-border select-none">
              <Globe className="size-4 text-muted-foreground" />
            </div>
          ) : (
            <Image
              src={`https://icons.favicone.com/i/${domain}/favicon.ico`}
              alt=""
              aria-hidden="true"
              loading="lazy"
              width={40}
              height={40}
              onError={() => setFaviconFailed(true)}
              className="size-10 shrink-0 object-contain select-none"
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <Link
                to="/$slug"
                params={{ slug: link.slug }}
                target="_blank"
                rel="noreferrer"
                className="truncate font-mono text-sm font-semibold text-foreground hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                title={`Open ${shortUrl} in new tab`}
              >
                /{link.slug}
              </Link>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                title="Copy short link"
                aria-label={copied ? "Copied" : "Copy short link"}
              >
                {copied ? (
                  <Check className="size-3.5 text-brand-mint" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
              <Badge
                variant="secondary"
                className="shrink-0 tabular-nums"
                title={`${link.clickCount} clicks`}
              >
                <MousePointerClick />
                <span aria-hidden="true">{link.clickCount}</span>
                <span className="sr-only">{link.clickCount} clicks</span>
              </Badge>
            </div>

            <Link
              to={link.originalUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 block truncate font-mono text-xs text-muted-foreground hover:text-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              title={link.originalUrl}
            >
              {link.originalUrl}
            </Link>
          </div>
        </div>

        {/* Right segment — inline actions on desktop */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          <div className="flex items-center gap-2">
            <span>Ads</span>
          <AdToggle
            linkId={link.id}
            adEnabled={link.adEnabled}
            className="flex items-center px-1"
          />
          </div>
          {link.qrCode && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={openQr}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              title="Show QR code"
              aria-label="Show QR code"
            >
              <QrCode className="size-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setConfirmOpen(true)}
            disabled={deleteMutation.isPending}
            className="text-muted-foreground hover:text-destructive cursor-pointer"
            title="Delete link"
            aria-label={`Delete link /${link.slug}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        {/* Right segment — 3-dot overflow menu on mobile/tablet */}
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
                title="More actions"
                aria-label="More actions"
              />
            }
          >
            <MoreVertical className="size-4" />
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8} className="w-48 gap-0 p-1.5">
            <div className="flex w-full items-center justify-between rounded-md px-2 py-1.5">
              <div className="flex items-center gap-2.5">
                <Ad className="size-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Ads</span>
              </div>
              <AdToggle linkId={link.id} adEnabled={link.adEnabled} />
            </div>
            {link.qrCode && (
              <button
                type="button"
                onClick={openQr}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <QrCode className="size-4 text-muted-foreground" />
                QR code
              </button>
            )}

            <div className="mx-1 my-1 h-px bg-border" aria-hidden="true" />

            <button
              type="button"
              onClick={askDelete}
              disabled={deleteMutation.isPending}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          </PopoverContent>
        </Popover>
      </Card>

      {/* QR code overlay — Drawer on mobile, Dialog on tablet/desktop */}
      {link.qrCode && (
        <ResponsiveOverlay
          open={qrOpen}
          onOpenChange={setQrOpen}
          title={`QR code · /${link.slug}`}
          description={domain}
        >
          <div className="flex flex-col items-center gap-3 pb-2">
            <QrPreview qrCode={link.qrCode} slug={link.slug} size="lg" showDownload={true} />
          </div>
        </ResponsiveOverlay>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete /{link.slug}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the short link. Anyone opening{" "}
              <span className="font-mono">/{link.slug}</span> will no longer reach{" "}
              <span className="font-mono break-all">{domain}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                setConfirmOpen(false);
                deleteMutation.mutate();
              }}
              className={cn("cursor-pointer")}
            >
              Delete link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
