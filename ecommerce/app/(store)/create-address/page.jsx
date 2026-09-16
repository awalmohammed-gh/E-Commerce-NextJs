"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Check, ArrowLeft, Trash2, Pencil, Plus } from "lucide-react";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import Toast from "@/ui/Toast";

export default function CreateAddress() {
  const {
    addresses,
    selectedAddressId,
    addAddress,
    updateAddress,
    deleteAddress,
    selectAddress,
  } = useEcommerce();

  const [editingId, setEditingId] = useState(null);

  const editingAddress = editingId
    ? addresses.find((a) => a.id === editingId) || null
    : null;

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    country: "Ghana",
    postalCode: "",
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

  /* Reset form */
  const resetForm = (addr = null) => {
    setForm({
      fullName: addr?.fullName || "Eleoka",
      phone: addr?.phone || "",
      address: addr?.address || "",
      city: addr?.city || "",
      region: addr?.region || "",
      country: addr?.country || "Ghana",
      postalCode: addr?.postalCode || "",
    });
    setErrors({});
  };

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
      setEditingId(null);
    } else {
      addAddress(form);
      showSuccess("Address added.");
    }

    resetForm();
  };

  const handleEdit = (addr) => {
    setEditingId(addr.id);
    resetForm(addr);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id) => {
    deleteAddress(id);
    showSuccess("Address removed.");
    if (editingId === id) {
      setEditingId(null);
      resetForm();
    }
  };

  const inputBase =
    "w-full text-sm text-[#1C1A17] bg-[#F7F4EE] border rounded-2xl px-4 py-3.5 outline-none transition-all duration-300 placeholder:text-[#8A6A52]/50 focus:bg-white focus:ring-4";
  const inputOk =
    "border-[#E5DDD1] focus:border-[#1C1A17] focus:ring-[#1C1A17]/5";
  const inputErr = "border-red-400 focus:border-red-500 focus:ring-red-500/5";

  return (
    <div className="min-h-screen bg-[#F5F1EA] text-[#1C1A17]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Back link */}
        <Link
          href="/checkout"
          className="group inline-flex items-center gap-2 text-sm text-[#8A6A52] hover:text-[#1C1A17] transition-colors duration-300 mb-8"
        >
          <span className="w-7 h-7 rounded-full bg-white border border-[#1C1A17]/5 flex items-center justify-center shadow-sm group-hover:-translate-x-0.5 transition-transform duration-300">
            <ArrowLeft className="w-3.5 h-3.5" />
          </span>
          Back to checkout
        </Link>

        {/* Header */}
        <div className="mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8A6A52]">
            Address
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-[#1C1A17] leading-tight mt-2 tracking-tight">
            {editingAddress ? "Edit address" : "Delivery addresses"}
          </h1>
          <p className="text-sm text-[#8A6A52] mt-2">
            {editingAddress
              ? "Update the details on the left and save."
              : "Add a new address or manage your saved ones."}
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 lg:gap-12">
          {/* LEFT - Form */}
          <div>
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-[28px] border border-[#1C1A17]/5 shadow-[0_8px_30px_rgba(28,26,23,0.06)] p-7 sm:p-10 space-y-6"
            >
              <div className="flex items-center gap-3 mb-3 pb-6 border-b border-[#1C1A17]/5">
                <div className="w-10 h-10 rounded-2xl bg-[#D98880]/15 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#D98880]" />
                </div>
                <h2 className="text-xl font-semibold text-[#1C1A17] tracking-tight">
                  {editingAddress ? "Edit details" : "New address"}
                </h2>
              </div>

              {/* Full name */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2.5">
                  Full name
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Eleoka"
                  value={form.fullName}
                  onChange={handleChange}
                  className={`${inputBase} ${
                    errors.fullName ? inputErr : inputOk
                  }`}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1.5">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2.5">
                  Phone number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+233 55 123 4567"
                  value={form.phone}
                  onChange={handleChange}
                  className={`${inputBase} ${
                    errors.phone ? inputErr : inputOk
                  }`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1.5">{errors.phone}</p>
                )}
              </div>

              {/* Street */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2.5">
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
                  <p className="text-xs text-red-500 mt-1.5">
                    {errors.address}
                  </p>
                )}
              </div>

              {/* City + Region */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2.5">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Accra"
                    value={form.city}
                    onChange={handleChange}
                    className={`${inputBase} ${
                      errors.city ? inputErr : inputOk
                    }`}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500 mt-1.5">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2.5">
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
                    <p className="text-xs text-red-500 mt-1.5">
                      {errors.region}
                    </p>
                  )}
                </div>
              </div>

              {/* Country + Postal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2.5">
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
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2.5">
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
              <div className="pt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-[#1C1A17]/5">
                {editingAddress && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full sm:w-auto text-center text-sm font-medium text-[#4A463F] hover:text-[#1C1A17] px-6 py-3 rounded-full transition-colors duration-300"
                  >
                    Cancel edit
                  </button>
                )}

                <motion.button
                  type="submit"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1C1A17] text-[#F5F1EA] px-8 py-3.5 rounded-full font-medium text-sm shadow-[0_4px_16px_rgba(28,26,23,0.18)] hover:bg-[#332F29] hover:shadow-[0_6px_20px_rgba(28,26,23,0.24)] transition-all duration-300"
                >
                  {editingAddress ? (
                    <>
                      <Check className="w-4 h-4" />
                      Update address
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add address
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>

          {/* RIGHT - Saved addresses */}
          <div>
            <div className="lg:sticky lg:top-24">
              <div className="flex items-baseline justify-between mb-5">
                <h2 className="text-xl font-semibold text-[#1C1A17] tracking-tight">
                  Saved addresses
                </h2>
                <span className="text-xs text-[#8A6A52] bg-white px-2.5 py-1 rounded-full border border-[#1C1A17]/5">
                  {addresses.length}{" "}
                  {addresses.length === 1 ? "address" : "addresses"}
                </span>
              </div>

              {addresses.length === 0 ? (
                <div className="bg-white rounded-[24px] border border-dashed border-[#1C1A17]/15 p-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#F7F4EE] flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-5 h-5 text-[#8A6A52]" />
                  </div>
                  <p className="text-sm text-[#8A6A52]">
                    No saved addresses yet.
                  </p>
                  <p className="text-xs text-[#8A6A52]/70 mt-1">
                    Add one using the form.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {addresses.map((addr) => {
                      const isSelected = addr.id === selectedAddressId;
                      const isEditing = addr.id === editingId;

                      return (
                        <motion.div
                          key={addr.id}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className={`rounded-2xl px-5 py-4 transition-all duration-300 border hover:shadow-[0_4px_16px_rgba(28,26,23,0.05)] ${
                            isEditing
                              ? "bg-[#D98880]/5 border-[#D98880]/30"
                              : isSelected
                                ? "bg-[#1C1A17] text-[#F5F1EA] border-transparent shadow-[0_8px_24px_rgba(28,26,23,0.18)]"
                                : "bg-white border-[#1C1A17]/5"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => selectAddress(addr.id)}
                              className={`shrink-0 w-4 h-4 rounded-full border mt-1 flex items-center justify-center transition-colors duration-300 ${
                                isSelected
                                  ? "bg-[#F5F1EA] border-[#F5F1EA]"
                                  : "border-[#1C1A17]/25 hover:border-[#1C1A17]/50"
                              }`}
                              aria-label="Select address"
                            >
                              {isSelected && (
                                <Check
                                  className="w-2.5 h-2.5 text-[#1C1A17]"
                                  strokeWidth={3}
                                />
                              )}
                            </button>

                            <div className="flex-1 min-w-0 text-sm leading-relaxed">
                              <p
                                className={`font-semibold ${
                                  isSelected
                                    ? "text-[#F5F1EA]"
                                    : "text-[#1C1A17]"
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
                                className={`mt-1.5 ${
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

                            <div className="shrink-0 flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleEdit(addr)}
                                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-300 ${
                                  isSelected
                                    ? "text-[#F5F1EA]/60 hover:text-[#F5F1EA] hover:bg-white/10"
                                    : "text-[#8A6A52] hover:text-[#1C1A17] hover:bg-[#1C1A17]/5"
                                }`}
                                aria-label="Edit address"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(addr.id)}
                                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-300 ${
                                  isSelected
                                    ? "text-[#F5F1EA]/60 hover:text-red-400 hover:bg-white/10"
                                    : "text-[#8A6A52] hover:text-red-600 hover:bg-red-50"
                                }`}
                                aria-label="Delete address"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
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
    </div>
  );
}
