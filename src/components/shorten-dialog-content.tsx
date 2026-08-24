/**
 * Shell-agnostic content for the unified shorten flow.
 * Owns all form state (TanStack Form), slug mode, QR opt-in, result state,
 * and its own action row — rendered identically inside whichever native
 * shell ResponsiveOverlay picks (Drawer mobile / Dialog desktop).
 * Flow: enter URL -> pick Random (read-only, regenerable) or Custom slug ->
 * optionally opt into QR generation -> Confirm submits via createLink and
 * swaps to the LinkResult band inside the same surface.
 * Form pattern per docs/ui/shadcn/tanstack-form.md.
 * Used by: src/components/shorten-dialog.tsx
 */
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Clipboard, Lock, QrCode, RefreshCw } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { AuthModal } from "~/components/auth-modal";
import { LinkResult, type LinkResultData } from "~/components/link-result";
import { Button } from "~/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { Spinner } from "~/components/ui/spinner";
import { useSession } from "~/lib/auth";
import { generateSlug } from "~/lib/slugify";
import { shortenFormSchema, type ShortenFormValues } from "~/lib/schema";
import { cn, normalizeInputUrl, slugPrefixFromOrigin } from "~/lib/utils";
import { createLink, getAppOrigin } from "~/server/functions/links";

type SlugMode = "random" | "custom";

/** Query key for the app origin (moved here from the retired link-form.tsx) */
const APP_ORIGIN_KEY = ["app", "origin"] as const;

export interface ShortenDialogContentProps {
  /** Closes the surrounding overlay (wired to Cancel/Close actions). */
  onClose: () => void;
  /** Prefills the destination URL field on mount (parent remounts per open). */
  initialUrl?: string;
}

export const ShortenDialogContent = memo(function ShortenDialogContent({
  onClose,
  initialUrl = "",
}: ShortenDialogContentProps) {
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);

  // UI-only state (not form input): options and post-submit result
  const [slugMode, setSlugMode] = useState<SlugMode>("random");
  const [randomSlug, setRandomSlug] = useState(() => generateSlug());
  const [includeQr, setIncludeQr] = useState(true);
  const [result, setResult] = useState<LinkResultData | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { data: appOrigin } = useQuery({
    queryKey: APP_ORIGIN_KEY,
    queryFn: getAppOrigin,
    staleTime: Infinity,
  });
  const slugPrefix = slugPrefixFromOrigin(
    appOrigin ?? (typeof window !== "undefined" ? window.location.origin : null),
  );

  const customRequiresAuth = slugMode === "custom" && !isAuthenticated;

  const mutation = useMutation({
    mutationFn: async (values: ShortenFormValues) => {
      const normalized = normalizeInputUrl(values.url);
      if (!normalized) throw new Error("Please enter a valid destination URL.");
      return createLink({
        data: {
          originalUrl: normalized,
          ...(slugMode === "custom" && values.customSlug.trim()
            ? { customSlug: values.customSlug.trim() }
            : {}),
        },
      });
    },
    onSuccess: (data) => {
      setResult({
        slug: data.slug ?? "",
        originalUrl: data.originalUrl ?? "",
        shortUrl: data.shortUrl ?? "",
        qrCode: data.qrCode ?? null,
      });
    },
  });

  const form = useForm({
    // initialUrl arrives via mount defaults — the parent remounts this
    // component (keyed) on every overlay open, so drafts never leak between opens
    defaultValues: {
      url: initialUrl,
      customSlug: "",
    },
    validators: {
      onSubmit: shortenFormSchema,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  /** Reseeds a fresh random slug. Used by: regenerate icon button */
  const handleRegenerate = useCallback(() => setRandomSlug(generateSlug()), []);

  /** Pastes clipboard text into the URL field when permission allows. */
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard?.readText?.();
      if (text) form.setFieldValue("url", text.trim());
    } catch {
      // Clipboard permission denied — silently ignore
    }
  }, [form]);

  /** Clears the result back to an empty form for another round. */
  const handleReset = useCallback(() => {
    setResult(null);
    form.reset();
    setRandomSlug(generateSlug());
    setSlugMode("random");
    setIncludeQr(true);
  }, [form]);

  /* ---------- body: TanStack Form field set ---------- */
  const body = (
    <form
      id="shorten-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        {/* Destination URL */}
        <form.Field name="url">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name} className="text-sm font-semibold text-foreground">
                  Destination Web Address
                </FieldLabel>
                <InputGroup className="h-12 bg-card shadow-2xs">
                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    placeholder="https://example.com/long-page-url..."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid || undefined}
                    autoComplete="off"
                  />
                  {/* Always-available paste affordance, inner-right */}
                  <InputGroupAddon align="inline-end">
                    <button
                      type="button"
                      onClick={handlePaste}
                      title="Paste from clipboard"
                      aria-label="Paste from clipboard"
                      className="cursor-pointer pr-3 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Clipboard className="size-4" />
                    </button>
                  </InputGroupAddon>
                </InputGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        {/* Segmented Random | Custom toggle (UI-only state, outside the form) */}
        <div className="space-y-2 text-left">
          <div className="inline-flex rounded-full border border-border bg-secondary p-1">
            {(["random", "custom"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSlugMode(mode)}
                aria-pressed={slugMode === mode}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors",
                  slugMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {mode} slug
              </button>
            ))}
          </div>

          {slugMode === "random" ? (
            /* Read-only generated slug — deliberately NOT a form field */
            <div className="space-y-1">
              <InputGroup className="h-11 bg-card">
                <InputGroupInput
                  value={randomSlug}
                  readOnly
                  aria-label="Generated slug"
                  aria-readonly="true"
                  tabIndex={-1}
                  className="select-all font-mono"
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleRegenerate}
                    title="Generate a new random slug"
                    aria-label="Generate a new random slug"
                    className="mr-1 cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="size-3.5" />
                  </Button>
                </InputGroupAddon>
              </InputGroup>
              <p className="text-xs text-muted-foreground">
                Generated for you — click refresh for a different one.
              </p>
            </div>
          ) : (
            /* Editable custom slug with live domain prefix (inner-left) */
            <form.Field name="customSlug">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name} className="text-xs font-medium text-foreground">
                      Custom Slug
                    </FieldLabel>
                    <InputGroup className="h-11 bg-card">
                      <InputGroupAddon
                        align="inline-start"
                        className="pl-3 font-mono text-xs text-muted-foreground"
                      >
                        {slugPrefix}
                      </InputGroupAddon>
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        placeholder="my-custom-link"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value.toLowerCase())}
                        aria-invalid={isInvalid || undefined}
                        className="font-mono"
                      />
                    </InputGroup>
                    {customRequiresAuth && (
                      <p className="inline-flex items-center gap-1 text-xs text-warning">
                        <Lock className="size-3" />
                        Custom slugs need an account.{" "}
                        <button
                          type="button"
                          onClick={() => setShowAuthModal(true)}
                          className="cursor-pointer font-medium underline underline-offset-2"
                        >
                          Sign in
                        </button>
                      </p>
                    )}
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
          )}
        </div>

        {/* Decorative QR placeholder — design only; opted-in real QR shows in the result view */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <div
            aria-hidden="true"
            className="flex size-28 items-center justify-center rounded-xl border border-dashed border-border bg-card text-muted-foreground/40"
          >
            <QrCode className="size-14" />
          </div>
          <button
            type="button"
            onClick={() => setIncludeQr((v) => !v)}
            aria-pressed={includeQr}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              includeQr
                ? "bg-success-subtle text-brand-mint"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <QrCode className="size-3.5" />
            {includeQr ? "QR code will be generated" : "Generate QR code"}
          </button>
        </div>

        {/* Server errors surface under the form, above the action row */}
        {mutation.isError && (
          <p className="rounded-lg bg-error-subtle p-3 text-left text-xs font-medium text-destructive">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "An unexpected error occurred."}
          </p>
        )}
      </FieldGroup>
    </form>
  );

  return (
    <>
      {result ? (
        <LinkResult result={result} includeQr={includeQr} onReset={handleReset} />
      ) : (
        body
      )}

      {/* Action row — identical in both shells */}
      <div className="mt-4 flex justify-end gap-2 border-t border-border pt-3">
        {result ? (
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Close
          </Button>
        ) : (
          <>
            <Button variant="outline" type="button" onClick={onClose} className="cursor-pointer">
              Cancel
            </Button>
            {/* Submits the form by id — lives outside <form> */}
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  form="shorten-form"
                  disabled={!canSubmit || isSubmitting || customRequiresAuth}
                  className="min-w-[120px] cursor-pointer gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="size-4" />
                      Creating…
                    </>
                  ) : (
                    "Confirm"
                  )}
                </Button>
              )}
            </form.Subscribe>
          </>
        )}
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
});
