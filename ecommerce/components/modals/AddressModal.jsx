"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Check,
  Trash2,
  User,
  Phone,
  Home,
  Building2,
  Globe2,
  Mail,
  Loader2,
} from "lucide-react";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import Toast from "@/ui/Toast";
import axios from "axios";

export default function AddressModal({
  open,
  onClose,
  onSaved,
  editingAddress = null,
}) {
  const { addAddress, updateAddress, deleteAddress } = useEcommerce();

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
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  /* Prefill form when editing */
  useEffect(() => {
    if (open && editingAddress) {
      setForm({
        fullName: editingAddress.fullName || "",
        phone: editingAddress.phone || "",
        address: editingAddress.address || "",
        city: editingAddress.city || "",
        region: editingAddress.region || "",
        country: editingAddress.country || "Ghana",
        postalCode: editingAddress.postalCode || "",
      });
      setErrors({});
    } else if (open && !editingAddress) {
      setForm({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        region: "",
        country: "Ghana",
        postalCode: "",
      });
      setErrors({});
    }
  }, [open, editingAddress]);

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

  /* ---------------------------------------------------------
     Save (create or update via API)
  --------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showError("Please fix the errors below.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        city: form.city,
        region: form.region,
        country: form.country,
        postalCode: form.postalCode,
      };

      if (editingAddress) {
        // UPDATE
        const { data } = await axios.put(
          `/api/address/${editingAddress.id}`,
          payload,
        );

        if (!data.success) {
          throw new Error(data.message || "Failed to update address");
        }

        updateAddress(editingAddress.id, payload);
        showSuccess("Address updated.");
        onSaved?.(payload, "updated");
      } else {
        // CREATE
        const { data } = await axios.post("/api/address", payload);

        if (!data.success) {
          throw new Error(data.message || "Failed to save address");
        }

        const created = {
          ...payload,
          id: data.address?._id || data.address?.id,
          isDefault: data.address?.isDefault,
        };

        addAddress(created);
        showSuccess("Address added.");
        onSaved?.(created, "added");
      }

      // Small delay so the toast is visible before the modal closes
      setTimeout(() => onClose?.(), 400);
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong.";
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------
     Delete via API
  --------------------------------------------------------- */
  const handleDelete = async () => {
    if (!editingAddress) return;

    try {
      setDeleting(true);

      const { data } = await axios.delete(`/api/address/${editingAddress.id}`);

      if (data && !data.success) {
        throw new Error(data.message || "Failed to delete address");
      }

      deleteAddress(editingAddress.id);
      showSuccess("Address removed.");
      onSaved?.(null, "deleted");

      setTimeout(() => onClose?.(), 400);
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Failed to delete address";
      showError(message);
    } finally {
      setDeleting(false);
    }
  };

  const inputBase =
    "w-full text-sm text-[#1C1A17] bg-[#F7F4EE] border rounded-2xl pl-11 pr-4 py-3.5 outline-none transition-all duration-200 placeholder:text-[#8A6A52]/45 focus:bg-white focus:ring-[3px] disabled:opacity-60";
  const inputOk =
    "border-[#E5DDD1] focus:border-[#1C1A17]/70 focus:ring-[#1C1A17]/8";
  const inputErr =
    "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-500/10";
  const iconBase =
    "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none";
  const labelBase =
    "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2";

  const busy = saving || deleting;

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-[#1C1A17]/50 backdrop-blur-md z-[300]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={busy ? undefined : onClose}
            />

            <div className="fixed inset-0 z-[301] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 48, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 32, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto w-full sm:max-w-lg bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-[0_24px_70px_-15px_rgba(28,26,23,0.35)] border border-[#1C1A17]/5 overflow-hidden max-h-[92vh] flex flex-col"
                role="dialog"
                aria-modal="true"
              >
                {/* drag handle */}
                <div className="sm:hidden flex justify-center pt-3">
                  <span className="w-10 h-1 rounded-full bg-[#1C1A17]/10" />
                </div>

                {/* Header */}
                <div className="flex items-start justify-between gap-4 px-6 sm:px-7 pt-5 pb-6 border-b border-[#1C1A17]/[0.06]">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D98880]/20 to-[#D98880]/5 flex items-center justify-center shrink-0 ring-1 ring-[#D98880]/10">
                      <MapPin
                        className="w-5 h-5 text-[#D98880]"
                        strokeWidth={2.25}
                      />
                    </div>
                    <div>
                      <h2 className="font-semibold text-2xl text-[#1C1A17] leading-tight tracking-tight">
                        {editingAddress ? "Edit address" : "New address"}
                      </h2>
                      <p className="text-xs text-[#8A6A52] mt-1">
                        {editingAddress
                          ? "Update your delivery details."
                          : "Where should we send your order?"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    disabled={busy}
                    className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-[#8A6A52] hover:text-[#1C1A17] hover:bg-[#1C1A17]/5 active:scale-95 transition-all disabled:opacity-50"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Body */}
                <form
                  onSubmit={handleSubmit}
                  className="px-6 sm:px-7 py-6 space-y-5 overflow-y-auto"
                >
                  {/* Full name */}
                  <div>
                    <label htmlFor="fullName" className={labelBase}>
                      Full name
                      <span className="text-[#D98880] text-[13px] leading-none">
                        •
                      </span>
                    </label>
                    <div className="relative">
                      <User
                        className={`${iconBase} ${
                          errors.fullName ? "text-red-400" : "text-[#8A6A52]/60"
                        }`}
                      />
                      <input
                        id="fullName"
                        type="text"
                        name="fullName"
                        placeholder="Jane Doe"
                        value={form.fullName}
                        onChange={handleChange}
                        disabled={busy}
                        className={`${inputBase} ${
                          errors.fullName ? inputErr : inputOk
                        }`}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.fullName && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-red-500 mt-1.5 pl-1"
                        >
                          {errors.fullName}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className={labelBase}>
                      Phone number
                      <span className="text-[#D98880] text-[13px] leading-none">
                        •
                      </span>
                    </label>
                    <div className="relative">
                      <Phone
                        className={`${iconBase} ${
                          errors.phone ? "text-red-400" : "text-[#8A6A52]/60"
                        }`}
                      />
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        placeholder="+233 55 123 4567"
                        value={form.phone}
                        onChange={handleChange}
                        disabled={busy}
                        className={`${inputBase} ${
                          errors.phone ? inputErr : inputOk
                        }`}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.phone && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-red-500 mt-1.5 pl-1"
                        >
                          {errors.phone}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className={labelBase}>
                      Street address
                      <span className="text-[#D98880] text-[13px] leading-none">
                        •
                      </span>
                    </label>
                    <div className="relative">
                      <Home
                        className={`${iconBase} ${
                          errors.address ? "text-red-400" : "text-[#8A6A52]/60"
                        }`}
                      />
                      <input
                        id="address"
                        type="text"
                        name="address"
                        placeholder="House number, street, landmark"
                        value={form.address}
                        onChange={handleChange}
                        disabled={busy}
                        className={`${inputBase} ${
                          errors.address ? inputErr : inputOk
                        }`}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.address && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-red-500 mt-1.5 pl-1"
                        >
                          {errors.address}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* City + Region */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="city" className={labelBase}>
                        City
                        <span className="text-[#D98880] text-[13px] leading-none">
                          •
                        </span>
                      </label>
                      <div className="relative">
                        <Building2
                          className={`${iconBase} ${
                            errors.city ? "text-red-400" : "text-[#8A6A52]/60"
                          }`}
                        />
                        <input
                          id="city"
                          type="text"
                          name="city"
                          placeholder="Accra"
                          value={form.city}
                          onChange={handleChange}
                          disabled={busy}
                          className={`${inputBase} ${
                            errors.city ? inputErr : inputOk
                          }`}
                        />
                      </div>
                      <AnimatePresence>
                        {errors.city && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-xs text-red-500 mt-1.5 pl-1"
                          >
                            {errors.city}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label htmlFor="region" className={labelBase}>
                        Region
                        <span className="text-[#D98880] text-[13px] leading-none">
                          •
                        </span>
                      </label>
                      <div className="relative">
                        <MapPin
                          className={`${iconBase} ${
                            errors.region ? "text-red-400" : "text-[#8A6A52]/60"
                          }`}
                        />
                        <input
                          id="region"
                          type="text"
                          name="region"
                          placeholder="Greater Accra"
                          value={form.region}
                          onChange={handleChange}
                          disabled={busy}
                          className={`${inputBase} ${
                            errors.region ? inputErr : inputOk
                          }`}
                        />
                      </div>
                      <AnimatePresence>
                        {errors.region && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-xs text-red-500 mt-1.5 pl-1"
                          >
                            {errors.region}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Country + Postal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="country" className={labelBase}>
                        Country
                      </label>
                      <div className="relative">
                        <Globe2 className={`${iconBase} text-[#8A6A52]/60`} />
                        <input
                          id="country"
                          type="text"
                          name="country"
                          placeholder="Ghana"
                          value={form.country}
                          onChange={handleChange}
                          disabled={busy}
                          className={`${inputBase} ${inputOk}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="postalCode" className={labelBase}>
                        Postal code
                      </label>
                      <div className="relative">
                        <Mail className={`${iconBase} text-[#8A6A52]/60`} />
                        <input
                          id="postalCode"
                          type="text"
                          name="postalCode"
                          placeholder="GA-123-4567"
                          value={form.postalCode}
                          onChange={handleChange}
                          disabled={busy}
                          className={`${inputBase} ${inputOk}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 mt-1 border-t border-[#1C1A17]/[0.06] flex flex-col-reverse sm:flex-row sm:justify-between gap-3 sm:gap-2">
                    <div>
                      {editingAddress && (
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={busy}
                          className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-3 rounded-full transition-colors disabled:opacity-60"
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        className="w-full sm:w-auto text-sm font-medium text-[#4A463F] hover:text-[#1C1A17] px-5 py-3 rounded-full transition-colors disabled:opacity-60"
                      >
                        Cancel
                      </button>

                      <motion.button
                        type="submit"
                        disabled={busy}
                        whileHover={
                          busy
                            ? undefined
                            : {
                                y: -2,
                                boxShadow:
                                  "0 10px 24px -8px rgba(28,26,23,0.45)",
                              }
                        }
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1C1A17] text-[#F5F1EA] px-7 py-3 rounded-full font-medium text-sm hover:bg-[#332F29] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            {editingAddress ? "Update address" : "Save address"}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <div className="fixed bottom-6 right-6 z-[400] pointer-events-none">
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
