"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ShoppingBag, MapPin, Clock } from "lucide-react";
import { products } from "@/data/images/data";
import EmptyCheckout from "@/ui/EmptyCheckout";
import axios from "axios";

export default function MyOrders() {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleFetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/orders");
      if (data.success) {
        setOrdersData(data.orders);
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

  /* Loading state */
  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-8 lg:py-14 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-20 text-sm text-[#8A6A52]">
          Loading orders…
        </div>
      </div>
    );
  }

  /* Empty state */
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
            {ordersData.length} {ordersData.length === 1 ? "order" : "orders"}{" "}
            placed
          </p>
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {ordersData.map((order) => (
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
                    Order #{order._id?.slice(-8)}
                  </p>
                  <p className="text-xs text-[#8A6A52] mt-0.5">
                    {formatDate(order.createdAt)}
                  </p>
                  <p className="text-sm font-semibold text-[#1C1A17] mt-1.5">
                    {order.paymentMethod} ·{" "}
                    <span className="text-[#8A6A52] font-normal">
                      {order.orderStatus || "Processing"}
                    </span>
                  </p>
                </div>
                <p className="text-lg font-semibold text-[#1C1A17] shrink-0">
                  {formatPrice(order.totalAmount ?? 0)}
                </p>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {Object.entries(order.items || {}).flatMap(
                  ([productId, sizes]) =>
                    Object.entries(sizes)
                      .filter(([, qty]) => qty > 0)
                      .map(([size, qty]) => {
                        const product = products.find(
                          (p) => String(p._id || p.id) === String(productId),
                        );
                        const price = product?.price || 0;

                        return (
                          <div
                            key={`${order._id}-${productId}-${size}`}
                            className="flex items-center gap-4"
                          >
                            <div className="relative w-16 h-20 shrink-0 rounded-xl overflow-hidden bg-[#F7F4EE] border border-[#1C1A17]/5">
                              {product?.images ? (
                                <Image
                                  src={product.images}
                                  alt={product.name}
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
                                {product?.name || productId}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="text-xs text-[#8A6A52] bg-[#F7F4EE] px-2 py-0.5 rounded-md">
                                  Size {size}
                                </span>
                                <span className="text-xs text-[#8A6A52]">
                                  Qty × {qty}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold text-[#1C1A17]">
                                {formatPrice(price * qty)}
                              </p>
                              {price > 0 && (
                                <p className="text-xs text-[#8A6A52] mt-0.5">
                                  {formatPrice(price)} each
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }),
                )}
              </div>

              {/* Delivered-to snapshot */}
              {order.address && (
                <div className="mt-4 pt-4 border-t border-[#1C1A17]/8 text-xs text-[#4A463F] flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#8A6A52] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1C1A17]">
                      {order.address.fullName}
                    </p>
                    <p className="line-clamp-2">
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
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
