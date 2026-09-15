/**
 * Branded 404 Not Found component.
 * Renders when a short slug or route is missing, deleted, or mistyped.
 * Surface Mode: Persuade / Experience
 * Used by: src/routes/__root.tsx (notFoundComponent), src/routes/$slug.tsx, src/routes/go.$slug.tsx
 */
import { Link } from "@tanstack/react-router";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "~/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mx-auto max-w-md space-y-6">
        {/* Terminal status badge */}
        <div className="inline-flex items-center gap-2 rounded-md bg-accent/80 px-3 py-1.5 font-mono text-xs font-medium text-foreground border border-border">
          <span className="text-brand-accent select-none" aria-hidden="true">
            &gt;
          </span>
          <span>404: SLUG_NOT_FOUND</span>
        </div>

        {/* Heading & description */}
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Link Not Found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The short link you followed does not exist, has expired, or may have been typed
            incorrectly.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button render={<Link to="/" />} size="default" className="w-full sm:w-auto gap-2">
            <PlusCircle className="size-4" />
            Shorten a New URL
          </Button>

          <Button
            render={<Link to="/dashboard" />}
            variant="outline"
            size="default"
            className="w-full sm:w-auto gap-2"
          >
            <ArrowLeft className="size-4" />
            View My Links
          </Button>
        </div>
      </div>
    </div>
  );
}
