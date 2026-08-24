/**
 * Landing-page hero trigger: destination URL input + "Shorten URL" button.
 * Opens ShortenDialog prefilled with whatever the visitor typed, so the
 * page stays minimal while configuration happens in the overlay.
 * Used by: src/routes/index.tsx (replaces former inline LinkForm usage)
 */
import { Link as LinkIcon } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { ShortenDialog } from "~/components/shorten-dialog";
import { Button } from "~/components/ui/button";
import { InputGroup, InputGroupInput } from "~/components/ui/input-group";

export const ShortenTrigger = memo(function ShortenTrigger() {
  const [draftUrl, setDraftUrl] = useState("");
  const [open, setOpen] = useState(false);

  /** Opens the overlay with the typed URL as the starting point. */
  const handleOpen = useCallback(() => setOpen(true), []);

  return (
    <div className="w-full max-w-xl mx-auto space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <InputGroup className="h-12 flex-1 bg-card shadow-2xs">
          <InputGroupInput
            placeholder="Paste a long URL to shorten..."
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draftUrl.trim()) handleOpen();
            }}
            aria-label="Destination web address"
            autoComplete="off"
          />
        </InputGroup>
        <Button
          onClick={handleOpen}
          disabled={!draftUrl.trim()}
          className="h-12 min-w-[140px] cursor-pointer whitespace-nowrap px-6 font-semibold shadow-xs transition-all active:scale-[0.98]"
        >
          <LinkIcon className="mr-1 size-4" />
          Shorten URL
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        No account needed. Custom slugs available when you sign in.
      </p>
      <ShortenDialog open={open} onOpenChange={setOpen} initialUrl={draftUrl.trim()} />
    </div>
  );
});
