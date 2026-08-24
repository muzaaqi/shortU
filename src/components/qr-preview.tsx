/**
 * QR Code preview and download component.
 * Displays high-contrast base64 QR code with direct PNG download button.
 * Used by: src/components/link-result.tsx, src/components/link-card.tsx
 */
import { Download } from "lucide-react";
import { memo, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface QrPreviewProps {
  qrCode: string;
  slug: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showDownload?: boolean;
}

export const QrPreview = memo(function QrPreview({
  qrCode,
  slug,
  className,
  size = "md",
  showDownload = true,
}: QrPreviewProps) {
  const handleDownload = useCallback(() => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `shortU-${slug}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [qrCode, slug]);

  const sizeClasses = {
    sm: "size-24",
    md: "size-32",
    lg: "size-40",
  }[size];

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="rounded-lg bg-white p-2.5 shadow-sm border border-border">
        <img
          src={qrCode}
          alt={`QR code for slug ${slug}`}
          className={cn(sizeClasses, "object-contain")}
        />
      </div>
      {showDownload && (
        <Button
          variant="outline"
          size="xs"
          onClick={handleDownload}
          className="gap-1 text-xs"
        >
          <Download className="size-3" />
          Download PNG
        </Button>
      )}
    </div>
  );
});
