"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Plus,
  Check,
  Pencil,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Smartphone,
  Banknote,
} from "lucide-react";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import Toast from "@/ui/Toast";
import EmptyCheckout from "@/ui/EmptyCheckout";
import AddressModal from "@/components/modals/AddressModal";
import { useRouter } from "next/navigation";
import axios from "axios";

const PAYMENT_METHODS = [
  {
    id: "Card",
    label: "Card",
    description: "Visa, Mastercard, Amex",
    icon: CreditCard,
  },
  {
    id: "Mobile Money",
    label: "Mobile Money",
    description: "MTN, Vodafone, AirtelTigo",
    icon: Smartphone,
  },
  {
    id: "Cash On Delivery",
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: Banknote,
  },
];

export default function MyCheckout() {
  const {
    addresses,
    selectedAddressId,
    selectAddress,
    addItems,
    setAddItems,
    totalAmount,
    handleCartCount,
  } = useEcommerce();

  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const router = useRouter();

  const [toast, setToast] = useState({
    message: "",
    success: false,
    error: false,
  });

  const showSuccess = (message) =>
    setToast({ message, success: true, error: false });
  const showError = (message) =>
    setToast({ message, success: false, error: true });
  const clearToast = () =>
    setToast({ message: "", success: false, error: false });

  const cartCount = useMemo(() => handleCartCount(), [addItems]);
  const shipping = cartCount > 0 ? 25 : 0;
  const subtotal = totalAmount || 0;
  const total = subtotal + shipping;

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) || null;

  /* Open modal - blank for new, prefilled for edit */
  const openNewAddress = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddress(addr);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAddress(null);
  };

  /* Modal save callback */
  const handleAddressSaved = (addr, action) => {
    if (action === "added") showSuccess("Address added.");
    if (action === "updated") showSuccess("Address updated.");
    if (action === "deleted") showSuccess("Address removed.");
  };

  /* Place order */
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showError("Please select a delivery address.");
      return;
    }
    if (!paymentMethod) {
      showError("Please choose a payment method.");
      return;
    }
    if (cartCount === 0) {
      showError("Your cart is empty.");
      return;
    }

    try {
      setPlacing(true);

      const orderItems = {
        address: selectedAddress,
        items: addItems,
        totalAmount: total,
        paymentMethod,
      };
      const {data} = await axios.post("/api/checkout", orderItems);
      if(data.success){
        showSuccess("Order placed successfully.");
        router.push("/orders");
        setAddItems({})
      }else{
        showError(data.message)
      }
    } catch (err) {
      showError(err.message || "Something went wrong.");
    } finally {
      setPlacing(false);
    }
  };

  const formatPrice = (n) =>
    `GH₵${Number(n || 0).toLocaleString("en-GH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;

  if (cartCount === 0) {
    return (
      <EmptyCheckout
        icon={ShoppingBag}
        title="Nothing to check out"
        message="Your bag is empty. Add a few pieces before heading to checkout."
        actionLabel="Continue shopping"
        actionHref="/shop"
      />
    );
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-10 py-8 lg:py-14 max-w-300 mx-auto">
        {/* Header */}
        <div className="mb-10 flex items-baseline justify-between gap-4 border-b border-[#1C1A17]/10 pb-6">
          <h1 className="font-semibold text-4xl sm:text-5xl text-[#1C1A17] leading-none">
            Checkout
          </h1>
          <p className="text-sm text-[#8A6A52] hidden sm:block">
            {cartCount} {cartCount === 1 ? "item" : "items"} ·{" "}
            {formatPrice(total)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-x-12 gap-y-10">
          <div>
            {/* Address selection */}
            <section className="pb-9 mb-9 border-b border-[#1C1A17]/8">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl text-[#D98880] leading-none font-semibold">
                    01
                  </span>
                  <div>
                    <h2 className="text-xl text-[#1C1A17] leading-tight font-semibold">
                      Delivery address
                    </h2>
                    <p className="text-xs text-[#8A6A52] mt-0.5">
                      {addresses.length > 0
                        ? "Choose where to send your order"
                        : "You haven't saved any addresses yet"}
                    </p>
                  </div>
                </div>

                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={openNewAddress}
                    className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-[#1C1A17]/70 hover:text-[#1C1A17] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add address
                  </button>
                )}
              </div>

              {addresses.length === 0 ? (
                <button
                  type="button"
                  onClick={openNewAddress}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-[#1C1A17]/25 text-[#1C1A17] py-4 rounded-xl text-sm font-medium hover:border-[#1C1A17]/50 hover:bg-[#F7F4EE]/60 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-[#8A6A52]" />
                  Add delivery address
                </button>
              ) : (
                <div className="space-y-2.5">
                  {addresses.map((addr) => {
                    const isSelected = addr.id === selectedAddressId;
                    return (
                      <motion.div
                        key={addr.id}
                        layout
                        onClick={() => selectAddress(addr.id)}
                        className={`group relative rounded-xl px-4 py-3.5 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#1C1A17] text-[#F5F1EA]"
                            : "bg-[#F7F4EE]/70 hover:bg-[#F7F4EE] text-[#1C1A17]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`shrink-0 w-4 h-4 rounded-full border mt-1 flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-[#F5F1EA] border-[#F5F1EA]"
                                : "border-[#1C1A17]/25"
                            }`}
                          >
                            {isSelected && (
                              <Check
                                className="w-2.5 h-2.5 text-[#1C1A17]"
                                strokeWidth={3}
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 text-sm leading-relaxed">
                            <p
                              className={`font-semibold ${
                                isSelected ? "text-[#F5F1EA]" : "text-[#1C1A17]"
                              }`}
                            >
                              {addr.fullName}
                            </p>
                            <p
                              className={`text-xs ${
                                isSelected
                                  ? "text-[#F5F1EA]/60"
                                  : "text-[#8A6A52]"
                              }`}
                            >
                              {addr.phone}
                            </p>
                            <p
                              className={`mt-1 ${
                                isSelected
                                  ? "text-[#F5F1EA]/85"
                                  : "text-[#4A463F]"
                              }`}
                            >
                              {addr.address}
                              {addr.city && `, ${addr.city}`}
                              {addr.region && `, ${addr.region}`}
                              {addr.country && `, ${addr.country}`}
                              {addr.postalCode && ` ${addr.postalCode}`}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditAddress(addr);
                            }}
                            className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                              isSelected
                                ? "text-[#F5F1EA]/60 hover:text-[#F5F1EA] hover:bg-white/10"
                                : "text-[#8A6A52] hover:text-[#1C1A17] hover:bg-[#1C1A17]/5"
                            }`}
                            aria-label="Edit address"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Payment method */}
            <section className="pb-9 mb-9 border-b border-[#1C1A17]/8">
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-2xl text-[#D98880] leading-none font-semibold">
                  02
                </span>
                <div>
                  <h2 className="text-xl text-[#1C1A17] leading-tight font-semibold">
                    Payment method
                  </h2>
                  <p className="text-xs text-[#8A6A52] mt-0.5">
                    How would you like to pay?
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;

                  return (
                    <motion.div
                      key={method.id}
                      layout
                      onClick={() => setPaymentMethod(method.id)}
                      className={`group relative rounded-xl px-4 py-3.5 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#1C1A17] text-[#F5F1EA]"
                          : "bg-[#F7F4EE]/70 hover:bg-[#F7F4EE] text-[#1C1A17]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-[#F5F1EA] border-[#F5F1EA]"
                              : "border-[#1C1A17]/25"
                          }`}
                        >
                          {isSelected && (
                            <Check
                              className="w-2.5 h-2.5 text-[#1C1A17]"
                              strokeWidth={3}
                            />
                          )}
                        </div>

                        <div
                          className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? "bg-white/10 text-[#F5F1EA]"
                              : "bg-white text-[#1C1A17]"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0 text-sm">
                          <p
                            className={`font-semibold ${
                              isSelected ? "text-[#F5F1EA]" : "text-[#1C1A17]"
                            }`}
                          >
                            {method.label}
                          </p>
                          <p
                            className={`text-xs ${
                              isSelected
                                ? "text-[#F5F1EA]/60"
                                : "text-[#8A6A52]"
                            }`}
                          >
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Order items */}
            <section className="pb-9 mb-9 border-b border-[#1C1A17]/8">
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-2xl text-[#D98880] leading-none font-semibold">
                  03
                </span>
                <h2 className="text-xl text-[#1C1A17] leading-tight font-semibold">
                  Your items
                </h2>
              </div>

              <div>
                {Object.entries(addItems).map(([productId, sizes]) =>
                  Object.entries(sizes).map(([size, qty]) => {
                    if (qty === 0) return null;
                    return (
                      <div
                        key={`${productId}-${size}`}
                        className="flex items-center justify-between gap-4 py-3.5 border-b border-[#1C1A17]/6 last:border-0 text-sm"
                      >
                        <p className="text-[#1C1A17] font-medium">
                          {productId}
                        </p>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-[#8A6A52] bg-[#F7F4EE] px-2 py-1 rounded-md">
                            Size {size}
                          </span>
                          <span className="text-xs text-[#8A6A52]">×{qty}</span>
                        </div>
                      </div>
                    );
                  }),
                )}
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 h-fit bg-[#F7F4EE] rounded-2xl p-6">
            <h2 className="text-2xl text-[#1C1A17] mb-6 font-semibold">
              Order summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#4A463F]">
                <span>Subtotal</span>
                <span className="font-medium text-[#1C1A17]">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[#4A463F]">
                <span>Shipping</span>
                <span className="font-medium text-[#1C1A17]">
                  {shipping === 0 ? "—" : formatPrice(shipping)}
                </span>
              </div>
              <div className="border-t border-[#1C1A17]/10 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-[#1C1A17]">
                  Total
                </span>
                <span className="text-2xl font-semibold text-[#1C1A17]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {selectedAddress && (
              <div className="mt-5 pt-5 border-t border-[#1C1A17]/10 text-xs text-[#4A463F]">
                <p className="text-[#8A6A52] mb-1">Deliver to</p>
                <p className="font-semibold text-[#1C1A17]">
                  {selectedAddress.fullName}
                </p>
                <p className="line-clamp-2">
                  {selectedAddress.address}, {selectedAddress.city}
                </p>
              </div>
            )}

            {paymentMethod && (
              <div className="mt-4 text-xs text-[#4A463F]">
                <p className="text-[#8A6A52] mb-1">Paying with</p>
                <p className="font-semibold text-[#1C1A17]">
                  {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
                </p>
              </div>
            )}

            <motion.button
              type="button"
              onClick={handlePlaceOrder}
              disabled={
                placing || cartCount === 0 || !selectedAddress || !paymentMethod
              }
              whileTap={{ scale: 0.98 }}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[#1C1A17] text-[#F5F1EA] py-3.5 rounded-full font-medium text-sm hover:bg-[#332F29] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {placing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Placing order...
                </>
              ) : (
                <>
                  Place order
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            <Link
              href="/shopping-cart"
              className="mt-4 block text-center text-sm text-[#8A6A52] hover:text-[#1C1A17] transition-colors"
            >
              Back to cart
            </Link>
          </aside>
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        open={modalOpen}
        onClose={closeModal}
        onSaved={handleAddressSaved}
        editingAddress={editingAddress}
      />

      {/* Toast */}
      <div className="fixed bottom-6 right-6 z-200 pointer-events-none">
        <div className="pointer-events-auto">
          <Toast
            success={toast.success}
            error={toast.error}
            message={toast.message}
            onClose={clearToast}
          />
        </div>
      </div>
    </>
  );
}
