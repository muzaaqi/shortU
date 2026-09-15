/**
 * 7-Day click telemetry sparkline chart.
 * Lightweight, zero-dependency SVG bar chart rendering daily click velocity.
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
      <div className="flex items-end gap-1 h-5" role="img" aria-label="7-day click trend graph">
        {points.map((point) => {
          const heightPercent = point.count > 0 ? Math.max(15, (point.count / maxCount) * 100) : 10;
          return (
            <div
              key={point.date}
              className="flex flex-col items-center justify-end h-full w-2"
              title={`${point.label} (${point.date}): ${point.count} clicks`}
            >
              <div
                style={{ height: `${heightPercent}%` }}
                className={cn(
                  "w-full rounded-xs transition-all duration-200",
                  point.count > 0
                    ? "bg-brand-accent hover:opacity-80"
                    : "bg-muted-foreground/20 hover:bg-muted-foreground/40"
                )}
              />
            </div>
          );
        })}
      </div>
      <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
        {totalRecent} <span className="text-[9px]">7d</span>
      </span>
    </div>
  );
});
