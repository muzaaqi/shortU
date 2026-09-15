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
import { Clipboard, Lock, RefreshCw } from "lucide-react";
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
import {
  Label
} from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import { Switch } from "~/components/ui/switch";
import { useClipboardPaste } from "~/hooks/use-clipboard-paste";
import { useSession } from "~/lib/auth";
import { generateSlug } from "~/lib/slugify";
import { shortenFormSchema, type ShortenFormValues } from "~/lib/schema";
import { normalizeInputUrl, slugPrefixFromOrigin } from "~/lib/utils";
import { createLink, getAppOrigin } from "~/server/functions/links";

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
  /** Off (default) = server-generated random slug; on = user-chosen custom alias */
  const [isCustomSlug, setIsCustomSlug] = useState(false);
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

  const customRequiresAuth = isCustomSlug && !isAuthenticated;

  const mutation = useMutation({
    mutationFn: async (values: ShortenFormValues) => {
      const normalized = normalizeInputUrl(values.url);
      if (!normalized) throw new Error("Please enter a valid destination URL.");
      return createLink({
        data: {
          originalUrl: normalized,
          ...(isCustomSlug && values.customSlug.trim()
            ? { customSlug: values.customSlug.trim() }
            : { randomSlug }),
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
  const { paste: handlePaste } = useClipboardPaste((text) => {
    form.setFieldValue("url", text);
  });

  /** Clears the result back to an empty form for another round. */
  const handleReset = useCallback(() => {
    setResult(null);
    form.reset();
    setRandomSlug(generateSlug());
    setIsCustomSlug(false);
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
                <InputGroup className="h-11 bg-card">
                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    placeholder="https://example.com/long-page-url..."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid || undefined}
                    autoComplete="off"
                    className="w-1"
                  />
                  {/* Always-available paste affordance, inner-right */}
                  <InputGroupAddon align="inline-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={handlePaste}
                      title="Paste from clipboard"
                      aria-label="Paste from clipboard"
                      className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Clipboard className="size-4" />
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        {/* Slug fields — the Custom slug switch sits left of each input label */}
        <div className="text-left">
          {!isCustomSlug ? (
            /* Read-only generated slug — deliberately NOT a form field */
            <Field>
              <div className="mb-1 flex items-center justify-between">
                <FieldLabel
                  htmlFor="random-slug-input"
                >
                  Random Slug
                </FieldLabel>
                <div className="flex gap-2 items-center">
                <Label
                  htmlFor="custom-slug-switch"
                  className="cursor-pointer select-none text-xs font-medium text-muted-foreground"
                >
                  Custom slug
                </Label>
                <Switch
                  id="custom-slug-switch"
                  checked={isCustomSlug}
                  onCheckedChange={(checked) => setIsCustomSlug(Boolean(checked))}
                />
                </div>
              </div>
              <InputGroup className="h-11 bg-card">
                {/* Domain display + regenerate action, inner-right */}
                <InputGroupAddon
                  align="inline-start"
                >
                  {slugPrefix}
                </InputGroupAddon>
                <InputGroupInput
                  id="random-slug-input"
                  value={randomSlug}
                  readOnly
                  aria-label="Generated slug"
                  aria-readonly="true"
                  tabIndex={-1}
                  className="select-all pl-0 w-1 flex-1"
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleRegenerate}
                    title="Generate a new random slug"
                    aria-label="Generate a new random slug"
                    className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RefreshCw className="size-4" />
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          ) : (
            /* Editable custom slug with live domain prefix (inner-left) */
            <form.Field name="customSlug">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
              <div className="mb-1 flex items-center justify-between">
                <FieldLabel
                  htmlFor="random-slug-input"
                >
                  Custom Slug
                </FieldLabel>
                <div className="flex gap-2 items-center">
                <Label
                  htmlFor="custom-slug-switch"
                  className="cursor-pointer select-none text-xs font-medium text-muted-foreground"
                >
                  Random slug
                </Label>
                <Switch
                  id="custom-slug-switch"
                  checked={isCustomSlug}
                  onCheckedChange={(checked) => setIsCustomSlug(Boolean(checked))}
                />
                </div>
              </div>
                    <InputGroup className="h-11 bg-card">
                      <InputGroupAddon
                        align="inline-start"
                      >
                        {slugPrefix}
                      </InputGroupAddon>
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        placeholder="custom-link"
                        className="pl-0"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value.toLowerCase())}
                        aria-invalid={isInvalid || undefined}
                        disabled={customRequiresAuth}
                      />
                    </InputGroup>
                    {customRequiresAuth && (
                      <p className="inline-flex items-center gap-1 text-xs text-warning">
                        <Lock className="size-3" />
                        Custom slugs need an account.{" "}
                        <Button
                          variant="link"
                          type="button"
                          onClick={() => setShowAuthModal(true)}
                          className="cursor-pointer px-0 py-0 font-medium text-xs underline underline-offset-2 text-warning"
                        >
                          Sign in
                        </Button>
                      </p>
                    )}
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
          )}
        </div>

        {/* QR opt-in — label left, switch right */}
        <div className="flex items-center justify-between pt-1">
          <Label
            htmlFor="include-qr-switch"
          >
            Generate QR
          </Label>
          <Switch
            id="include-qr-switch"
            checked={includeQr}
            onCheckedChange={(checked) => setIncludeQr(Boolean(checked))}
          />
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
      <div className="mt-5 grid grid-cols-2 gap-2">
        {result ? (
      <>
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Close
          </Button>
          <Button onClick={handleReset} className="cursor-pointer">
            Shorten Another
          </Button>
      </>
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
