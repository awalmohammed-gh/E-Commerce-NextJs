import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { CARD } from "@/components/admin/ui/Card";
import { Skeleton } from "@/components/admin/ui/States";

const TREND = {
  up: { icon: ArrowUpRight, className: "text-success", word: "Up" },
  down: { icon: ArrowDownRight, className: "text-danger", word: "Down" },
  flat: { icon: Minus, className: "text-muted", word: "No change" },
};

/*
  change: { current, previous, percent, windowDays } from the API.
  percent is null when there is no previous-period data to compare with;
  then only the activity line shows (a trend is never invented).
*/
export default function DashboardStatCard({
  title,
  value,
  icon: Icon,
  change,
  formatChange = (n) => `${n.toLocaleString("en-GH")} new`,
  loading = false,
}) {
  if (loading) {
    return (
      <div className={`${CARD} p-4 sm:p-5`}>
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="mt-4 h-7 w-32" />
        <Skeleton className="mt-3 h-3 w-40" />
      </div>
    );
  }

  const percent = change?.percent;
  const trend = percent == null ? null : percent > 0 ? "up" : percent < 0 ? "down" : "flat";
  const trendMeta = trend && TREND[trend];

  return (
    <div className={`${CARD} p-4 sm:p-5`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-ink-soft">{title}</p>
        <Icon className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
      </div>

      <p className="mt-3 text-xl font-semibold tracking-[-0.01em] sm:text-2xl break-words text-ink tabular-nums">
        {value}
      </p>

      {change && (
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          {trendMeta && (
            <span
              className={`inline-flex items-center gap-0.5 font-medium tabular-nums ${trendMeta.className}`}
            >
              <trendMeta.icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">{trendMeta.word} </span>
              {percent > 0 ? "+" : ""}
              {percent}%
            </span>
          )}
          <span>
            {formatChange(change.current)} in the last {change.windowDays} days
          </span>
        </p>
      )}
    </div>
  );
}
