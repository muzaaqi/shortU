/**
 * URL Shortening input form powered by TanStack Form and Zod.
 * Supports instant shortening, custom slug aliases, and displays
 * the signature terminal result readout with QR code preview and copy action.
 * Used by: src/routes/index.tsx, src/routes/dashboard.tsx
 */
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Check, Copy, Link as LinkIcon, Sparkles } from "lucide-react";
import { memo, useState } from "react";
import { z } from "zod";
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
import { RESERVED_SLUGS, SLUG_REGEX } from "~/lib/slugify";
import { createLink } from "~/server/functions/links";

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const handleCopy = () => {
    if (!createdLink) return;
    navigator.clipboard.writeText(createdLink.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                  <FieldLabel htmlFor="url-input">
                    Enter your destination URL
                  </FieldLabel>
                  <div className="flex gap-2">
                    <InputGroup className="h-12 flex-1">
                      <InputGroupAddon align="inline-start">
                        <LinkIcon className="size-4" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="url-input"
                        placeholder="https://example.com/very-long-url..."
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className="text-base"
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
                          className="h-12 px-6 bg-primary text-primary-foreground font-semibold shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
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
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Sparkles className="size-3 text-primary" />
              {showAdvanced
                ? "Hide custom alias options"
                : "Customize link slug (optional)"}
            </button>

            {showAdvanced && (
              <div className="mt-2 p-3 rounded-lg bg-secondary/50 border border-border space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                <form.Field name="customSlug">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="custom-slug" className="text-xs">
                          Custom Slug
                        </FieldLabel>
                        <InputGroup className="h-9 text-xs font-mono">
                          <InputGroupAddon
                            align="inline-start"
                            className="text-xs text-muted-foreground font-mono"
                          >
                            shortu.dev/
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
                        <FieldDescription>
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
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive text-left font-medium">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "An unexpected error occurred while shortening the URL."}
          </div>
        )}
      </form>

      {/* Signature Terminal Result Moment */}
      {createdLink && (
        <div className="rounded-xl bg-[var(--surface-dark)] text-[var(--on-dark)] p-5 sm:p-6 shadow-xl border border-white/10 space-y-4 text-left transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[var(--brand-mint)] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-mint)]">
                Link Ready
              </span>
            </div>
            <span className="text-xs font-mono text-[var(--on-dark-muted)]">
              nanoid(7)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0 w-full">
              <div className="rounded-lg bg-white/5 border border-white/10 p-3 font-mono text-base sm:text-lg text-[var(--on-dark)] font-semibold break-all">
                {createdLink.shortUrl}
              </div>
              <p className="text-xs font-mono text-[var(--on-dark-muted)] truncate max-w-sm">
                Original: {createdLink.originalUrl}
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

          <div className="flex gap-2 pt-2 border-t border-white/10">
            <Button
              onClick={handleCopy}
              className="w-full bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-white font-medium gap-2 rounded-full cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-[var(--brand-mint)]" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  Copy Short Link
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});
