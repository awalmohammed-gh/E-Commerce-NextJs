"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AlertCircle, Banknote, Check, CreditCard, Loader2, Lock, Pencil, Plus, ShoppingBag, Smartphone } from "lucide-react";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import AddressModal from "@/components/modals/AddressModal";
import { AddressLines } from "@/components/address/AddressCard";
import ProductImage from "@/components/card/ProductImage";
import { EmptyState } from "@/components/ui/States";
import Toast from "@/ui/Toast";
import { formatCedis } from "@/lib/formatCurrency";

const PAYMENT_METHODS = [
  { id: "Mobile Money", label: "Mobile Money", description: "MTN, Telecel, AirtelTigo", icon: Smartphone },
  { id: "Card", label: "Card", description: "Visa or Mastercard", icon: CreditCard },
  { id: "Cash On Delivery", label: "Cash on delivery", description: "Pay when your order arrives", icon: Banknote },
];

function Step({ number, title, aside, children, error }) {
  return (
    <section className="border-t border-line py-8 first:border-t-0 first:pt-0" aria-labelledby={`step-${number}`}>
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 id={`step-${number}`} className="flex items-baseline gap-3 font-display text-2xl text-ink sm:text-[28px]">
          <span className="text-[13px] font-sans font-medium text-muted">{number}</span>
          {title}
        </h2>
        {aside}
      </div>
      {error && (
        <p role="alert" className="mb-4 flex items-center gap-2 text-[14px] text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {children}
    </section>
  );
}

// A selectable row (address or payment) styled as a radio
function Choice({ selected, onSelect, children, name }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3.5 rounded-[3px] border bg-white p-4 transition-colors ${
        selected ? "border-ink" : "border-line hover:border-ink/40"
      }`}
    >
      <input type="radio" name={name} checked={selected} onChange={onSelect} className="peer sr-only" />
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink ${
          selected ? "border-ink bg-ink text-cream" : "border-ink/30"
        }`}
        aria-hidden="true"
      >
        {selected && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_400px]" aria-busy="true" aria-label="Loading checkout">
      <div className="space-y-4">
        <div className="skeleton h-7 w-48" />
        <div className="skeleton h-28" />
        <div className="skeleton mt-8 h-7 w-40" />
        <div className="skeleton h-16" />
        <div className="skeleton h-16" />
      </div>
      <div className="skeleton h-80" />
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    user,
    isLoggedIn,
    authChecked,
    addresses,
    defaultAddress,
    addressesLoading,
    cart,
    cartLoading,
    refreshCart,
  } = useEcommerce();

  const [placing, setPlacing] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  // Address chosen for THIS order only - the saved default is untouched
  const [chosenAddressId, setChosenAddressId] = useState(null);
  const [choosingAddress, setChoosingAddress] = useState(false);

  const [toast, setToast] = useState({ message: "", success: false, error: false });
  const showError = (message) => setToast({ message, success: false, error: true });
  const clearToast = useCallback(() => setToast({ message: "", success: false, error: false }), []);

  // Checkout needs an account: send guests to login and back again
  useEffect(() => {
    if (authChecked && !isLoggedIn) router.replace("/login?redirect=/checkout");
  }, [authChecked, isLoggedIn, router]);

  // Display only: the server recalculates everything when the order is placed
  const hasIssues = cart.issues.length > 0;

  // The customer's pick for this order, falling back to their saved default
  // (also covers a chosen address that was since deleted)
  const selectedAddress = addresses.find((a) => a._id === chosenAddressId) || defaultAddress || null;

  const openNewAddress = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  // A newly added address is used for this order straight away
  const handleAddressSaved = (addr) => {
    if (addr?._id && !editingAddress) {
      setChosenAddressId(addr._id);
      setChoosingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    setAttempted(true);
    if (!selectedAddress || !paymentMethod || hasIssues || cart.itemCount === 0) {
      showError(
        !selectedAddress
          ? "Add a delivery address to continue."
          : !paymentMethod
            ? "Choose how you'd like to pay."
            : "Some items in your bag need attention.",
      );
      return;
    }

    try {
      setPlacing(true);
      // Items, prices and totals come from the saved cart on the server;
      // the server looks the address up by id in the user's own addresses
      const { data } = await axios.post("/api/checkout", {
        addressId: selectedAddress._id,
        paymentMethod,
      });

      if (data.success) {
        await refreshCart();
        router.push("/orders?placed=1");
      } else {
        showError(data.message || "We couldn't place your order. Please try again.");
      }
    } catch (err) {
      showError(err?.response?.data?.message || "We couldn't place your order. Please try again.");
      // Stock or prices changed - show the updated cart
      if (err?.response?.status === 409) refreshCart();
    } finally {
      setPlacing(false);
    }
  };

  const loading = !authChecked || !isLoggedIn || cartLoading;

  if (!loading && cart.itemCount === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Nothing to check out yet"
        message="Your bag is empty. Add a few pieces and come back here to place your order."
        actionLabel="Continue shopping"
        actionHref="/shop"
      />
    );
  }

  const placeButton = (className) => (
    <button
      type="button"
      onClick={handlePlaceOrder}
      disabled={placing || hasIssues}
      className={`btn-primary min-h-12 ${className}`}
    >
      {placing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Lock className="h-3.5 w-3.5" aria-hidden="true" />}
      {placing ? "Placing order" : `Place order · ${formatCedis(cart.total)}`}
    </button>
  );

  return (
    <div className="page-x pt-8 pb-32 sm:pt-12 lg:pb-24">
      <header className="mb-8 flex items-end justify-between gap-4 border-b border-line pb-5 sm:mb-10">
        <h1 className="heading-display text-4xl sm:text-5xl">Checkout</h1>
        <Link href="/shopping-cart" className="link text-[14px] text-ink-soft">
          Back to bag
        </Link>
      </header>

      {loading ? (
        <CheckoutSkeleton />
      ) : (
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-16">
          <div>
            {/* 1. Delivery */}
            <Step
              number="1"
              title="Delivery"
              error={attempted && !selectedAddress && !addressesLoading ? "Add a delivery address to continue." : null}
              aside={
                addresses.length > 1 && !choosingAddress ? (
                  <button type="button" onClick={() => setChoosingAddress(true)} className="link shrink-0 text-[14px]">
                    Change
                  </button>
                ) : null
              }
            >
              {user && (
                <p className="mb-4 text-[14px] text-muted">
                  Ordering as <span className="text-ink">{user.fullName}</span> &middot; {user.email}
                </p>
              )}

              {addressesLoading ? (
                <div className="skeleton h-28" />
              ) : !selectedAddress ? (
                <button
                  type="button"
                  onClick={openNewAddress}
                  className="flex min-h-20 w-full items-center justify-center gap-2 rounded-[3px] border border-dashed border-ink/30 text-[15px] text-ink transition-colors hover:border-ink"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add a delivery address
                </button>
              ) : choosingAddress ? (
                <div className="space-y-2.5" role="radiogroup" aria-label="Delivery address">
                  {addresses.map((addr) => (
                    <Choice
                      key={addr._id}
                      name="address"
                      selected={addr._id === selectedAddress._id}
                      onSelect={() => {
                        setChosenAddressId(addr._id);
                        setChoosingAddress(false);
                      }}
                    >
                      <span className="flex items-center gap-2 text-[15px] font-medium text-ink">
                        {addr.label}
                        {addr.isDefault && <span className="badge bg-cream px-1.5 py-0.5 text-muted">Default</span>}
                      </span>
                      <span className="mt-0.5 block truncate text-[14px] text-muted">
                        {addr.fullName} &middot; {addr.address}, {addr.city}
                      </span>
                    </Choice>
                  ))}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button type="button" onClick={openNewAddress} className="inline-flex min-h-10 items-center gap-1.5 text-[14px] text-ink link">
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      New address
                    </button>
                    <p className="text-[13px] text-muted">This choice applies to this order only.</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-[3px] border border-line bg-white p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] uppercase">
                      {selectedAddress.label}
                      {selectedAddress.isDefault && <span className="badge bg-cream px-1.5 py-0.5 text-muted">Default</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddress(selectedAddress);
                        setModalOpen(true);
                      }}
                      className="inline-flex min-h-9 items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </button>
                  </div>
                  <AddressLines address={selectedAddress} />
                  {addresses.length === 1 && (
                    <button type="button" onClick={openNewAddress} className="link mt-4 text-[14px]">
                      Deliver somewhere else
                    </button>
                  )}
                </div>
              )}
            </Step>

            {/* 2. Payment */}
            <Step number="2" title="Payment" error={attempted && !paymentMethod ? "Choose how you'd like to pay." : null}>
              <div className="space-y-2.5" role="radiogroup" aria-label="Payment method">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Choice
                      key={method.id}
                      name="payment"
                      selected={paymentMethod === method.id}
                      onSelect={() => setPaymentMethod(method.id)}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span>
                          <span className="block text-[15px] font-medium text-ink">{method.label}</span>
                          <span className="block text-[14px] text-muted">{method.description}</span>
                        </span>
                        <Icon className="h-5 w-5 shrink-0 text-taupe" strokeWidth={1.5} aria-hidden="true" />
                      </span>
                    </Choice>
                  );
                })}
              </div>
            </Step>

            {/* 3. Review */}
            <Step
              number="3"
              title="Review items"
              error={hasIssues ? "Some items are unavailable or exceed the stock left." : null}
              aside={
                <Link href="/shopping-cart" className="link shrink-0 text-[14px]">
                  Edit bag
                </Link>
              }
            >
              <ul className="divide-y divide-line">
                {cart.items.map((item) => (
                  <li key={`${item.productId}-${item.size}`} className="flex items-center gap-4 py-3.5 first:pt-0">
                    <span className="relative h-20 w-15 shrink-0 overflow-hidden rounded-xs bg-sand">
                      <ProductImage src={item.image} alt="" sizes="60px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] text-ink">{item.name || "Unavailable product"}</span>
                      <span className="block text-[13px] text-muted">
                        {item.size !== "default" && <>Size {item.size} &middot; </>}Qty {item.quantity}
                      </span>
                      {item.issue && <span className="block text-[13px] text-danger">{item.issue}</span>}
                    </span>
                    <span className="shrink-0 text-[15px] text-ink">
                      {item.lineTotal != null ? formatCedis(item.lineTotal) : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </Step>
          </div>

          {/* Summary */}
          <aside className="panel p-6 lg:sticky lg:top-28" aria-labelledby="checkout-summary">
            <h2 id="checkout-summary" className="text-[13px] font-medium tracking-[0.08em] uppercase">
              Order summary
            </h2>
            <dl className="mt-5 space-y-3 text-[15px]">
              <div className="flex justify-between text-ink-soft">
                <dt>
                  Subtotal ({cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})
                </dt>
                <dd className="text-ink">{formatCedis(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-ink-soft">
                <dt>Delivery</dt>
                <dd className="text-ink">{formatCedis(cart.deliveryFee)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-4">
                <dt className="font-medium text-ink">Total</dt>
                <dd className="text-2xl font-medium text-ink">{formatCedis(cart.total)}</dd>
              </div>
            </dl>

            {(selectedAddress || paymentMethod) && (
              <dl className="mt-5 space-y-3 border-t border-line pt-5 text-[14px]">
                {selectedAddress && (
                  <div>
                    <dt className="text-muted">Deliver to</dt>
                    <dd className="text-ink">
                      {selectedAddress.fullName}, {selectedAddress.city}
                    </dd>
                  </div>
                )}
                {paymentMethod && (
                  <div>
                    <dt className="text-muted">Payment</dt>
                    <dd className="text-ink">{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}</dd>
                  </div>
                )}
              </dl>
            )}

            {placeButton("mt-6 hidden w-full lg:flex")}
            <p className="mt-4 text-center text-[13px] text-muted">
              Prices and stock are confirmed when you place the order.
            </p>
          </aside>
        </div>
      )}

      {/* Phones and tablets: total and the final action stay in reach */}
      {!loading && (
        <div className="fixed inset-x-0 bottom-0 z-90 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur-sm lg:hidden">
          <div className="mx-auto max-w-xl">{placeButton("w-full")}</div>
        </div>
      )}

      <AddressModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAddress(null);
        }}
        onSaved={handleAddressSaved}
        editingAddress={editingAddress}
      />

      <div className="toast-region bottom-24 lg:bottom-6">
        <Toast success={toast.success} error={toast.error} message={toast.message} onClose={clearToast} />
      </div>
    </div>
  );
}
