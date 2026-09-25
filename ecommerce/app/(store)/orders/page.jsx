"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCircle2, ChevronDown, Package } from "lucide-react";
import AccountShell, { AccountPageHeader } from "@/components/account/AccountShell";
import OrderStatusBadge, { PaymentBadge } from "@/components/account/OrderStatusBadge";
import ProductImage from "@/components/card/ProductImage";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { formatCedis } from "@/lib/formatCurrency";

// Order progress (Cancelled is shown separately)
const STEPS = ["Processing", "Shipped", "Delivered"];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GH", { year: "numeric", month: "long", day: "numeric" });

const orderNumber = (id) => String(id).slice(-8).toUpperCase();

// Same frame, navigation and sign-in guard as the /account pages
export default function MyOrdersPage() {
  return (
    <AccountShell>
      <Suspense fallback={<OrdersSkeleton />}>
        <MyOrders />
      </Suspense>
    </AccountShell>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading orders">
      {[0, 1, 2].map((i) => (
        <div key={i} className="panel p-5 sm:p-6">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="skeleton h-4 w-36" />
              <div className="skeleton h-3 w-24" />
            </div>
            <div className="skeleton h-5 w-20" />
          </div>
          <div className="mt-5 flex gap-2">
            <div className="skeleton h-20 w-15 rounded-field" />
            <div className="skeleton h-20 w-15 rounded-field" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Progress({ status }) {
  const current = Math.max(0, STEPS.indexOf(status));
  return (
    <ol className="grid grid-cols-3" aria-label="Order progress">
      {STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} className="relative flex flex-col items-start gap-2" aria-current={i === current ? "step" : undefined}>
            <span className="flex w-full items-center">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                  done ? "border-terracotta-deep bg-terracotta-deep text-white" : "border-line bg-white text-muted"
                }`}
              >
                {i < current ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" /> : i + 1}
              </span>
              {i < STEPS.length - 1 && (
                // Completed legs of the line draw in, one after the other
                <span className="relative mx-2 h-px flex-1 overflow-hidden bg-line" aria-hidden="true">
                  {i < current && (
                    <motion.span
                      className="absolute inset-0 origin-left bg-terracotta-deep"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.2 }}
                    />
                  )}
                </span>
              )}
            </span>
            <span className={`text-[13px] ${done ? "text-ink" : "text-muted"}`}>
              {step}
              <span className="sr-only">{i < current ? " (done)" : i === current ? " (current)" : ""}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const lines = order.lines || [];
  const itemCount = lines.reduce((n, l) => n + (l.quantity || 0), 0);
  const status = order.orderStatus || "Processing";
  const detailsId = `order-${order._id}`;

  return (
    <li className="panel overflow-hidden transition-shadow duration-300 hover:shadow-soft">
      <div className="p-5 sm:p-6">
        {/* Summary */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-[24px] leading-tight text-ink">Order #{orderNumber(order._id)}</h2>
            <p className="mt-0.5 text-[14px] text-muted">
              {formatDate(order.createdAt)} &middot; {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <OrderStatusBadge status={status} />
            <PaymentBadge paid={order.payment} method={order.paymentMethod} />
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <ul className="flex gap-2 overflow-hidden" aria-label="Items">
            {lines.slice(0, 4).map((line) => (
              <li key={`${line.productId}-${line.size}`} className="relative h-20 w-15 shrink-0 overflow-hidden rounded-field bg-sand">
                <ProductImage src={line.image} alt={line.name} sizes="60px" className="object-cover" />
              </li>
            ))}
            {lines.length > 4 && (
              <li className="flex h-20 w-15 shrink-0 items-center justify-center rounded-field bg-cream text-[13px] text-muted">
                +{lines.length - 4}
              </li>
            )}
          </ul>
          <div className="shrink-0 text-right">
            <p className="text-[13px] text-muted">Total</p>
            <p className="text-lg font-semibold text-ink tabular-nums">{formatCedis(order.totalAmount)}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={detailsId}
        className="flex min-h-12 w-full items-center justify-between border-t border-line px-5 text-[14px] text-ink transition-colors hover:bg-cream/60 sm:px-6"
      >
        {open ? "Hide details" : "View order"}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={detailsId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="space-y-8 border-t border-line p-5 sm:p-6">
              {status === "Cancelled" ? (
                <p className="alert-error">
                  This order was cancelled and won&apos;t be delivered.
                </p>
              ) : (
                <Progress status={status} />
              )}

              {/* Items */}
              <div>
                <h3 className="eyebrow mb-3">Items</h3>
                <ul className="divide-y divide-line">
                  {lines.map((line) => (
                    <li key={`${line.productId}-${line.size}`} className="flex items-center gap-4 py-3 first:pt-0">
                      <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded-field bg-sand">
                        <ProductImage src={line.image} alt="" sizes="48px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <Link href={`/product/${line.productId}`} className="block truncate text-[15px] text-ink hover:underline underline-offset-4 decoration-ink/30">
                          {line.name}
                        </Link>
                        <span className="block text-[13px] text-muted">
                          {line.size !== "default" && <>Size {line.size} &middot; </>}Qty {line.quantity}
                          {line.unitPrice > 0 && <> &middot; {formatCedis(line.unitPrice)} each</>}
                        </span>
                      </span>
                      <span className="shrink-0 text-[15px] text-ink">
                        {line.lineTotal > 0 ? formatCedis(line.lineTotal) : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {order.address && (
                  <div>
                    <h3 className="eyebrow mb-2">Delivered to</h3>
                    <address className="text-[14px] leading-relaxed text-ink-soft not-italic">
                      <span className="text-ink">{order.address.fullName}</span>
                      {order.address.phone && <><br />{order.address.phone}</>}
                      <br />
                      {order.address.address}
                      <br />
                      {[order.address.city, order.address.region].filter(Boolean).join(", ")}
                      {order.address.country && <><br />{order.address.country}</>}
                    </address>
                  </div>
                )}
                <div>
                  <h3 className="eyebrow mb-2">Payment</h3>
                  <dl className="space-y-1.5 text-[14px]">
                    <div className="flex justify-between text-ink-soft">
                      <dt>Method</dt>
                      <dd className="text-ink">{order.paymentMethod}</dd>
                    </div>
                    {order.subtotal != null && (
                      <div className="flex justify-between text-ink-soft">
                        <dt>Subtotal</dt>
                        <dd className="text-ink">{formatCedis(order.subtotal)}</dd>
                      </div>
                    )}
                    {order.deliveryFee != null && (
                      <div className="flex justify-between text-ink-soft">
                        <dt>Delivery</dt>
                        <dd className="text-ink">{formatCedis(order.deliveryFee)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-line pt-2 font-medium text-ink">
                      <dt>Total</dt>
                      <dd>{formatCedis(order.totalAmount)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function MyOrders() {
  const searchParams = useSearchParams();
  const justPlaced = searchParams.get("placed") === "1";

  const [reloadKey, setReloadKey] = useState(0);
  // Result of the last finished request, tagged with the request it answers
  const [loaded, setLoaded] = useState({ key: null, orders: [], error: false });
  const status = loaded.key === reloadKey ? (loaded.error ? "error" : "ready") : "loading";

  // Only the signed-in customer's orders, with line items resolved server-side
  useEffect(() => {
    const controller = new AbortController();
    axios
      .get("/api/my-orders", { signal: controller.signal })
      .then(({ data }) => setLoaded({ key: reloadKey, orders: data.orders || [], error: false }))
      .catch((error) => {
        // 401: AccountShell is sending the visitor to login - keep the skeleton
        if (axios.isCancel(error) || error?.response?.status === 401) return;
        console.error("Failed to fetch orders:", error);
        setLoaded({ key: reloadKey, orders: [], error: true });
      });
    return () => controller.abort();
  }, [reloadKey]);

  const orders = loaded.orders;

  return (
    <>
      <AccountPageHeader
        title="My orders"
        description={status === "ready" && orders.length > 0 ? `${orders.length} ${orders.length === 1 ? "order" : "orders"}, newest first` : "Track and review everything you've ordered."}
      />

      {justPlaced && (
        <p role="status" className="mb-6 flex animate-rise items-start gap-3 rounded-field border border-success/15 bg-success-tint px-4 py-3.5 text-[15px] text-success">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          Thank you, your order has been placed. You&apos;ll find it below.
        </p>
      )}

      {status === "loading" ? (
        <OrdersSkeleton />
      ) : status === "error" ? (
        <ErrorState
          title="Your orders didn't load."
          message="Please check your connection and try again."
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          message="When you place an order, you'll be able to follow it here."
          actionLabel="Start shopping"
          actionHref="/shop"
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </ul>
      )}
    </>
  );
}
