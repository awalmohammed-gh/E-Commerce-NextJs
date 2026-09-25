"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import ProductImage from "@/components/card/ProductImage";
import { EmptyState } from "@/components/ui/States";
import Toast from "@/ui/Toast";
import { formatCedis } from "@/lib/formatCurrency";

function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]" aria-busy="true" aria-label="Loading your bag">
      <div className="divide-y divide-line border-y border-line">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-4 py-6">
            <div className="skeleton h-32 w-26 shrink-0 rounded-field" />
            <div className="flex-1 space-y-2.5 pt-1">
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-3.5 w-20" />
              <div className="skeleton mt-6 h-10 w-32 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="skeleton h-64 rounded-card" />
    </div>
  );
}

export default function ShoppingCartPage() {
  const { cart, cartLoading, updateItemQuantity, deleteItemFromCart, isLoggedIn, authChecked } = useEcommerce();
  const router = useRouter();
  const [pendingLine, setPendingLine] = useState(null);

  const [toast, setToast] = useState({ message: "", success: false, error: false });
  const clearToast = useCallback(() => setToast({ message: "", success: false, error: false }), []);

  // The bag belongs to an account: wait for the auth check, then send guests to login
  useEffect(() => {
    if (authChecked && !isLoggedIn) router.replace("/login?redirect=/shopping-cart");
  }, [authChecked, isLoggedIn, router]);

  // Lines, prices and totals all come from the server (/api/cart)
  const lines = cart.items;
  const hasIssues = cart.issues.length > 0;

  const changeQuantity = async (item, quantity) => {
    const key = `${item.productId}-${item.size}`;
    setPendingLine(key);
    const result =
      quantity <= 0
        ? await deleteItemFromCart(item.productId, item.size)
        : await updateItemQuantity(item.productId, item.size, quantity);
    setPendingLine(null);
    if (!result.success) setToast({ message: result.message, success: false, error: true });
  };

  const loading = !authChecked || !isLoggedIn || cartLoading;
  const itemLabel = `${cart.itemCount} ${cart.itemCount === 1 ? "item" : "items"}`;

  return (
    <div className="page-x pt-8 pb-32 sm:pt-12 lg:pb-24">
      <header className="mb-8 flex items-end justify-between gap-4 border-b border-line pb-6 sm:mb-10">
        <div>
          <p className="kicker mb-3">Shopping bag</p>
          <h1 className="heading-display text-[44px] sm:text-[64px]">Your bag</h1>
        </div>
        {!loading && lines.length > 0 && (
          <p className="pb-2 text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">{itemLabel}</p>
        )}
      </header>

      {loading ? (
        <CartSkeleton />
      ) : lines.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          message="When you add something, it will be waiting for you here."
          actionLabel="Start shopping"
          actionHref="/shop"
          secondary={
            <Link href="/account/wishlist" className="link text-[15px]">
              View your wishlist
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-16">
          {/* Lines */}
          <section aria-label="Items in your bag">
            {hasIssues && (
              <p role="alert" className="alert-error mb-5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                Some items have changed since you added them. Update or remove them to continue.
              </p>
            )}

            <ul className="divide-y divide-line border-y border-line">
              <AnimatePresence initial={false}>
                {lines.map((item) => {
                  const key = `${item.productId}-${item.size}`;
                  const pending = pendingLine === key;
                  const removed = !item.name;
                  const href = `/product/${item.productId}`;
                  const atStockLimit = item.stock !== undefined && item.quantity >= item.stock;

                  return (
                    <motion.li
                      key={key}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: pending ? 0.55 : 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-4 py-6 sm:gap-6 sm:py-7"
                    >
                      <Link
                        href={href}
                        tabIndex={-1}
                        aria-hidden="true"
                        className="group relative h-32 w-26 shrink-0 overflow-hidden rounded-field bg-sand sm:h-40 sm:w-32"
                      >
                        <ProductImage src={item.image} alt="" sizes="128px" className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105" />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            {removed ? (
                              <p className="text-[15px] text-muted">This product is no longer available</p>
                            ) : (
                              <h2 className="font-display text-[20px] leading-tight text-ink sm:text-[24px]">
                                <Link href={href} className="decoration-terracotta/50 underline-offset-4 hover:underline">
                                  {item.name}
                                </Link>
                              </h2>
                            )}
                            <p className="mt-1 text-[13px] text-muted">
                              {item.size !== "default" && <>Size {item.size} &middot; </>}
                              {removed ? "—" : `${formatCedis(item.unitPrice)} each`}
                            </p>
                          </div>
                          <p className="shrink-0 text-[15px] font-semibold text-ink tabular-nums">
                            {removed ? "—" : formatCedis(item.lineTotal)}
                          </p>
                        </div>

                        {item.issue && (
                          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-danger">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {item.issue}
                          </p>
                        )}

                        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                          <div
                            className="flex h-10 items-center rounded-full border border-line bg-white px-0.5"
                            role="group"
                            aria-label={`Quantity of ${item.name || "item"}`}
                          >
                            <button
                              type="button"
                              onClick={() => changeQuantity(item, item.quantity - 1)}
                              disabled={pending}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream disabled:opacity-30"
                              aria-label={item.quantity <= 1 ? "Remove item" : "Decrease quantity"}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-[14px] font-medium tabular-nums" aria-live="polite">
                              {pending ? (
                                <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" aria-label="Updating" />
                              ) : (
                                // The new number eases in when the quantity changes
                                <motion.span
                                  key={item.quantity}
                                  className="inline-block"
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.18, ease: "easeOut" }}
                                >
                                  {item.quantity}
                                </motion.span>
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => changeQuantity(item, item.quantity + 1)}
                              disabled={pending || removed || atStockLimit}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream disabled:opacity-30"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => changeQuantity(item, 0)}
                            disabled={pending}
                            className="min-h-10 px-1 text-[13px] text-muted underline decoration-muted/40 underline-offset-4 transition-colors hover:text-danger hover:decoration-danger"
                            aria-label={`Remove ${item.name || "item"} from bag`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>

            <Link href="/shop" className="link mt-6 inline-block text-[15px] font-medium">
              Continue shopping
            </Link>
          </section>

          {/* Summary */}
          <aside className="rounded-card bg-cream p-6 sm:p-7 lg:sticky lg:top-28" aria-labelledby="summary-title">
            <h2 id="summary-title" className="font-display text-[28px] leading-none">
              Order summary
            </h2>
            <dl className="mt-5 space-y-3 text-[15px]">
              <div className="flex justify-between text-ink-soft">
                <dt>Subtotal ({itemLabel})</dt>
                <dd className="text-ink">{formatCedis(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-ink-soft">
                <dt>Delivery</dt>
                <dd className="text-ink">{formatCedis(cart.deliveryFee)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-4">
                <dt className="font-medium text-ink">Total</dt>
                <dd className="text-2xl font-semibold text-ink tabular-nums">{formatCedis(cart.total)}</dd>
              </div>
            </dl>

            <button
              type="button"
              disabled={hasIssues}
              onClick={() => router.push("/checkout")}
              className="btn-accent mt-6 hidden min-h-13 w-full lg:flex"
            >
              Go to checkout
            </button>
            <p className="mt-4 text-center text-[13px] text-muted">
              Card, Mobile Money or cash on delivery
            </p>
          </aside>
        </div>
      )}

      {/* Phones and tablets: total and checkout always within reach */}
      {!loading && lines.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-90 border-t border-line/70 bg-paper/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl backdrop-saturate-150 lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-4">
            <div className="min-w-0">
              <p className="text-[12px] text-muted">Total</p>
              <p className="text-lg font-semibold text-ink tabular-nums">{formatCedis(cart.total)}</p>
            </div>
            <button
              type="button"
              disabled={hasIssues}
              onClick={() => router.push("/checkout")}
              className="btn-accent min-h-12 flex-1"
            >
              Checkout
            </button>
          </div>
        </div>
      )}

      <div className="toast-region bottom-24 lg:bottom-6">
        <Toast success={toast.success} error={toast.error} message={toast.message} onClose={clearToast} />
      </div>
    </div>
  );
}
