import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CARD_CLASS, Skeleton } from "./DashboardStates";

/*
  change: { current, previous, percent, windowDays } from the API.
  percent is null when there is no previous-period data to compare with,
  in which case only the period activity line is shown.
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
      <div className={`${CARD_CLASS} p-5 sm:p-6`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-10 rounded-2xl" />
        </div>
        <Skeleton className="h-8 w-32 mt-4" />
        <Skeleton className="h-3 w-40 mt-3" />
      </div>
    );
  }

  const percent = change?.percent;
  const trend =
    percent == null ? null : percent > 0 ? "up" : percent < 0 ? "down" : "flat";

  const trendStyles = {
    up: "bg-green-50 text-green-700",
    down: "bg-red-50 text-red-700",
    flat: "bg-[#F7F4EE] text-[#8A6A52]",
  };
  const TrendIcon = { up: TrendingUp, down: TrendingDown, flat: Minus }[trend];

  return (
    <div className={`${CARD_CLASS} p-5 sm:p-6`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A6A52]">
          {title}
        </p>
        <div className="w-10 h-10 shrink-0 rounded-2xl bg-[#D98880]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#D98880]" />
        </div>
      </div>

      <p className="mt-3 text-2xl sm:text-[28px] font-semibold text-[#1C1A17] tracking-tight tabular-nums break-words">
        {value}
      </p>

      {change && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#8A6A52]">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${trendStyles[trend]}`}
              title={`Compared with the previous ${change.windowDays} days`}
            >
              <TrendIcon className="w-3 h-3" />
              {percent > 0 ? "+" : ""}
              {percent}%
            </span>
          )}
          <span>
            {formatChange(change.current)} in last {change.windowDays} days
          </span>
        </div>
      )}
    </div>
  );
}
