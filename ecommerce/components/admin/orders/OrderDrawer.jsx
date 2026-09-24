"use client";

import Image from "next/image";
import { CreditCard, MapPin, Package, Phone, Trash2, User } from "lucide-react";
import { ORDER_STATUSES, ORDER_STATUS_META, DEFAULT_ORDER_STATUS } from "@/lib/orderStatus";
import { formatCedis } from "@/lib/formatCurrency";
import { Drawer } from "@/components/admin/ui/Dialog";
import Button from "@/components/admin/ui/Button";
import { OrderStatusBadge, PaymentBadge } from "@/components/admin/ui/Badge";
import { Select, LABEL } from "@/components/admin/ui/Field";
import { customerOf, itemCount, orderLines, orderTotal, shortOrderId } from "./orderUtils";

function Section({ title, children, className = "" }) {
  return (
    <section className={`border-b border-line px-4 py-4 sm:px-5 ${className}`}>
      <h3 className="mb-3 text-xs font-medium tracking-[0.06em] text-muted uppercase">{title}</h3>
      {children}
    </section>
  );
}

function Row({ label, children, strong = false }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${strong ? "text-[15px] font-semibold text-ink" : "text-sm text-ink-soft"}`}>
      <dt>{label}</dt>
      <dd className="text-right tabular-nums">{children}</dd>
    </div>
  );
}

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-GH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

/*
  Everything about one order, and the actions on it: change status,
  mark paid/unpaid, delete. All updates go through the parent so the
  list stays in sync.
*/
export default function OrderDrawer({
  order,
  productsById,
  updating,
  onClose,
  onStatusChange,
  onTogglePayment,
  onDelete,
}) {
  const open = Boolean(order);
  const lines = order ? orderLines(order, productsById) : [];
  const customer = order ? customerOf(order) : null;
  const status = order?.orderStatus || DEFAULT_ORDER_STATUS;
  const total = order ? orderTotal(order, lines) : 0;
  const subtotal = typeof order?.subtotal === "number" ? order.subtotal : lines.reduce((s, l) => s + l.lineTotal, 0);
  const hasBreakdown = typeof order?.deliveryFee === "number";
  const isPaid = Boolean(order?.payment);
  const busy = updating === "status" || updating === "payment";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={order ? `Order ${shortOrderId(order._id)}` : "Order"}
      description={order && `Placed ${formatDateTime(order.createdAt)}`}
      footer={
        order && (
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="danger-outline"
              icon={Trash2}
              onClick={() => onDelete(order)}
              disabled={busy}
            >
              Delete order
            </Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        )
      }
    >
      {order && (
        <>
          {/* Status + payment: the two things admins change */}
          <Section title="Fulfilment">
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={status} />
              <span className="text-[13px] text-muted">{ORDER_STATUS_META[status]?.hint}</span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-[minmax(0,1fr)_auto] min-[420px]:items-end">
              <div>
                <label htmlFor="order-status" className={LABEL}>
                  Order status
                </label>
                <Select
                  id="order-status"
                  value={status}
                  disabled={busy}
                  onChange={(e) => onStatusChange(order, e.target.value)}
                  aria-describedby="order-status-note"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              {updating === "status" && (
                <p className="pb-2.5 text-[13px] text-muted" role="status">
                  Saving...
                </p>
              )}
            </div>
            <p id="order-status-note" className="mt-1.5 text-xs text-muted">
              Changes save straight away.
            </p>
          </Section>

          <Section title="Payment">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <CreditCard className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm text-ink">{order.paymentMethod || "Not recorded"}</p>
                  <div className="mt-1">
                    <PaymentBadge paid={isPaid} />
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => onTogglePayment(order)}
                loading={updating === "payment"}
                disabled={busy}
              >
                {isPaid ? "Mark as unpaid" : "Mark as paid"}
              </Button>
            </div>
            {!isPaid && order.paymentMethod === "Cash On Delivery" && (
              <p className="mt-3 text-xs text-muted">
                Mark cash-on-delivery orders as paid once the money is collected, so they count toward revenue.
              </p>
            )}
          </Section>

          <Section title="Customer">
            <dl className="space-y-2.5 text-sm">
              <div className="flex gap-2.5">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                <dt className="sr-only">Name</dt>
                <dd className="text-ink">{customer.name || "Not provided"}</dd>
              </div>
              {customer.phone && (
                <div className="flex gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                  <dt className="sr-only">Phone</dt>
                  <dd>
                    <a href={`tel:${customer.phone}`} className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink">
                      {customer.phone}
                    </a>
                  </dd>
                </div>
              )}
              <div className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                <dt className="sr-only">Delivery address</dt>
                <dd className="text-ink-soft">
                  {customer.lines.length
                    ? customer.lines.map((line, i) => (
                        <span key={i} className="block">
                          {line}
                        </span>
                      ))
                    : "No address on this order"}
                </dd>
              </div>
            </dl>
          </Section>

          <Section title={`Items (${itemCount(lines)})`}>
            {lines.length === 0 ? (
              <p className="text-sm text-muted">This order has no item details.</p>
            ) : (
              <ul className="space-y-3">
                {lines.map((line) => (
                  <li key={line.key} className="flex gap-3">
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded border border-line bg-paper">
                      {line.image ? (
                        <Image src={line.image} alt="" fill sizes="48px" className="object-cover" />
                      ) : (
                        <Package className="m-auto mt-5 h-4 w-4 text-muted" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm text-ink">{line.name}</p>
                      <p className="mt-0.5 text-xs text-muted tabular-nums">
                        {line.size ? `Size ${line.size} · ` : ""}
                        {line.qty} × {formatCedis(line.unitPrice)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-medium text-ink tabular-nums">{formatCedis(line.lineTotal)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Summary" className="border-b-0">
            <dl className="space-y-2">
              {hasBreakdown && (
                <>
                  <Row label="Subtotal">{formatCedis(subtotal)}</Row>
                  <Row label="Delivery">{order.deliveryFee ? formatCedis(order.deliveryFee) : "Free"}</Row>
                </>
              )}
              <div className={hasBreakdown ? "border-t border-line pt-2" : ""}>
                <Row label="Total" strong>
                  {formatCedis(total)}
                </Row>
              </div>
            </dl>
          </Section>
        </>
      )}
    </Drawer>
  );
}
