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
 * Maps click count to GitHub contribution heatmap level (0 to 4).
 */
function getContributionLevel(count: number, maxCount: number): number {
  if (count <= 0) return 0;
  if (maxCount <= 1) return 2;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

/**
 * Returns Tailwind classNames matching GitHub's iconic contribution color tiers.
 */
function getContributionClasses(level: number): string {
  switch (level) {
    case 1:
      return "bg-emerald-500/30 dark:bg-emerald-500/25 border-emerald-500/40 hover:border-emerald-500/60";
    case 2:
      return "bg-emerald-500/55 dark:bg-emerald-500/50 border-emerald-500/60 hover:border-emerald-500/80";
    case 3:
      return "bg-emerald-500/80 dark:bg-emerald-500/75 border-emerald-500/85 hover:border-emerald-500";
    case 4:
      return "bg-emerald-500 dark:bg-emerald-400 border-emerald-600 dark:border-emerald-300 shadow-xs";
    default:
      return "bg-muted/70 dark:bg-muted/40 border-border/50 hover:border-border";
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
