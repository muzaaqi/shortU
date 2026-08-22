/**
 * Landing page route.
 * High-conversion hero section with instant URL shortener and editorial feature showcase.
 * Surface Mode: Persuade
 * Used by: TanStack Router for route "/"
 */
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, QrCode, Radio, Zap } from "lucide-react";
import { LinkForm } from "~/components/link-form";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-12 sm:py-20 text-center">
      <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16">
        {/* Hero Section */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-foreground leading-[1.08]">
            Shorten Links with Zero Friction.
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
            Generate compact 7-character short URLs, export scan-ready QR codes, and optionally monetize traffic with creator-controlled interstitial ad pages.
          </p>
        </div>

        {/* Hero Input Shortener */}
        <LinkForm />

        {/* Editorial Value Section */}
        <div className="pt-16 sm:pt-20 border-t border-border text-left space-y-8">
          <div className="max-w-xl">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Built for speed, clarity, and control.
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything you need to share, track, and monetize short links without complexity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Zap className="size-4 text-primary" />
                <span>Instant 301 Redirects</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Clean 7-character nanoid slugs with lean HTTP 301 redirection at the edge. Zero intermediate latency or tracking scripts for standard links.
              </p>
              <div className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-md border border-border">
                <span>shortu.dev/</span>
                <span className="font-semibold text-foreground">xK9pL2q</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <QrCode className="size-4 text-primary" />
                <span>Automated QR Generation</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every shortened link immediately generates a high-contrast PNG QR code ready for instant download and cross-media sharing.
              </p>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground bg-secondary/80 px-2.5 py-1 rounded-md border border-border">
                <span className="size-1.5 rounded-full bg-[var(--brand-mint)]" />
                <span>300×300 High-Res PNG</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Radio className="size-4 text-[var(--brand-amber)]" />
                <span>Creator Interstitial Mode</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Opt-in per link to display a focused intermediate landing page (<code className="font-mono text-foreground">/go/$slug</code>) with destination preview and custom ad placements.
              </p>
              <div className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--brand-amber)] bg-[var(--brand-amber-subtle)] px-2.5 py-1 rounded-md border border-[var(--brand-amber)]/20">
                <span>/go/slug</span>
                <ArrowRight className="size-3" />
                <span>Destination</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
