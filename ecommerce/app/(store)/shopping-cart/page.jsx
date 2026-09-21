"use client";

import { useEcommerce } from "@/context/EcommerceContextProvider";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function MyShoppingCart() {
  const {
    addItems,
    totalAmount,
    handleAddToCart,
    handleRemoveFromCart,
    deleteItemFromCart,
    isLoggedIn,
    products,
  } = useEcommerce();

  const [cartData, setCartData] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoggedIn) {
        router.replace("/login?redirect=/shopping-cart");
      } else {
        setAuthChecked(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isLoggedIn, router]);

  useEffect(() => {
    const savedCart = [];

    for (const productId in addItems) {
      for (const size in addItems[productId]) {
        const product = products.find(
          (item) => String(item._id) === String(productId),
        );

        if (product) {
          savedCart.push({
            _id: productId,
            size,
            quantity: addItems[productId][size],
          });
        }
      }
    }

    setCartData(savedCart);
  }, [addItems, products]);

  const shipping = cartData.length > 0 ? 25 : 0;
  const subtotal = totalAmount || 0;
  const total = subtotal + shipping;

  if (!authChecked) {
    return (
      <section className="min-h-screen bg-[#F5F1EA] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-11 h-11 rounded-full border-4 border-[#1C1A17]/15 border-t-[#1C1A17] animate-spin" />
          <p className="font-utility text-sm text-[#8A6A52]">
            Loading your cart…
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#F5F1EA] py-8 sm:py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-7 flex items-center gap-2 text-sm font-utility text-[#8A6A52]">
          <Link href="/" className="hover:text-[#1C1A17] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-medium text-[#1C1A17]">Shopping Cart</span>
        </nav>

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8A6A52]">
              Your selection
            </p>
            <h1 className="font-editorial text-4xl text-[#1C1A17] sm:text-5xl">
              Shopping Cart
            </h1>
          </div>

          <p className="font-utility text-sm text-[#8A6A52]">
            {cartData.length === 0
              ? "No items in your cart"
              : `${cartData.length} ${
                  cartData.length === 1 ? "item" : "items"
                } in your cart`}
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-10">
          <main className="overflow-hidden rounded-2xl border border-[#1C1A17]/5 bg-white shadow-[0_12px_35px_rgba(28,26,23,0.06)]">
            {cartData.length > 0 && (
              <div className="hidden grid-cols-[minmax(0,1fr)_105px_130px_105px_40px] items-center gap-4 border-b border-[#1C1A17]/10 bg-[#F5F1EA]/60 px-6 py-4 md:grid">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#8A6A52]">
                  Product
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#8A6A52]">
                  Price
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#8A6A52]">
                  Quantity
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#8A6A52]">
                  Total
                </span>
              </div>
            )}

            <AnimatePresence initial={false}>
              {cartData.length > 0 ? (
                <div className="divide-y divide-[#1C1A17]/10">
                  {cartData.map((cart) => {
                    const product = products.find(
                      (item) => String(item._id) === String(cart._id),
                    );

                    if (!product) return null;

                    const qty = cart.quantity;
                    const lineTotal = product.price * qty;

                    return (
                      <motion.article
                        key={`${cart._id}-${cart.size}`}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.25 }}
                        className="relative grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_105px_130px_105px_40px] md:items-center md:gap-4"
                      >
                        <div className="flex min-w-0 gap-4">
                          <Link
                            href={`/shop/${cart._id}`}
                            className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F5F1EA]"
                          >
                            <Image
                              src={product.images?.[0]}
                              alt={product.name}
                              fill
                              sizes="80px"
                              className="object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </Link>

                          <div className="flex min-w-0 flex-1 flex-col justify-center">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#8A6A52]">
                              {product.category || "Product"}
                            </p>

                            <Link
                              href={`/shop/${cart._id}`}
                              className="line-clamp-2 font-editorial text-xl leading-tight text-[#1C1A17] transition-colors hover:text-[#8A6A52]"
                            >
                              {product.name}
                            </Link>

                            <div className="mt-3 inline-flex w-fit items-center rounded-full bg-[#F5F1EA] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1C1A17]">
                              Size: {cart.size}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:block">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#8A6A52] md:hidden">
                            Price
                          </span>
                          <p className="font-utility text-sm font-medium text-[#1C1A17]">
                            GH₵{product.price.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center justify-between md:block">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#8A6A52] md:hidden">
                            Quantity
                          </span>

                          <div className="flex w-fit items-center rounded-full border border-[#1C1A17]/15 bg-[#F5F1EA]/50 p-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveFromCart(cart._id, cart.size)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[#1C1A17] transition-colors hover:bg-white"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span className="w-9 text-center font-utility text-sm font-semibold text-[#1C1A17]">
                              {qty}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                handleAddToCart(cart._id, cart.size)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C1A17] text-[#F5F1EA] transition-transform hover:scale-105"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:block">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#8A6A52] md:hidden">
                            Total
                          </span>
                          <p className="font-utility text-sm font-bold text-[#1C1A17]">
                            GH₵{lineTotal.toLocaleString()}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            deleteItemFromCart(cart._id, cart.size)
                          }
                          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-[#8A6A52] transition-colors hover:bg-red-50 hover:text-red-600 md:static"
                          aria-label={`Remove ${product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.article>
                    );
                  })}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex min-h-[430px] flex-col items-center justify-center px-6 text-center"
                >
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F5F1EA]">
                    <ShoppingBag className="h-8 w-8 text-[#8A6A52]" />
                  </div>

                  <h2 className="font-editorial text-3xl text-[#1C1A17]">
                    Your cart is waiting
                  </h2>

                  <p className="mt-3 max-w-sm font-utility text-sm leading-6 text-[#8A6A52]">
                    Find something special and it will appear here when you add
                    it to your cart.
                  </p>

                  <Link
                    href="/shop"
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#1C1A17] px-6 py-3.5 font-utility text-sm font-medium text-[#F5F1EA] transition-transform hover:-translate-y-0.5"
                  >
                    Explore products
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <aside className="overflow-hidden rounded-2xl border border-[#1C1A17]/5 bg-white shadow-[0_12px_35px_rgba(28,26,23,0.06)] lg:sticky lg:top-24">
            <div className="border-b border-[#1C1A17]/10 px-6 py-5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8A6A52]">
                Checkout
              </p>
              <h2 className="font-editorial text-3xl text-[#1C1A17]">
                Order Summary
              </h2>
            </div>

            <div className="space-y-4 px-6 py-6 font-utility text-sm">
              <div className="flex items-center justify-between text-[#4A463F]">
                <span>Subtotal</span>
                <span className="font-medium text-[#1C1A17]">
                  {subtotal.toLocaleString("en-GH", {
                    style: "currency",
                    currency: "GHS",
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#4A463F]">
                <span>Delivery</span>
                <span className="font-medium text-[#1C1A17]">
                  {shipping === 0
                    ? "—"
                    : shipping.toLocaleString("en-GH", {
                        style: "currency",
                        currency: "GHS",
                      })}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-[#1C1A17]/10 pt-4 text-base">
                <span className="font-semibold text-[#1C1A17]">Total</span>
                <span className="font-bold text-[#1C1A17]">
                  {total.toLocaleString("en-GH", {
                    style: "currency",
                    currency: "GHS",
                  })}
                </span>
              </div>
            </div>

            <div className="border-t border-[#1C1A17]/10 px-6 py-5">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={cartData.length === 0}
                onClick={() => {
                  if (!isLoggedIn) {
                    router.push("/login?redirect=/checkout");
                    return;
                  }

                  router.push("/checkout");
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1C1A17] py-4 font-utility text-sm font-medium text-[#F5F1EA] transition-colors hover:bg-[#332F29] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </motion.button>

              <Link
                href="/shop"
                className="mt-5 block text-center font-utility text-sm text-[#8A6A52] underline underline-offset-4 transition-colors hover:text-[#1C1A17]"
              >
                Continue shopping
              </Link>
            </div>

            <div className="grid grid-cols-2 border-t border-[#1C1A17]/10 bg-[#F5F1EA]/45">
              <div className="flex items-center gap-2 px-5 py-4 text-xs text-[#8A6A52]">
                <ShieldCheck className="h-4 w-4 text-[#1C1A17]" />
                Secure checkout
              </div>

              <div className="flex items-center gap-2 border-l border-[#1C1A17]/10 px-5 py-4 text-xs text-[#8A6A52]">
                <Truck className="h-4 w-4 text-[#1C1A17]" />
                Fast delivery
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
