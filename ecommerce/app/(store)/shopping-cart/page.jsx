"use client";

import { useEcommerce } from "@/context/EcommerceContextProvider";
import { products } from "@/data/images/data";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function MyShoppingCart() {
  const {
    addItems,
    totalAmount,
    handleAddToCart,
    handleRemoveFromCart,
    getItemQuantity,
    deleteItemFromCart, 
  } = useEcommerce();

  const [cartData, setCartData] = useState([]);
  const router = useRouter()

  useEffect(() => {
    const saveCart = [];
    for (const productId in addItems) {
      for (const size in addItems[productId]) {
        const findProduct = products.find((p) => p._id === productId);
        if (findProduct) {
          saveCart.push({
            _id: productId,
            size,
            quantity: addItems[productId][size],
          });
        }
      }
    }
    setCartData(saveCart);
  }, [addItems]);

  const shipping = cartData.length > 0 ? 25 : 0;
  const subtotal = totalAmount || 0;
  const total = subtotal + shipping;

  return (
    <section className="bg-[#F5F1EA] min-h-screen py-10 sm:py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="text-sm text-[#8A6A52] mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-[#1C1A17] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#1C1A17] font-medium">Cart</span>
        </nav>

        <h1 className="font-editorial text-3xl sm:text-4xl text-[#1C1A17] mb-10">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
          {/* LEFT — Cart items */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            {/* Header row (hidden on mobile) */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 pb-4 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-[#8A6A52]">
              <p>Product</p>
              <p>Price</p>
              <p>Quantity</p>
              <p>Subtotal</p>
              <p>Remove</p>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100">
              <AnimatePresence initial={false}>
                {cartData.length > 0 ? (
                  cartData.map((cart) => {
                    const product = products.find(
                      (item) => item._id === cart._id,
                    );
                    if (!product) return null;

                    // Use the value already stored in cartData
                    const qty = cart.quantity;
                    const lineTotal = product.price * qty;

                    return (
                      <motion.div
                        key={`${cart._id}-${cart.size}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.25 }}
                        className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 py-5 items-center"
                      >
                        {/* Product — image + name + size */}
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="relative w-20 h-24 shrink-0 rounded-md overflow-hidden bg-[#F5F1EA]">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col min-w-0 gap-1">
                            <p className="font-utility font-medium text-[#1C1A17] text-sm sm:text-base leading-snug line-clamp-2">
                              {product.name}
                            </p>
                            <p className="text-xs text-[#8A6A52] font-utility">
                              Size:{" "}
                              <span className="font-semibold text-[#1C1A17] uppercase tracking-wide">
                                {cart.size}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Price */}
                        <p className="text-[#1C1A17] font-utility text-sm">
                          GH₵{product.price.toLocaleString()}
                        </p>

                        {/* Quantity */}
                        <div className="flex items-center border border-gray-300 rounded-full w-fit">
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveFromCart(cart._id, cart.size)
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(cart._id, cart.size)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <p className="font-utility font-semibold text-[#1C1A17] text-sm">
                          GH₵{lineTotal.toLocaleString()}
                        </p>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() =>
                            deleteItemFromCart(cart._id, cart.size)
                          }
                          className="w-8 h-8 flex items-center justify-center text-[#8A6A52] hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 text-center flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#F5F1EA] flex items-center justify-center">
                      <ShoppingBag className="w-7 h-7 text-[#8A6A52]" />
                    </div>
                    <p className="font-editorial text-2xl text-[#1C1A17]">
                      Your cart is empty
                    </p>
                    <p className="text-sm text-[#8A6A52] max-w-xs">
                      Looks like you haven&apos;t added anything yet. Let&apos;s
                      change that.
                    </p>
                    <Link
                      href="/shop"
                      className="mt-2 inline-flex items-center gap-2 bg-[#1C1A17] text-[#F5F1EA] px-6 py-3 rounded-full text-sm font-medium hover:bg-[#332F29] transition-colors"
                    >
                      Continue Shopping
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT — Order summary */}
          <aside className="lg:sticky lg:top-24 h-fit bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-editorial text-2xl text-[#1C1A17] mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm font-utility">
              <div className="flex justify-between text-[#4A463F]">
                <span>Subtotal</span>
                <span className="font-medium text-[#1C1A17]">
                  {subtotal.toLocaleString("en-GH", {
                    style: "currency",
                    currency: "GHS",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-[#4A463F]">
                <span>Shipping</span>
                <span className="font-medium text-[#1C1A17]">
                  {shipping === 0
                    ? "—"
                    : shipping.toLocaleString("en-GH", {
                        style: "currency",
                        currency: "GHS",
                      })}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-base">
                <span className="font-semibold text-[#1C1A17]">Total</span>
                <span className="font-semibold text-[#1C1A17]">
                  {total.toLocaleString("en-GH", {
                    style: "currency",
                    currency: "GHS",
                  })}
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={cartData.length === 0}
              onClick={() => router.push("/checkout")}
              className="mt-6 w-full bg-[#1C1A17] text-[#F5F1EA] py-3.5 rounded-full font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#332F29] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <Link
              href="/shop"
              className="mt-4 block text-center text-sm text-[#8A6A52] hover:text-[#1C1A17] transition-colors underline underline-offset-4"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
