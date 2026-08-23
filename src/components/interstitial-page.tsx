/**
 * Interstitial ad page layout shown when adEnabled is true for a link.
 * Surface Mode: Experience
 * Displays destination URL preview, sponsored ad placeholder, and automated countdown CTA.
 * Used by: src/routes/go.$slug.tsx
 */
import { ArrowRight, ExternalLink, Globe, Pause, Play, ShieldCheck, Sparkles } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { cn, truncateUrl } from "~/lib/utils";

interface InterstitialPageProps {
  link: {
    id: string;
    slug: string;
    originalUrl: string;
    clickCount?: number;
  };
}

/** Total seconds before automatic redirect */
const COUNTDOWN_SECONDS = 5;

export const InterstitialPage = memo(function InterstitialPage({
  link,
}: InterstitialPageProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_SECONDS);
  const [isPaused, setIsPaused] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isPaused || isRedirecting) {
      return;
    }

    if (secondsRemaining <= 0) {
      setIsRedirecting(true);
      window.location.href = link.originalUrl;
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsRemaining, isPaused, isRedirecting, link.originalUrl]);

  const handleContinue = useCallback(() => {
    setIsRedirecting(true);
    window.location.href = link.originalUrl;
  }, [link.originalUrl]);

  const handleTogglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  let hostname = link.originalUrl;
  try {
    hostname = new URL(link.originalUrl).hostname;
  } catch {
    // fallback to original string
  }

  // Transform-based fill (no layout animation): scales the track from the left edge
  const progressRatio =
    Math.max(0, Math.min(1, (COUNTDOWN_SECONDS - secondsRemaining) / COUNTDOWN_SECONDS));

  return (
    <div className="flex min-h-[calc(100vh-7.25rem)] flex-col items-center justify-center px-4 py-8 sm:py-12 text-center animate-in fade-in duration-300">
      <div className="w-full max-w-2xl space-y-6">
        {/* Destination Card Preview */}
        <div className="rounded-2xl bg-surface-dark text-on-dark p-6 sm:p-8 shadow-2xl space-y-6 text-left relative overflow-hidden">
          {/* Subtle ambient accent highlight */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 size-48 rounded-full bg-brand-accent/15 blur-3xl pointer-events-none" />

          {/* Top Destination Header */}
          <div className="flex items-center justify-between border-b border-hairline/40 pb-4">
            <div className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full bg-brand-amber", !isPaused && !isRedirecting && "animate-pulse")} />
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-amber">
                Redirecting via shortU
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-on-dark-muted">
              <ShieldCheck className="size-3.5 text-brand-mint" />
              <span>Link Verified</span>
            </div>
          </div>

          {/* Destination URL Display */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-on-dark-muted">
              <Globe className="size-3.5" />
              <span>Destination: <strong className="text-on-dark font-mono">{hostname}</strong></span>
            </div>
            <div className="rounded-xl bg-surface-dark-elevated p-3.5 font-mono text-sm sm:text-base text-on-dark break-all select-all font-medium" title={link.originalUrl}>
              {truncateUrl(link.originalUrl, 60)}
            </div>
          </div>

          {/* Sponsored Ad Zone Placement */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-on-dark-muted">
              <span className="flex items-center gap-1">
                <Sparkles className="size-3 text-brand-amber" />
                Sponsored Ad Placement
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider">
                Ad Slot
              </span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-surface-dark-elevated p-8 sm:p-12 text-center space-y-2 min-h-[160px]">
              <p className="text-xs font-medium text-on-dark">
                Your Sponsor or Ad Banner Here
              </p>
              <p className="text-[11px] text-on-dark-muted max-w-sm">
                Monetize outbound traffic with high-CPM ad placements or promoted product announcements.
              </p>
            </div>
          </div>

          {/* Countdown Progress Track */}
          <div className="space-y-2 pt-1">
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full w-full origin-left bg-brand-mint rounded-full",
                  !isPaused && !isRedirecting && "transition-transform duration-1000 ease-linear"
                )}
                style={{ transform: `scaleX(${progressRatio})` }}
              />
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="pt-2 border-t border-hairline/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-on-dark-muted">
              {isRedirecting ? (
                <span className="text-brand-mint font-semibold">
                  Redirecting now...
                </span>
              ) : isPaused ? (
                <span>
                  Countdown paused at{" "}
                  <strong className="font-mono text-base text-on-dark font-bold">
                    {secondsRemaining}s
                  </strong>{" "}
                  — take your time.
                </span>
              ) : (
                <span>
                  Continuing automatically in{" "}
                  <strong className="font-mono text-base text-brand-mint font-bold">
                    {secondsRemaining}s
                  </strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isRedirecting && (
                <Button
                  variant="ghost"
                  onClick={handleTogglePause}
                  aria-label={isPaused ? "Resume countdown" : "Pause countdown"}
                  title={isPaused ? "Resume countdown" : "Pause countdown"}
                  className="text-on-dark-muted hover:text-on-dark hover:bg-white/10 rounded-full size-11 shrink-0 cursor-pointer transition-all active:scale-[0.98]"
                >
                  {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
                </Button>
              )}
              <Button
                onClick={handleContinue}
                disabled={isRedirecting}
                className="w-full sm:w-auto bg-brand-accent hover:bg-brand-accent-hover active:scale-[0.98] text-white font-semibold gap-2 rounded-lg cursor-pointer h-11 px-6 shadow-md transition-all"
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
