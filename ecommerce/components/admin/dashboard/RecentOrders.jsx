import Link from "next/link";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { formatCedis } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { Card, CardHeader, CardLink, CARD_X } from "@/components/admin/ui/Card";
import { OrderStatusBadge, PaymentBadge } from "@/components/admin/ui/Badge";
import { EmptyState, Skeleton } from "@/components/admin/ui/States";
import { TABLE, TH, TD, TR } from "@/components/admin/ui/Table";

const orderHref = (id) => `/admin/orders?order=${id}`;
const shortId = (id) => `#${String(id).slice(-8).toUpperCase()}`;

export default function RecentOrders({ orders = [], loading = false }) {
  return (
    <Card className="h-full" aria-labelledby="recent-orders-title">
      <CardHeader
        id="recent-orders-title"
        title="Recent orders"
        description="The latest 10 orders"
        action={<CardLink href="/admin/orders">View all orders</CardLink>}
      />

      {loading ? (
        <div className={`${CARD_X} space-y-3 pb-4`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          compact
          icon={ShoppingBag}
          title="No orders yet"
          message="New orders will show here as soon as customers check out."
        />
      ) : (
        <>
          {/* Phones: one tappable row per order */}
          <ul className="divide-y divide-line border-t border-line md:hidden">
            {orders.map((order) => (
              <li key={order._id}>
                <Link
                  href={orderHref(order._id)}
                  className={`flex items-center gap-3 ${CARD_X} py-3 transition-colors hover:bg-ink/2`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-ink">{order.customerName || "Guest"}</p>
                      <p className="shrink-0 text-sm font-medium text-ink tabular-nums">
                        {formatCedis(order.totalAmount)}
                      </p>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="font-mono">{shortId(order._id)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDate(order.createdAt)}</span>
                      <OrderStatusBadge status={order.orderStatus} />
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          {/* md and up: table */}
          <div className="hidden overflow-x-auto md:block">
            <table className={TABLE}>
              <thead>
                <tr>
                  <th scope="col" className={TH}>Order</th>
                  <th scope="col" className={TH}>Customer</th>
                  <th scope="col" className={TH}>Date</th>
                  <th scope="col" className={TH}>Payment</th>
                  <th scope="col" className={TH}>Status</th>
                  <th scope="col" className={`${TH} text-right`}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className={TR}>
                    <td className={TD}>
                      <Link
                        href={orderHref(order._id)}
                        className="rounded-sm font-mono text-[13px] font-medium text-ink underline decoration-ink/20 underline-offset-4 hover:decoration-ink"
                      >
                        {shortId(order._id)}
                      </Link>
                    </td>
                    <td className={`${TD} max-w-45 truncate text-ink`}>{order.customerName || "Guest"}</td>
                    <td className={`${TD} whitespace-nowrap text-ink-soft`}>{formatDate(order.createdAt)}</td>
                    <td className={TD}>
                      <PaymentBadge paid={order.isPaid} />
                    </td>
                    <td className={TD}>
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>
                    <td className={`${TD} text-right font-medium whitespace-nowrap text-ink tabular-nums`}>
                      {formatCedis(order.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
