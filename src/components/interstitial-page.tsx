/**
 * Interstitial ad page layout shown when adEnabled is true for a link.
 * Surface Mode: Experience
 * Displays destination URL preview, sponsored ad placeholder, and automated countdown CTA.
 * Used by: src/routes/go.$slug.tsx
 */
import { ArrowRight, ExternalLink, Globe, ShieldCheck, Sparkles } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { truncateUrl } from "~/lib/utils";

interface InterstitialPageProps {
  link: {
    id: string;
    slug: string;
    originalUrl: string;
    clickCount?: number;
  };
}

export const InterstitialPage = memo(function InterstitialPage({
  link,
}: InterstitialPageProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [autoRedirecting, setAutoRedirecting] = useState(false);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      setAutoRedirecting(true);
      window.location.href = link.originalUrl;
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsRemaining, link.originalUrl]);

  const handleContinue = () => {
    setAutoRedirecting(true);
    window.location.href = link.originalUrl;
  };

  let hostname = link.originalUrl;
  try {
    hostname = new URL(link.originalUrl).hostname;
  } catch {
    // fallback to original string
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-8 sm:py-12 text-center animate-in fade-in duration-300">
      <div className="w-full max-w-2xl space-y-6">
        {/* Destination Card Preview */}
        <div className="rounded-2xl bg-[var(--surface-dark)] text-[var(--on-dark)] p-6 sm:p-8 shadow-2xl border border-white/10 space-y-6 text-left relative overflow-hidden">
          {/* Subtle ambient gradient highlight */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 size-48 rounded-full bg-[var(--brand-accent)]/15 blur-3xl pointer-events-none" />

          {/* Top Destination Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[var(--brand-amber)] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-amber)]">
                Redirecting via shortU
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--on-dark-muted)]">
              <ShieldCheck className="size-3.5 text-[var(--brand-mint)]" />
              <span>Link Verified</span>
            </div>
          </div>

          {/* Destination URL Display */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-[var(--on-dark-muted)]">
              <Globe className="size-3.5" />
              <span>Destination: <strong className="text-[var(--on-dark)] font-mono">{hostname}</strong></span>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 font-mono text-sm sm:text-base text-[var(--on-dark)] break-all select-all font-semibold">
              {truncateUrl(link.originalUrl, 60)}
            </div>
          </div>

          {/* Sponsored Ad Zone Placement */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[var(--on-dark-muted)]">
              <span className="flex items-center gap-1">
                <Sparkles className="size-3 text-[var(--brand-amber)]" />
                Sponsored Ad Placement
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider">
                Ad Slot
              </span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/5 p-8 sm:p-12 text-center text-white/50 space-y-2 min-h-[160px]">
              <p className="text-xs font-medium text-[var(--on-dark)]">
                Your Sponsor or Ad Banner Here
              </p>
              <p className="text-[11px] text-[var(--on-dark-muted)] max-w-sm">
                Monetize outbound traffic with high-CPM ad placements or promoted product announcements.
              </p>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[var(--on-dark-muted)]">
              {secondsRemaining > 0 ? (
                <span>
                  Continuing automatically in{" "}
                  <strong className="font-mono text-base text-[var(--brand-mint)] font-bold">
                    {secondsRemaining}s
                  </strong>
                </span>
              ) : (
                <span className="text-[var(--brand-mint)] font-semibold">
                  Redirecting now...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                onClick={handleContinue}
                disabled={autoRedirecting}
                className="w-full sm:w-auto bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-white font-semibold gap-2 rounded-lg cursor-pointer h-11 px-6 shadow-md"
              >
                <span>Continue to Site</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Fallback Direct Link */}
        <p className="text-xs text-muted-foreground">
          Not redirected automatically?{" "}
          <a
            href={link.originalUrl}
            className="text-foreground underline underline-offset-4 hover:text-primary inline-flex items-center gap-1 font-medium"
          >
            Click here to open directly
            <ExternalLink className="size-3" />
          </a>
        </p>
      </div>
    </div>
  );
});
