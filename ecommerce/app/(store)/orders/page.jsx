"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ShoppingBag, Clock } from "lucide-react";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import { products } from "@/data/images/data";
import EmptyCheckout from "@/ui/EmptyCheckout";

export default function MyOrders() {
  const { address, addItems } = useEcommerce();
  const [ordersData, setOrdersData] = useState([]);

  /* Build placeholder orders from the current cart until backend is wired */
  useEffect(() => {
    const saveOrders = [];

    for (const productId in addItems) {
      for (const size in addItems[productId]) {
        const qty = addItems[productId][size];
        if (qty <= 0) continue;

        const product = products.find((p) => p._id === productId);
        if (product) {
          saveOrders.push({
            _id: productId,
            name: product.name,
            image: product.images?.[0] || null,
            price: product.offerPrice || product.price,
            size,
            quantity: qty,
          });
        }
      }
    }

    setOrdersData(saveOrders);
  }, [addItems]);

  const formatPrice = (n) =>
    `GH₵${Number(n || 0).toLocaleString("en-GH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;

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
          {ordersData.length} {ordersData.length === 1 ? "item" : "items"}
        </p>
      </div>

      {/* Status strip */}
      <div className="flex items-center gap-3 mb-6 text-sm">
        <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="font-semibold text-[#1C1A17]">In your cart</p>
          <p className="text-xs text-[#8A6A52]">
            These are items ready to be ordered
          </p>
        </div>
      </div>

      {/* Orders list */}
      <div className="bg-white rounded-2xl border border-[#1C1A17]/5 shadow-[0_1px_2px_rgba(28,26,23,0.04)] overflow-hidden">
        <AnimatePresence initial={false}>
          {ordersData.map((item) => (
            <motion.div
              key={`${item._id}-${item.size}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-4 p-4 sm:p-5 border-b border-[#1C1A17]/5 last:border-0"
            >
              {/* Image */}
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

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1C1A17] line-clamp-2">
                  {item.name}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs text-[#8A6A52] bg-[#F7F4EE] px-2 py-0.5 rounded-md">
                    Size {item.size}
                  </span>
                  <span className="text-xs text-[#8A6A52]">
                    Qty × {item.quantity}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-[#1C1A17]">
                  {formatPrice(item.price * item.quantity)}
                </p>
                <p className="text-xs text-[#8A6A52] mt-0.5">
                  {formatPrice(item.price)} each
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
