/**
 * Signature terminal-styled result band for a created short link.
 * Shows the accent-prompted slug readout, destination, optional live QR preview,
 * copy-to-clipboard, and a reset action.
 * Used by: src/components/shorten-dialog.tsx (extracted from former link-form.tsx)
 */
import { Check, Copy, ExternalLink, RotateCcw } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { Button } from "~/components/ui/button";
import { QrPreview } from "~/components/qr-preview";
import { Link } from "@tanstack/react-router";

export interface LinkResultData {
  slug: string;
  originalUrl: string;
  shortUrl: string;
  qrCode: string | null;
}

interface LinkResultProps {
  /** Created link payload returned by createLink */
  result: LinkResultData;
  /** Whether to render the live QR preview (defaults to true) */
  includeQr?: boolean;
  /** Resets the flow back to an empty form ("Shorten Another") */
  onReset: () => void;
}

export const LinkResult = memo(function LinkResult({
  result,
  includeQr = true,
  onReset,
}: LinkResultProps) {
  const [copied, setCopied] = useState(false);

  /**
   * Copies the short URL via async clipboard API with a textarea fallback
   * for restricted-permission browsers, then flashes the success state.
   * Used by: Copy Short Link button
   */
  const handleCopy = useCallback(() => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(result.shortUrl);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = result.shortUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result.shortUrl]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-2 flex-1 min-w-0 w-full">
          {/* Slug output — terminal-prompt readout per DESIGN.md result-band spec */}
        {includeQr && result.qrCode && (
          <div className="shrink-0">
            <QrPreview
              qrCode={result.qrCode}
              slug={result.slug}
          
              showDownload={true}
            />
          </div>
        )}
          <div className="flex items-center justify-between gap-2 rounded-sm bg-accent px-3 py-2">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="font-mono text-lg text-brand-accent select-none" aria-hidden="true">
                &gt;
              </span>
              <span className="font-mono font-medium break-all select-all">
                {result.shortUrl}
              </span>
            </div>
            <Link
              to={result.shortUrl as string}
              target="_blank"
              rel="noreferrer"
              title="Test short URL"
            >
              <ExternalLink className="size-4" />
            </Link>
          </div>
          {/* Original destination readout */}
          <p className="text-xs font-mono truncate max-w-sm" title={result.originalUrl}>
            To: {result.originalUrl.substring(0, 30)}...
          </p>
        </div>

      </div>
        <Button
          onClick={handleCopy}
          size="lg"
          className="w-full"
        >
          {copied ? (
            <>
              <Check className="size-4 text-brand-mint" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="size-4" />
              Copy Short Link
            </>
          )}
        </Button>
    </div>
  );
});
