"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Check, ArrowLeft, Trash2 } from "lucide-react";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import Toast from "@/ui/Toast";

export default function CreateAddress({ editingAddress = null }) {
  const router = useRouter();
  const { addAddress, updateAddress, deleteAddress } = useEcommerce();

  const [form, setForm] = useState({
    fullName: editingAddress?.fullName || "",
    phone: editingAddress?.phone || "",
    address: editingAddress?.address || "",
    city: editingAddress?.city || "",
    region: editingAddress?.region || "",
    country: editingAddress?.country || "Ghana",
    postalCode: editingAddress?.postalCode || "",
  });

  const [errors, setErrors] = useState({});

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    if (!form.phone.trim()) next.phone = "Phone number is required";
    if (!form.address.trim()) next.address = "Street address is required";
    if (!form.city.trim()) next.city = "City is required";
    if (!form.region.trim()) next.region = "Region is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      showError("Please fix the errors below.");
      return;
    }

    if (editingAddress) {
      updateAddress(editingAddress.id, form);
      showSuccess("Address updated.");
    } else {
      addAddress(form);
      showSuccess("Address added.");
    }

    setTimeout(() => router.push("/checkout"), 900);
  };

  const handleDelete = () => {
    if (!editingAddress) return;
    deleteAddress(editingAddress.id);
    showSuccess("Address removed.");
    setTimeout(() => router.push("/checkout"), 900);
  };

  const inputBase =
    "w-full font-utility text-sm text-[#1C1A17] bg-[#F7F4EE] border rounded-xl px-4 py-3 outline-none transition-all placeholder:text-[#8A6A52]/50 focus:bg-white focus:ring-4";
  const inputOk =
    "border-[#E5DDD1] focus:border-[#1C1A17] focus:ring-[#1C1A17]/5";
  const inputErr = "border-red-400 focus:border-red-500 focus:ring-red-500/5";

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Work+Sans:wght@400;500;600&display=swap");
        .font-editorial {
          font-family: "Cormorant Garamond", serif;
        }
        .font-utility {
          font-family: "Work Sans", sans-serif;
        }
      `}</style>

      <div className="min-h-screen bg-[#F5F1EA] text-[#1C1A17]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          {/* Back link */}
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 font-utility text-sm text-[#8A6A52] hover:text-[#1C1A17] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to checkout
          </Link>

          {/* Header */}
          <div className="mb-8 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#D98880]/15 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-[#D98880]" />
            </div>
            <div>
              <p className="font-utility text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8A6A52]">
                Address
              </p>
              <h1 className="font-editorial font-semibold text-3xl sm:text-4xl text-[#1C1A17] leading-tight">
                {editingAddress ? "Edit address" : "New address"}
              </h1>
              <p className="font-utility text-sm text-[#8A6A52] mt-1">
                {editingAddress
                  ? "Update your delivery details below."
                  : "Add a new delivery address to your account."}
              </p>
            </div>
          </div>

          {/* Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-[#1C1A17]/5 shadow-[0_1px_2px_rgba(28,26,23,0.04)] p-6 sm:p-8 space-y-5"
          >
            {/* Full name */}
            <div>
              <label className="block font-utility text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2">
                Full name
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="Jane Doe"
                value={form.fullName}
                onChange={handleChange}
                className={`${inputBase} ${
                  errors.fullName ? inputErr : inputOk
                }`}
              />
              {errors.fullName && (
                <p className="font-utility text-xs text-red-500 mt-1.5">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block font-utility text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2">
                Phone number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+233 55 123 4567"
                value={form.phone}
                onChange={handleChange}
                className={`${inputBase} ${errors.phone ? inputErr : inputOk}`}
              />
              {errors.phone && (
                <p className="font-utility text-xs text-red-500 mt-1.5">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Street */}
            <div>
              <label className="block font-utility text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2">
                Street address
              </label>
              <input
                type="text"
                name="address"
                placeholder="House number, street, landmark"
                value={form.address}
                onChange={handleChange}
                className={`${inputBase} ${
                  errors.address ? inputErr : inputOk
                }`}
              />
              {errors.address && (
                <p className="font-utility text-xs text-red-500 mt-1.5">
                  {errors.address}
                </p>
              )}
            </div>

            {/* City + Region */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block font-utility text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="Accra"
                  value={form.city}
                  onChange={handleChange}
                  className={`${inputBase} ${errors.city ? inputErr : inputOk}`}
                />
                {errors.city && (
                  <p className="font-utility text-xs text-red-500 mt-1.5">
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-utility text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2">
                  Region
                </label>
                <input
                  type="text"
                  name="region"
                  placeholder="Greater Accra"
                  value={form.region}
                  onChange={handleChange}
                  className={`${inputBase} ${
                    errors.region ? inputErr : inputOk
                  }`}
                />
                {errors.region && (
                  <p className="font-utility text-xs text-red-500 mt-1.5">
                    {errors.region}
                  </p>
                )}
              </div>
            </div>

            {/* Country + Postal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block font-utility text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  placeholder="Ghana"
                  value={form.country}
                  onChange={handleChange}
                  className={`${inputBase} ${inputOk}`}
                />
              </div>

              <div>
                <label className="block font-utility text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2">
                  Postal code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  placeholder="GA-123-4567"
                  value={form.postalCode}
                  onChange={handleChange}
                  className={`${inputBase} ${inputOk}`}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
              <div>
                {editingAddress && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center gap-2 font-utility text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-3 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Link
                  href="/checkout"
                  className="w-full sm:w-auto text-center font-utility text-sm font-medium text-[#4A463F] hover:text-[#1C1A17] px-6 py-3 rounded-full transition-colors"
                >
                  Cancel
                </Link>

                <motion.button
                  type="submit"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1C1A17] text-[#F5F1EA] px-7 py-3 rounded-full font-utility font-medium text-sm hover:bg-[#332F29] transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {editingAddress ? "Update address" : "Save address"}
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      </div>

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
