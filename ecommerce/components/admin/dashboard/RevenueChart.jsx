"use client";

import { useEffect, useState } from "react";
import { LineChart } from "lucide-react";
import { formatCedis, formatCedisCompact } from "@/lib/formatCurrency";
import { fetchRevenue, isRequestCanceled, isUnauthorized } from "@/lib/adminDashboardApi";
import { Card, CardHeader, CARD_X } from "@/components/admin/ui/Card";
import { EmptyState, ErrorState, Skeleton, friendlyError } from "@/components/admin/ui/States";

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
  const [period, setPeriod] = useState("30d");
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
        setError(friendlyError(err, "Revenue data couldn't be loaded."));
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
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (axisMax / TICK_COUNT) * (TICK_COUNT - i));
  // Label every bar for short ranges, every 5th for 30 days
  const labelEvery = points.length > 12 ? 5 : 1;
  const hasRevenue = series?.totalRevenue > 0;

  return (
    <Card aria-labelledby="revenue-title">
      <CardHeader
        id="revenue-title"
        title="Revenue"
        description={
          series && !loading
            ? `${formatCedis(series.totalRevenue)} from ${series.totalOrders.toLocaleString("en-GH")} paid ${series.totalOrders === 1 ? "order" : "orders"}`
            : "Paid orders, excluding cancelled ones"
        }
        action={
          <div className="inline-flex rounded-md border border-line bg-paper p-0.5" role="group" aria-label="Revenue period">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                aria-pressed={period === p.value}
                onClick={() => setPeriod(p.value)}
                className={`h-8 rounded px-2.5 text-xs font-medium transition-colors sm:h-7 ${
                  period === p.value
                    ? "bg-white text-ink shadow-[0_1px_2px_rgb(28_26_23/0.08)] ring-1 ring-line"
                    : "text-muted hover:text-ink"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      <div className={`${CARD_X} pb-5`}>
        {loading ? (
          <div className="flex h-60 items-end gap-1.5 pt-4">
            {Array.from({ length: 14 }, (_, i) => (
              <Skeleton key={i} className="flex-1" style={{ height: `${25 + ((i * 37) % 60)}%` }} />
            ))}
          </div>
        ) : error ? (
          <ErrorState compact title="Couldn't load revenue" message={error} onRetry={() => setReloadKey((k) => k + 1)} />
        ) : !hasRevenue ? (
          <EmptyState
            compact
            icon={LineChart}
            title="No revenue in this period"
            message="Paid orders will be charted here. Mark cash-on-delivery orders as paid to include them."
          />
        ) : (
          <>
            <div className="flex gap-3 pt-2">
              {/* Y axis */}
              <div className="-my-1.5 flex h-56 shrink-0 flex-col justify-between text-right text-[11px] text-muted tabular-nums">
                {ticks.map((t) => (
                  <span key={t}>{formatCedisCompact(t)}</span>
                ))}
              </div>

              {/* Plot */}
              <div className="relative min-w-0 flex-1">
                {/* Grid */}
                <div className="pointer-events-none absolute inset-x-0 top-0 flex h-56 flex-col justify-between">
                  {ticks.map((t, i) => (
                    <div key={t} className={`border-t ${i === ticks.length - 1 ? "border-line" : "border-ink/6"}`} />
                  ))}
                </div>

                {/* Bars */}
                <div className="relative flex h-56 items-end gap-0.5" onMouseLeave={() => setActiveKey(null)}>
                  {points.map((point, i) => {
                    const height = (point.revenue / axisMax) * 100;
                    const active = activeKey === point.key;
                    // Pin edge tooltips inward so the card doesn't clip them
                    const tooltipPosition =
                      i < 2 ? "left-0" : i > points.length - 3 ? "right-0" : "left-1/2 -translate-x-1/2";

                    return (
                      <div
                        key={point.key}
                        tabIndex={0}
                        onMouseEnter={() => setActiveKey(point.key)}
                        onFocus={() => setActiveKey(point.key)}
                        onBlur={() => setActiveKey(null)}
                        className="relative flex h-full flex-1 items-end justify-center rounded-sm focus-visible:outline-offset-0"
                        aria-label={`${point.label}: ${formatCedis(point.revenue)}, ${point.orders} orders`}
                      >
                        <div
                          className={`w-full max-w-9 rounded-t-[3px] transition-colors ${
                            active ? "bg-rose-deep" : "bg-ink/75"
                          }`}
                          style={{ height: `${height}%` }}
                        />

                        {active && (
                          <div
                            className={`pointer-events-none absolute bottom-full z-10 mb-2 ${tooltipPosition} rounded-md bg-ink px-3 py-2 text-xs whitespace-nowrap text-white shadow-lg`}
                          >
                            <p className="text-white/65">{point.label}</p>
                            <p className="font-semibold tabular-nums">{formatCedis(point.revenue)}</p>
                            <p className="text-white/65">
                              {point.orders} {point.orders === 1 ? "order" : "orders"}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* X axis */}
                <div className="mt-2 flex gap-0.5">
                  {points.map((point, i) => (
                    <span key={point.key} className="flex-1 text-center text-[11px] whitespace-nowrap text-muted">
                      {i % labelEvery === 0 && (
                        // Phones get half the labels: every other month, every 10th day
                        <span
                          className={
                            (labelEvery === 1 && points.length > 7 && i % 2 === 1) ||
                            (labelEvery > 1 && (i / labelEvery) % 2 === 1)
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
                    <td>{formatCedis(point.revenue)}</td>
                    <td>{point.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </Card>
  );
}
