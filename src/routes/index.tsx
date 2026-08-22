/**
 * Landing page route.
 * High-conversion hero section with instant URL shortener and feature showcase.
 * Surface Mode: Persuade
 * Used by: TanStack Router for route "/"
 */
import { createFileRoute } from "@tanstack/react-router";
import { QrCode, Shield, Zap } from "lucide-react";
import { LinkForm } from "~/components/link-form";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-12 sm:py-16 text-center">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs font-semibold text-muted-foreground border border-border">
            <Zap className="size-3.5 text-primary" />
            <span>Fast, Developer-Grade URL Shortening</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-foreground">
            Shorten Links with <span className="font-semibold text-primary">Zero Friction</span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground">
            Generate compact 7-character short links, download instant high-res QR codes, and monetize traffic with optional creator-controlled interstitial ads.
          </p>
        </div>

        {/* Hero Form */}
        <LinkForm />

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 text-left border-t border-border">
          <div className="rounded-xl bg-card border border-border p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Zap className="size-4" />
              <h3>Instant 301 Redirects</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Lightning-fast edge redirection for clean, high-performance link sharing with zero latency.
            </p>
          </div>

          <div className="rounded-xl bg-card border border-border p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <QrCode className="size-4" />
              <h3>Downloadable QR Codes</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every shortened link automatically produces a scan-ready high-contrast PNG QR code.
            </p>
          </div>

          <div className="rounded-xl bg-card border border-border p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Shield className="size-4" />
              <h3>Creator Monetization</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Opt-in interstitial ad pages (<code className="font-mono text-foreground">/go/$slug</code>) give you full control over when to monetize clicks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
