/**
 * Single link card row in the dashboard list.
 * Displays short slug, destination URL, click counter, QR download, and delete mutation.
 * Surface Mode: Operate
 * Used by: src/routes/dashboard.tsx
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Copy,
  ExternalLink,
  MousePointerClick,
  QrCode,
  Trash2,
} from "lucide-react";
import { memo, useCallback, useState } from "react";
import { AdToggle } from "~/components/ad-toggle";
import { QrPreview } from "~/components/qr-preview";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { formatDate } from "~/lib/utils";
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
  const [showQr, setShowQr] = useState(false);

  const shortUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${link.slug}`
      : `/${link.slug}`;

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

  const deleteMutation = useMutation({
    mutationFn: () => deleteLink({ data: { id: link.id } }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["links", "list"] });
      const previousLinks = queryClient.getQueryData<LinkItem[]>([
        "links",
        "list",
      ]);

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
    <Item
      variant="outline"
      className="flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-150"
    >
      <ItemMedia>
        <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-foreground font-mono text-xs font-semibold select-none border border-border">
          /{link.slug.slice(0, 3)}
        </div>
      </ItemMedia>

      <ItemContent className="w-full">
        <div className="flex items-center gap-2 flex-wrap">
          <ItemTitle className="font-mono text-base text-foreground font-semibold">
            /{link.slug}
          </ItemTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Copy short link"
          >
            {copied ? (
              <Check className="size-3.5 text-primary" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
          <a
            href={shortUrl}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            title="Open short link in new tab"
          >
            <ExternalLink className="size-3.5" />
          </a>
          <Badge variant="secondary" className="gap-1 text-xs font-normal">
            <MousePointerClick className="size-3" />
            {link.clickCount} clicks
          </Badge>
          {link.adEnabled && (
            <Badge
              variant="outline"
              className="text-[10px] text-brand-amber border-brand-amber/40 font-medium"
            >
              Ad Page Active
            </Badge>
          )}
        </div>

        <ItemDescription className="text-xs text-muted-foreground font-mono truncate max-w-md">
          {link.originalUrl}
        </ItemDescription>

        <p className="text-[10px] text-muted-foreground">
          Created {formatDate(link.createdAt)}
        </p>

        {showQr && link.qrCode && (
          <div className="mt-3 p-3.5 rounded-lg bg-secondary/30 border border-border w-fit animate-in fade-in slide-in-from-top-1 duration-150">
            <QrPreview
              qrCode={link.qrCode}
              slug={link.slug}
              size="sm"
              showDownload={true}
            />
          </div>
        )}
      </ItemContent>

      <ItemActions className="w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
        {link.qrCode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQr(!showQr)}
            className="text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer h-8"
          >
            <QrCode className="size-3.5" />
            {showQr ? "Hide QR" : "QR Code"}
          </Button>
        )}

        <div className="flex items-center gap-2 px-1">
          <span className="text-xs text-muted-foreground select-none">
            Ad Mode
          </span>
          <AdToggle linkId={link.id} adEnabled={link.adEnabled} />
        </div>

        <Button
          variant="ghost"
          size="icon"
          disabled={deleteMutation.isPending}
          onClick={() => {
            if (confirm(`Delete short link /${link.slug}?`)) {
              deleteMutation.mutate();
            }
          }}
          className="size-8 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          title="Delete link"
        >
          <Trash2 className="size-4" />
        </Button>
      </ItemActions>
    </Item>
  );
});
