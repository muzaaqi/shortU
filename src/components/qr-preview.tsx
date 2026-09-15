/**
 * QR Code preview and download component.
 * Displays high-contrast scan-ready QR code with on-demand client rendering,
 * color preset customization studio, and PNG/SVG download buttons.
 * Used by: src/components/link-result.tsx, src/components/link-card.tsx
 */
import { Check, Download, Loader2, Palette } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { QR_COLOR_PRESETS, generateQR, generateQRSvg } from "~/lib/qr";
import { cn } from "~/lib/utils";

interface QrPreviewProps {
  /** Target URL to generate QR code from (e.g. short link URL) */
  url?: string | undefined;
  /** Optional pre-rendered data URL (fallback/legacy) */
  qrCode?: string | null | undefined;
  slug: string;
  className?: string | undefined;
  size?: ("sm" | "md" | "lg") | undefined;
  showDownload?: boolean | undefined;
  showColorPicker?: boolean | undefined;
}

export const QrPreview = memo(function QrPreview({
  url,
  qrCode: initialQrCode,
  slug,
  className,
  size = "md",
  showDownload = true,
  showColorPicker = true,
}: QrPreviewProps) {
  const [selectedColor, setSelectedColor] = useState(QR_COLOR_PRESETS[0]?.color ?? "#0f172a");
  const [dataUrl, setDataUrl] = useState<string | null>(initialQrCode || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQrCode && !url) {
      setDataUrl(initialQrCode);
      return;
    }

    if (!url) return;

    let cancelled = false;
    setLoading(true);

    generateQR(url, { darkColor: selectedColor })
      .then((generated) => {
        if (!cancelled) {
          setDataUrl(generated);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url, initialQrCode, selectedColor]);

  const handleDownloadPng = useCallback(() => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `shortU-${slug}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [dataUrl, slug]);

  const handleDownloadSvg = useCallback(async () => {
    const targetUrl = url;
    if (!targetUrl) return;

    const svgContent = await generateQRSvg(targetUrl, { darkColor: selectedColor });
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `shortU-${slug}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  }, [url, selectedColor, slug]);

  const sizeClasses = {
    sm: "size-24",
    md: "size-32",
    lg: "size-40",
  }[size];

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="flex items-center justify-center rounded-lg bg-white p-2.5 shadow-sm border border-border">
        {loading || !dataUrl ? (
          <div className={cn(sizeClasses, "flex items-center justify-center bg-muted/40 rounded")}>
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <img
            src={dataUrl}
            alt={`QR code for slug ${slug}`}
            className={cn(sizeClasses, "object-contain")}
          />
        )}
      </div>

      {/* Color theme swatches */}
      {showColorPicker && url && (
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
            <Palette className="size-3" />
            <span>Theme:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {QR_COLOR_PRESETS.map((preset) => {
              const isSelected = selectedColor === preset.color;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedColor(preset.color)}
                  className={cn(
                    "size-5 rounded-full border border-border/80 transition-transform duration-150 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "scale-110 ring-2 ring-brand-accent ring-offset-1"
                      : "hover:scale-105 opacity-80 hover:opacity-100"
                  )}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                  aria-label={preset.name}
                  aria-pressed={isSelected}
                >
                  {isSelected && <Check className="size-3 text-white stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showDownload && (
        <div className="flex items-center gap-1.5 pt-0.5">
          <Button
            variant="outline"
            size="xs"
            onClick={handleDownloadPng}
            disabled={!dataUrl || loading}
            className="gap-1 text-xs cursor-pointer"
            title="Download high-resolution PNG"
          >
            <Download className="size-3" />
            PNG
          </Button>
          {url && (
            <Button
              variant="outline"
              size="xs"
              onClick={handleDownloadSvg}
              disabled={loading}
              className="gap-1 text-xs cursor-pointer"
              title="Download vector SVG"
            >
              <Download className="size-3" />
              SVG
            </Button>
          )}
        </div>
      )}
    </div>
  );
});
