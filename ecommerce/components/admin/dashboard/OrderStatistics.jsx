import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { ORDER_STATUSES, ORDER_STATUS_META, TONE_FILL } from "@/lib/orderStatus";
import { Card, CardHeader, CARD_X } from "@/components/admin/ui/Card";
import { EmptyState, Skeleton } from "@/components/admin/ui/States";

/*
  Where orders stand right now: one stacked bar for the overall mix,
  then a row per status linking to the filtered order list.
*/
export default function OrderStatistics({ statistics, loading = false }) {
  const rows = ORDER_STATUSES.map((status) => ({
    status,
    count: statistics?.[status.toLowerCase()] || 0,
    ...ORDER_STATUS_META[status],
  }));
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <Card className="flex flex-col" aria-labelledby="order-status-title">
      <CardHeader
        id="order-status-title"
        title="Orders by status"
        description={total ? `${total.toLocaleString("en-GH")} orders in total` : "Every order, by where it is now"}
      />

      {loading ? (
        <div className={`${CARD_X} space-y-4 pb-5`}>
          <Skeleton className="h-2 w-full" />
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      ) : total === 0 ? (
        <EmptyState
          compact
          icon={ClipboardList}
          title="No orders yet"
          message="Status counts appear once customers start ordering."
        />
      ) : (
        <div className={`${CARD_X} pb-4`}>
          {/* Mix bar (decorative; the list below has the numbers) */}
          <div className="flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
            {rows
              .filter((row) => row.count > 0)
              .map((row) => (
                <div
                  key={row.status}
                  className={TONE_FILL[row.tone]}
                  style={{ width: `${(row.count / total) * 100}%` }}
                />
              ))}
          </div>

          <ul className="mt-3 -mx-2">
            {rows.map(({ status, count, tone, hint }) => (
              <li key={status}>
                <Link
                  href={`/admin/orders?status=${status}`}
                  className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-ink/3"
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${TONE_FILL[tone]}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-ink">{status}</span>
                    <span className="block text-xs text-muted">{hint}</span>
                  </span>
                  <span className="text-sm font-medium text-ink tabular-nums">
                    {count.toLocaleString("en-GH")}
                  </span>
                  <span className="w-10 text-right text-xs text-muted tabular-nums">
                    {Math.round((count / total) * 100)}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
