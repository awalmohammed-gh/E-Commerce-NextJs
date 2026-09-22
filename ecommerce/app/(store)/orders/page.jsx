"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ShoppingBag,
  MapPin,
  Clock,
  Check,
  X,
  Truck,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import EmptyCheckout from "@/ui/EmptyCheckout";
import axios from "axios";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import LoadingSpinner from "@/ui/LoadingSpinner";

/* ------------------------------------------------------------------
   Status
------------------------------------------------------------------ */
const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Processing: "bg-blue-50 text-blue-700 border-blue-200",
  Shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Delivered: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

/* Tracking steps (linear progression) */
const TRACKING_STEPS = [
  { key: "Pending", label: "Order placed", icon: Sparkles },
  { key: "Processing", label: "Processing", icon: Package },
  { key: "Shipped", label: "Shipped", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: PackageCheck },
];

/* Helper: where is the order currently in the sequence? */
const getStepIndex = (status) => {
  const idx = TRACKING_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
};

export default function MyOrders() {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { products } = useEcommerce();

  const handleFetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/orders");
      if (data.success) {
        setOrdersData(data.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchOrders();
  }, []);

  /* ---------------------------------------------------------
     Helpers
  --------------------------------------------------------- */
  const formatPrice = (n) =>
    `GH₵${Number(n || 0).toLocaleString("en-GH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-GH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const findProduct = (productId) =>
    products.find((p) => String(p._id) === String(productId));

  const computeOrderTotal = (order) => {
    if (!order?.items) return 0;

    let total = 0;

    Object.entries(order.items).forEach(([productId, sizes]) => {
      const product = findProduct(productId);
      if (!product) return;

      const unitPrice = product.offerPrice || product.price || 0;
      const qty = Object.values(sizes).reduce(
        (sum, q) => sum + (Number(q) || 0),
        0,
      );

      total += unitPrice * qty;
    });

    return total;
  };

  const flattenItems = (order) => {
    if (!order?.items) return [];

    return Object.entries(order.items).flatMap(([productId, sizes]) =>
      Object.entries(sizes)
        .filter(([, qty]) => qty > 0)
        .map(([size, qty]) => {
          const product = findProduct(productId);
          const price = product?.offerPrice || product?.price || 0;

          return {
            key: `${order._id}-${productId}-${size}`,
            productId,
            size,
            qty,
            price,
            name: product?.name || productId,
            image: product?.images?.[0] || null,
          };
        }),
    );
  };

  const getOrderTotal = (order) =>
    order.total ?? order.totalAmount ?? computeOrderTotal(order);

  /* ---------------------------------------------------------
     Loading
  --------------------------------------------------------- */
  if (loading) {
    return <LoadingSpinner />;
  }

  /* ---------------------------------------------------------
     Empty
  --------------------------------------------------------- */
  if (ordersData.length === 0) {
    return (
      <EmptyCheckout
        icon={ShoppingBag}
        title="No orders yet"
        message="Once you place an order, it will show up here. Start exploring our collection."
        actionLabel="Browse the collection"
        actionHref="/shop"
      />
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 lg:py-14 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex items-baseline justify-between gap-4 border-b border-[#1C1A17]/10 pb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8A6A52]">
            Account
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-[#1C1A17] leading-none mt-2">
            My Orders
          </h1>
        </div>
        <p className="text-sm text-[#8A6A52] hidden sm:block">
          {ordersData.length} {ordersData.length === 1 ? "order" : "orders"}
        </p>
      </div>

      {/* Status strip */}
      <div className="flex items-center gap-3 mb-6 text-sm">
        <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="font-semibold text-[#1C1A17]">Your orders</p>
          <p className="text-xs text-[#8A6A52]">
            Track the status of each order below
          </p>
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {ordersData.map((order) => {
            const items = flattenItems(order);
            const status = order.orderStatus || "Pending";
            const statusClass = STATUS_STYLES[status] || STATUS_STYLES.Pending;
            const orderTotal = getOrderTotal(order);
            const isCancelled = status === "Cancelled";
            const currentStep = getStepIndex(status);

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-[#1C1A17]/5 shadow-[0_1px_2px_rgba(28,26,23,0.04)] p-4 sm:p-5"
              >
                {/* Order header */}
                <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-[#1C1A17]/8">
                  <div className="min-w-0">
                    <p className="text-xs text-[#8A6A52]">
                      Order #{String(order._id).slice(-8)}
                    </p>
                    <p className="text-xs text-[#8A6A52] mt-0.5">
                      {formatDate(order.createdAt)}
                    </p>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {order.paymentMethod && (
                        <span className="text-xs text-[#4A463F]">
                          {order.paymentMethod}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusClass}`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>

                  <p className="text-lg font-semibold text-[#1C1A17] shrink-0">
                    {formatPrice(orderTotal)}
                  </p>
                </div>

                {/* Tracking timeline */}
                <div className="mb-4 pb-4 border-b border-[#1C1A17]/8">
                  {isCancelled ? (
                    /* Cancelled state */
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-red-50 border border-red-100">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <X className="w-4 h-4" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-red-700">
                          Order cancelled
                        </p>
                        <p className="text-xs text-red-600/80 mt-0.5">
                          This order is no longer being processed.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Progress steps */
                    <div className="flex items-center">
                      {TRACKING_STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isComplete = idx < currentStep;
                        const isCurrent = idx === currentStep;
                        const isUpcoming = idx > currentStep;

                        return (
                          <div
                            key={step.key}
                            className="flex items-center flex-1 min-w-0 last:flex-none"
                          >
                            {/* Step node */}
                            <div className="flex flex-col items-center shrink-0">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                  isComplete
                                    ? "bg-[#1C1A17] text-[#F5F1EA]"
                                    : isCurrent
                                      ? "bg-[#D98880] text-white ring-4 ring-[#D98880]/15"
                                      : "bg-[#F7F4EE] text-[#8A6A52] border border-[#1C1A17]/10"
                                }`}
                              >
                                {isComplete ? (
                                  <Check
                                    className="w-3.5 h-3.5"
                                    strokeWidth={3}
                                  />
                                ) : (
                                  <Icon className="w-3.5 h-3.5" />
                                )}
                              </div>

                              <p
                                className={`mt-2 text-[10px] text-center whitespace-nowrap ${
                                  isCurrent
                                    ? "text-[#1C1A17] font-semibold"
                                    : isComplete
                                      ? "text-[#4A463F] font-medium"
                                      : "text-[#8A6A52]"
                                }`}
                              >
                                {step.label}
                              </p>
                            </div>

                            {/* Connecting line */}
                            {idx < TRACKING_STEPS.length - 1 && (
                              <div className="flex-1 h-0.5 mx-1 mt-[-20px] bg-[#1C1A17]/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#1C1A17] transition-all duration-500"
                                  style={{
                                    width: idx < currentStep ? "100%" : "0%",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <p className="text-sm text-[#8A6A52]">
                      No items in this order.
                    </p>
                  ) : (
                    items.map((item) => (
                      <div key={item.key} className="flex items-center gap-4">
                        <div className="relative w-16 h-20 shrink-0 rounded-xl overflow-hidden bg-[#F7F4EE] border border-[#1C1A17]/5">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-[#8A6A52]" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1C1A17] line-clamp-2">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs text-[#8A6A52] bg-[#F7F4EE] px-2 py-0.5 rounded-md">
                              Size {item.size}
                            </span>
                            <span className="text-xs text-[#8A6A52]">
                              Qty × {item.qty}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-[#1C1A17]">
                            {item.price > 0
                              ? formatPrice(item.price * item.qty)
                              : "—"}
                          </p>
                          {item.price > 0 && (
                            <p className="text-xs text-[#8A6A52] mt-0.5">
                              {formatPrice(item.price)} each
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Delivery address */}
                {order.address && (
                  <div className="mt-4 pt-4 border-t border-[#1C1A17]/8 text-xs text-[#4A463F] flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#8A6A52] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1C1A17]">
                        {order.address.fullName}
                      </p>
                      {order.address.phone && (
                        <p className="text-[#8A6A52]">{order.address.phone}</p>
                      )}
                      <p className="line-clamp-2 mt-0.5">
                        {order.address.address}
                        {order.address.city && `, ${order.address.city}`}
                        {order.address.region && `, ${order.address.region}`}
                        {order.address.country && `, ${order.address.country}`}
                        {order.address.postalCode &&
                          ` ${order.address.postalCode}`}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
