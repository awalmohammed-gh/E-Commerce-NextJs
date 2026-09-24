import Link from "next/link";
import { Eye, BadgeCheck, BadgeX, Package } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { ORDER_STATUS_STYLES } from "@/lib/orderStatus";
import {
  CARD_CLASS,
  EmptyState,
  SectionHeader,
  Skeleton,
} from "./DashboardStates";

const COLUMNS = ["Order", "Customer", "Total", "Payment", "Status", "Date", ""];

export default function RecentOrders({ orders = [], loading = false }) {
  return (
    <section className={`${CARD_CLASS} overflow-hidden`}>
      <SectionHeader
        title="Recent orders"
        subtitle="The 10 most recent orders"
        action={
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-[#1C1A17] hover:text-[#D98880] underline underline-offset-4 transition-colors"
          >
            View all
          </Link>
        }
      />

      {loading ? (
        <div className="px-5 sm:px-6 pb-6 space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          message="Orders will appear here as customers buy."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-[#FAF8F4] border-y border-[#1C1A17]/5">
                {COLUMNS.map((col, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-5 sm:px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#8A6A52]"
                  >
                    {col || <span className="sr-only">Actions</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1A17]/5">
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-[#FAF8F4]/60 transition-colors"
                >
                  <td className="px-5 sm:px-6 py-3.5 font-mono font-medium text-[#1C1A17]">
                    #{order._id.slice(-8)}
                  </td>
                  <td className="px-5 sm:px-6 py-3.5 text-[#1C1A17] max-w-[180px] truncate">
                    {order.customerName || "—"}
                  </td>
                  <td className="px-5 sm:px-6 py-3.5 font-semibold text-[#1C1A17] tabular-nums whitespace-nowrap">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-5 sm:px-6 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        order.isPaid
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {order.isPaid ? (
                        <BadgeCheck className="w-3 h-3" />
                      ) : (
                        <BadgeX className="w-3 h-3" />
                      )}
                      {order.isPaid ? "Paid" : "Unpaid"}
                    </span>
                    {order.paymentMethod && (
                      <p className="text-[11px] text-[#8A6A52] mt-1 whitespace-nowrap">
                        {order.paymentMethod}
                      </p>
                    )}
                  </td>
                  <td className="px-5 sm:px-6 py-3.5">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wider ${
                        ORDER_STATUS_STYLES[order.orderStatus] ||
                        "bg-[#F7F4EE] text-[#8A6A52] border-[#E5DDD1]"
                      }`}
                    >
                      {order.orderStatus || "Unknown"}
                    </span>
                  </td>
                  <td className="px-5 sm:px-6 py-3.5 text-[#4A463F] whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-5 sm:px-6 py-3.5 text-right">
                    <Link
                      href="/admin/orders"
                      className="inline-flex w-9 h-9 items-center justify-center rounded-full text-[#8A6A52] hover:text-[#1C1A17] hover:bg-[#1C1A17]/5 transition-colors"
                      aria-label={`View order ${order._id.slice(-8)}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
