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
    <div className="rounded-xl bg-surface-dark text-on-dark p-5 sm:p-6 shadow-xl space-y-4 text-left transition-all animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between border-b border-hairline/40 pb-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-brand-mint animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-mint">
            Link Ready
          </span>
        </div>
        <span className="text-xs font-mono text-on-dark-muted">
          nanoid(7)
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-2 flex-1 min-w-0 w-full">
          {/* Slug output — terminal-prompt readout per DESIGN.md result-band spec */}
          <div className="flex items-center justify-between gap-2 rounded-sm bg-accent px-3 py-2">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="font-mono text-lg text-brand-accent select-none" aria-hidden="true">
                &gt;
              </span>
              <span className="font-mono text-lg text-on-dark font-medium break-all select-all">
                {result.shortUrl}
              </span>
            </div>
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="text-on-dark-muted hover:text-on-dark transition-colors shrink-0 p-1"
              title="Test short URL"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>
          {/* Original destination readout */}
          <p className="text-xs font-mono text-on-dark-muted truncate max-w-sm" title={result.originalUrl}>
            Destination: {result.originalUrl}
          </p>
        </div>

        {includeQr && result.qrCode && (
          <div className="shrink-0">
            <QrPreview
              qrCode={result.qrCode}
              slug={result.slug}
              size="sm"
              showDownload={true}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-hairline/40">
        <Button
          onClick={handleCopy}
          className="flex-1 bg-brand-accent hover:bg-brand-accent-hover text-white font-medium gap-2 rounded-full cursor-pointer h-10 transition-all active:scale-[0.98]"
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
        <Button
          variant="ghost"
          onClick={onReset}
          className="text-on-dark-muted hover:text-on-dark hover:bg-white/10 rounded-full gap-1.5 text-xs h-10 cursor-pointer"
        >
          <RotateCcw className="size-3.5" />
          Shorten Another
        </Button>
      </div>
    </div>
  );
});
