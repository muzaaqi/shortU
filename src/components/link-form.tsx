/**
 * URL Shortening input form powered by TanStack Form and Zod.
 * Supports instant shortening, custom slug aliases (authenticated only), clipboard paste,
 * and displays the signature terminal result readout with QR code preview and copy action.
 * Used by: src/routes/index.tsx, src/routes/dashboard.tsx
 */
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Check,
  Clipboard,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  Lock,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { memo, useCallback, useState } from "react";
import { z } from "zod";
import { AuthModal } from "~/components/auth-modal";
import { QrPreview } from "~/components/qr-preview";
import { Button } from "~/components/ui/button";
import {
  Field,
  FieldDescription,
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
import { RESERVED_SLUGS, SLUG_REGEX } from "~/lib/slugify";
import { createLink, getAppOrigin } from "~/server/functions/links";

/** Query key for the app's public origin (rarely changes — cached indefinitely) */
const APP_ORIGIN_KEY = ["app", "origin"] as const;

const urlSchema = z
  .string()
  .min(1, "Please enter a destination URL")
  .refine((val) => {
    let u = val.trim();
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    try {
      new URL(u);
      return true;
    } catch {
      return false;
    }
  }, "Please enter a valid URL address");

const slugSchema = z
  .string()
  .refine(
    (val) => !val || SLUG_REGEX.test(val),
    "Slug must be 3–50 lowercase alphanumeric characters or hyphens"
  )
  .refine(
    (val) => !val || !RESERVED_SLUGS.includes(val.toLowerCase()),
    "This custom slug is reserved"
  );

export const LinkForm = memo(function LinkForm() {
  const { data: session } = useSession();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // App origin from the server (env/request-derived) — powers the slug prefix display
  const { data: appOrigin } = useQuery({
    queryKey: APP_ORIGIN_KEY,
    queryFn: getAppOrigin,
    staleTime: Infinity,
  });

  const slugPrefix = (() => {
    const source = appOrigin || (typeof window !== "undefined" ? window.location.origin : null);
    if (!source) return "";
    try {
      return `${new URL(source).host}/`;
    } catch {
      return "";
    }
  })();
  const [createdLink, setCreatedLink] = useState<{
    slug: string;
    originalUrl: string;
    shortUrl: string;
    qrCode: string | null;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: { originalUrl: string; customSlug?: string }) => {
      return createLink({ data });
    },
    onSuccess: (data) => {
      if (data) {
        setCreatedLink({
          slug: data.slug ?? "",
          originalUrl: data.originalUrl ?? "",
          shortUrl: data.shortUrl ?? `${window.location.origin}/${data.slug}`,
          qrCode: data.qrCode ?? null,
        });
      }
      form.reset();
    },
  });

  const form = useForm({
    defaultValues: {
      url: "",
      customSlug: "",
    },
    validators: {
      onSubmit: z.object({
        url: urlSchema,
        customSlug: slugSchema,
      }),
    },
    onSubmit: async ({ value }) => {
      const payload: { originalUrl: string; customSlug?: string } = {
        originalUrl: value.url.trim(),
      };
      if (value.customSlug.trim()) {
        payload.customSlug = value.customSlug.trim();
      }
      await mutation.mutateAsync(payload);
    },
  });

  const handlePaste = async () => {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          form.setFieldValue("url", text.trim());
        }
      }
    } catch {
      // Clipboard read permission might be restricted
    }
  };

  const handleCopy = useCallback(() => {
    if (!createdLink) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(createdLink.shortUrl);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = createdLink.shortUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [createdLink]);

  const handleReset = () => {
    setCreatedLink(null);
    form.reset();
  };

  const isAuthenticated = Boolean(session?.user);

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <FieldGroup>
          <form.Field name="url">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid} className="text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <FieldLabel htmlFor="url-input" className="text-sm font-semibold text-foreground">
                      Destination Web Address
                    </FieldLabel>
                    {!field.state.value && (
                      <button
                        type="button"
                        onClick={handlePaste}
                        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Clipboard className="size-3" />
                        <span>Paste</span>
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <InputGroup className="h-12 flex-1 bg-card border-border shadow-2xs">
                      <InputGroupAddon align="inline-start">
                        <LinkIcon className="size-4 text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="url-input"
                        placeholder="https://example.com/long-page-url..."
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className="text-base font-sans"
                      />
                    </InputGroup>
                    <form.Subscribe
                      selector={(state) => [state.canSubmit, state.isSubmitting]}
                    >
                      {([canSubmit, isSubmitting]) => (
                        <Button
                          type="submit"
                          disabled={
                            !canSubmit || isSubmitting || mutation.isPending
                          }
                          className="h-12 px-6 bg-primary text-primary-foreground font-semibold shadow-xs hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap min-w-[140px]"
                        >
                          {isSubmitting || mutation.isPending ? (
                            <>
                              <Spinner className="mr-2 size-4" />
                              Shortening...
                            </>
                          ) : (
                            "Shorten URL"
                          )}
                        </Button>
                      )}
                    </form.Subscribe>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <div className="text-left">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors cursor-pointer py-1"
              >
                <Sparkles className="size-3 text-primary" />
                {showAdvanced
                  ? "Hide custom alias options"
                  : "Customize link slug (optional)"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors cursor-pointer py-1"
                title="Sign in to create custom slug aliases"
              >
                <Lock className="size-3 text-muted-foreground" />
                <span>Custom slug alias (Sign in to unlock)</span>
              </button>
            )}

            {isAuthenticated && showAdvanced && (
              <div className="mt-2 p-3.5 rounded-lg bg-secondary/50 border border-border space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                <form.Field name="customSlug">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="custom-slug" className="text-xs font-medium text-foreground">
                          Custom Slug
                        </FieldLabel>
                        <InputGroup className="h-9 text-xs font-mono bg-card">
                        <InputGroupAddon
                          align="inline-start"
                          className="text-xs text-muted-foreground font-mono"
                        >
                          {slugPrefix}
                        </InputGroupAddon>
                          <InputGroupInput
                            id="custom-slug"
                            placeholder="my-cool-link"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              field.handleChange(e.target.value.toLowerCase())
                            }
                            aria-invalid={isInvalid}
                            className="font-mono text-xs"
                          />
                        </InputGroup>
                        <FieldDescription className="text-[11px] text-muted-foreground">
                          3–50 lowercase characters or hyphens.
                        </FieldDescription>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
              </div>
            )}
          </div>
        </FieldGroup>

        {mutation.isError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive text-left font-medium">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "An unexpected error occurred while shortening the URL."}
          </div>
        )}
      </form>

      {/* Signature Terminal Result Moment */}
      {createdLink && (
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
                    {createdLink.shortUrl}
                  </span>
                </div>
                <a
                  href={createdLink.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-on-dark-muted hover:text-on-dark transition-colors shrink-0 p-1"
                  title="Test short URL"
                >
                  <ExternalLink className="size-4" />
                </a>
              </div>
              {/* Original destination readout */}
              <p className="text-xs font-mono text-on-dark-muted truncate max-w-sm" title={createdLink.originalUrl}>
                Destination: {createdLink.originalUrl}
              </p>
            </div>

            {createdLink.qrCode && (
              <div className="shrink-0">
                <QrPreview
                  qrCode={createdLink.qrCode}
                  slug={createdLink.slug}
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
              onClick={handleReset}
              className="text-on-dark-muted hover:text-on-dark hover:bg-white/10 rounded-full gap-1.5 text-xs h-10 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              Shorten Another
            </Button>
          </div>
        </div>
      )}

      {/* Auth Modal Trigger for Locked Features */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
});
