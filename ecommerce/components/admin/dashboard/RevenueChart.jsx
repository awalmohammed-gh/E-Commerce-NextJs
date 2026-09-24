"use client";

import { useEffect, useState } from "react";
import { LineChart } from "lucide-react";
import { formatCurrency, formatCurrencyCompact } from "@/lib/formatCurrency";
import {
  fetchRevenue,
  getErrorMessage,
  isRequestCanceled,
  isUnauthorized,
} from "@/lib/adminDashboardApi";
import {
  CARD_CLASS,
  EmptyState,
  SectionError,
  SectionHeader,
  Skeleton,
} from "./DashboardStates";

const PERIODS = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "12m", label: "12 months" },
];

const TICK_COUNT = 4;

// Round the axis maximum up to a readable number (1, 2, 2.5, 5 × 10ⁿ)
function niceMax(value) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value);
  return step * magnitude;
}

export default function RevenueChart({ onUnauthorized }) {
  const [period, setPeriod] = useState("7d");
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeKey, setActiveKey] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchRevenue(period, { signal: controller.signal });
        setSeries(data);
      } catch (err) {
        if (isRequestCanceled(err)) return;
        if (isUnauthorized(err)) return onUnauthorized?.();

        console.error(err);
        setError(getErrorMessage(err, "Failed to load revenue"));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();

    // Switching periods quickly cancels the stale request
    return () => controller.abort();
  }, [period, reloadKey, onUnauthorized]);

  const points = series?.points || [];
  const axisMax = niceMax(Math.max(0, ...points.map((p) => p.revenue)));
  const ticks = Array.from(
    { length: TICK_COUNT + 1 },
    (_, i) => (axisMax / TICK_COUNT) * (TICK_COUNT - i),
  );
  // Label every bar for short ranges, every 5th for 30 days
  const labelEvery = points.length > 12 ? 5 : 1;
  const hasRevenue = series?.totalRevenue > 0;

  return (
    <section className={`${CARD_CLASS} overflow-hidden`}>
      <SectionHeader
        title="Revenue overview"
        subtitle={
          series && !loading
            ? `${formatCurrency(series.totalRevenue)} from ${series.totalOrders.toLocaleString("en-GH")} paid ${series.totalOrders === 1 ? "order" : "orders"}`
            : "Paid orders, excluding cancellations"
        }
        action={
          <div
            className="inline-flex p-1 rounded-full bg-[#F7F4EE] border border-[#E5DDD1]"
            role="tablist"
            aria-label="Revenue period"
          >
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                role="tab"
                aria-selected={period === p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  period === p.value
                    ? "bg-[#1C1A17] text-[#F5F1EA]"
                    : "text-[#4A463F] hover:text-[#1C1A17]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="px-5 sm:px-6 pb-6">
        {loading ? (
          <div className="h-64 flex items-end gap-2 pt-4">
            {Array.from({ length: 12 }, (_, i) => (
              <Skeleton
                key={i}
                className="flex-1"
                style={{ height: `${30 + ((i * 37) % 60)}%` }}
              />
            ))}
          </div>
        ) : error ? (
          <SectionError
            message={error}
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        ) : !hasRevenue ? (
          <EmptyState
            icon={LineChart}
            title="No revenue in this period"
            message="Paid orders will be charted here."
          />
        ) : (
          <>
            <div className="flex gap-3">
              {/* Y axis */}
              <div className="h-56 flex flex-col justify-between text-[10px] text-[#8A6A52] tabular-nums text-right shrink-0 -my-1.5">
                {ticks.map((t) => (
                  <span key={t}>{formatCurrencyCompact(t)}</span>
                ))}
              </div>

              {/* Plot */}
              <div className="relative flex-1 min-w-0">
                {/* Grid */}
                <div className="absolute inset-x-0 top-0 h-56 flex flex-col justify-between pointer-events-none">
                  {ticks.map((t, i) => (
                    <div
                      key={t}
                      className={`border-t ${
                        i === ticks.length - 1
                          ? "border-[#1C1A17]/20"
                          : "border-dashed border-[#1C1A17]/[0.07]"
                      }`}
                    />
                  ))}
                </div>

                {/* Bars */}
                <div
                  className="relative h-56 flex items-end gap-0.5"
                  onMouseLeave={() => setActiveKey(null)}
                >
                  {points.map((point, i) => {
                    const height = (point.revenue / axisMax) * 100;
                    const active = activeKey === point.key;
                    // Pin edge tooltips inward so the card doesn't clip them
                    const tooltipPosition =
                      i < 2
                        ? "left-0"
                        : i > points.length - 3
                          ? "right-0"
                          : "left-1/2 -translate-x-1/2";

                    return (
                      <div
                        key={point.key}
                        tabIndex={0}
                        onMouseEnter={() => setActiveKey(point.key)}
                        onFocus={() => setActiveKey(point.key)}
                        onBlur={() => setActiveKey(null)}
                        className="relative flex-1 h-full flex items-end justify-center outline-none group"
                        aria-label={`${point.label}: ${formatCurrency(point.revenue)}, ${point.orders} orders`}
                      >
                        <div
                          className={`w-full max-w-10 rounded-t-sm transition-colors ${
                            active ? "bg-[#1C1A17]" : "bg-[#D98880]"
                          }`}
                          style={{ height: `${height}%` }}
                        />

                        {active && (
                          <div className={`absolute bottom-full mb-2 ${tooltipPosition} z-10 whitespace-nowrap rounded-xl bg-[#1C1A17] text-[#F5F1EA] px-3 py-2 text-xs shadow-lg pointer-events-none`}>
                            <p className="text-[#F5F1EA]/60">{point.label}</p>
                            <p className="font-semibold tabular-nums">
                              {formatCurrency(point.revenue)}
                            </p>
                            <p className="text-[#F5F1EA]/60">
                              {point.orders}{" "}
                              {point.orders === 1 ? "order" : "orders"}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* X axis */}
                <div className="flex gap-0.5 mt-2">
                  {points.map((point, i) => (
                    <span
                      key={point.key}
                      className="flex-1 text-center text-[10px] text-[#8A6A52] whitespace-nowrap"
                    >
                      {i % labelEvery === 0 && (
                        // 12 month labels don't fit on phones: show every other one
                        <span
                          className={
                            labelEvery === 1 && points.length > 7 && i % 2 === 1
                              ? "hidden sm:inline"
                              : ""
                          }
                        >
                          {point.label}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Screen-reader table view of the same data */}
            <table className="sr-only">
              <caption>Revenue by {series.unit}</caption>
              <thead>
                <tr>
                  <th scope="col">Period</th>
                  <th scope="col">Revenue</th>
                  <th scope="col">Orders</th>
                </tr>
              </thead>
              <tbody>
                {points.map((point) => (
                  <tr key={point.key}>
                    <td>{point.label}</td>
                    <td>{formatCurrency(point.revenue)}</td>
                    <td>{point.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </section>
  );
}
