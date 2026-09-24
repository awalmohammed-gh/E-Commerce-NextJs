import { Loader, Truck, CircleCheck, CircleX, ClipboardList } from "lucide-react";
import { ORDER_STATUSES, ORDER_STATUS_BAR } from "@/lib/orderStatus";
import {
  CARD_CLASS,
  EmptyState,
  SectionHeader,
  Skeleton,
} from "./DashboardStates";

const STATUS_META = {
  Processing: { icon: Loader, hint: "Awaiting dispatch" },
  Shipped: { icon: Truck, hint: "On the way" },
  Delivered: { icon: CircleCheck, hint: "Completed" },
  Cancelled: { icon: CircleX, hint: "Not fulfilled" },
};

export default function OrderStatistics({ statistics, loading = false }) {
  const rows = ORDER_STATUSES.map((status) => ({
    status,
    count: statistics?.[status.toLowerCase()] || 0,
    ...STATUS_META[status],
  }));
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <section className={`${CARD_CLASS} overflow-hidden`}>
      <SectionHeader title="Order statistics" subtitle="Orders by status" />

      {loading ? (
        <div className="px-5 sm:px-6 pb-6 space-y-5">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders to summarise"
          message="Status counts will show once orders come in."
        />
      ) : (
        <ul className="px-5 sm:px-6 pb-6 space-y-5">
          {rows.map(({ status, count, icon: Icon, hint }) => {
            const share = Math.round((count / total) * 100);

            return (
              <li key={status}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 text-[#8A6A52] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1C1A17]">
                        {status}
                      </p>
                      <p className="text-[11px] text-[#8A6A52]">{hint}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#1C1A17] tabular-nums shrink-0">
                    <span className="font-semibold">
                      {count.toLocaleString("en-GH")}
                    </span>
                    <span className="text-[#8A6A52]"> · {share}%</span>
                  </p>
                </div>
                <div
                  className="h-2 rounded-full bg-[#F7F4EE] overflow-hidden"
                  role="progressbar"
                  aria-label={`${status} orders`}
                  aria-valuenow={share}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-full rounded-full ${ORDER_STATUS_BAR[status]}`}
                    // Keep a sliver visible for small non-zero counts
                    style={{ width: `${count > 0 ? Math.max(share, 2) : 0}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
