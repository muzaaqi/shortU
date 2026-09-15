/**
 * 7-Day click telemetry graph styled like a GitHub contribution heatmap.
 * Renders 7 horizontal square cells representing daily click activity.
 * Used by: src/components/link-card.tsx
 */
import { useQuery } from "@tanstack/react-query";
import { memo, useMemo } from "react";
import {
  type DailyClickPoint,
  getLinkDailyClicks,
} from "~/server/functions/analytics";
import { cn } from "~/lib/utils";

interface ClickSparklineProps {
  linkId: string;
  className?: string | undefined;
  initialData?: DailyClickPoint[] | undefined;
}

/**
 * Maps click count to foreground intensity level (0 to 5).
 */
function getContributionLevel(count: number, maxCount: number): number {
  if (count <= 0) return 0;
  if (maxCount <= 1) return 3;
  const ratio = count / maxCount;
  if (ratio <= 0.2) return 1;
  if (ratio <= 0.4) return 2;
  if (ratio <= 0.6) return 3;
  if (ratio <= 0.8) return 4;
  return 5;
}

/**
 * Returns Tailwind classNames matching tiered foreground opacities.
 */
function getContributionClasses(level: number): string {
  switch (level) {
    case 1:
      return "bg-foreground/20 border-foreground/25 hover:border-foreground/40";
    case 2:
      return "bg-foreground/40 border-foreground/45 hover:border-foreground/60";
    case 3:
      return "bg-foreground/60 border-foreground/65 hover:border-foreground/80";
    case 4:
      return "bg-foreground/80 border-foreground/85 hover:border-foreground";
    case 5:
      return "bg-foreground border-foreground shadow-xs";
    default:
      return "bg-foreground/5 border-foreground/10 hover:border-foreground/25";
  }
}

export const ClickSparkline = memo(function ClickSparkline({
  linkId,
  className,
  initialData,
}: ClickSparklineProps) {
  const { data: series } = useQuery({
    queryKey: ["analytics", "daily", linkId],
    queryFn: () => getLinkDailyClicks({ data: { linkId } }),
    initialData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const points = series ?? initialData ?? [];

  const maxCount = useMemo(() => {
    return Math.max(1, ...points.map((p) => p.count));
  }, [points]);

  const totalRecent = useMemo(() => {
    return points.reduce((acc, p) => acc + p.count, 0);
  }, [points]);

  if (points.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md bg-secondary/50 px-2 py-1 border border-border/50 select-none",
        className
      )}
      title={`7-day trend: ${totalRecent} clicks`}
    >
      <div
        className="flex items-center gap-1"
        role="img"
        aria-label={`7-day click trend graph: ${totalRecent} total clicks`}
      >
        {points.map((point) => {
          const level = getContributionLevel(point.count, maxCount);
          return (
            <div
              key={point.date}
              className={cn(
                "size-2.5 sm:size-3 rounded-[2px] border transition-transform duration-150 hover:scale-115 cursor-help",
                getContributionClasses(level)
              )}
              title={`${point.label} (${point.date}): ${point.count} ${point.count === 1 ? "click" : "clicks"}`}
            />
          );
        })}
      </div>
      <span className="font-mono text-[10px] text-muted-foreground tabular-nums ml-0.5">
        {totalRecent} <span className="text-[9px]">7d</span>
      </span>
    </div>
  );
});
