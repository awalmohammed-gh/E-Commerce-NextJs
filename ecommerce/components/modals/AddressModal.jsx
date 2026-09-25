"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2, X } from "lucide-react";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import Toast from "@/ui/Toast";

const LABELS = ["Home", "Office", "Other"];

const REQUIRED = ["fullName", "phone", "address", "city", "region", "country"];

const REQUIRED_MESSAGES = {
  fullName: "Enter the name of the person receiving the order.",
  phone: "Enter a phone number the rider can call.",
  address: "Enter the street address or a landmark.",
  city: "Enter the city or town.",
  region: "Enter the region.",
  country: "Enter the country.",
};

const toForm = (a) => ({
  label: a?.label || "Home",
  fullName: a?.fullName || "",
  phone: a?.phone || "",
  address: a?.address || "",
  city: a?.city || "",
  region: a?.region || "",
  country: a?.country || "Ghana",
  postalCode: a?.postalCode || "",
  additionalInfo: a?.additionalInfo || "",
});

/*
  Add / edit a saved address. Saving goes straight to the API; the
  server validates, assigns ownership and applies the default rule.
  onSaved(address) receives the saved address from the server.
  Phones get a bottom sheet; larger screens a centred dialog.
*/
export default function AddressModal({ open, onClose, onSaved, editingAddress = null }) {
  const { addresses, createAddress, updateAddress } = useEcommerce();

  const isFirstAddress = !editingAddress && addresses.length === 0;
  const isCurrentDefault = Boolean(editingAddress?.isDefault);

  const [form, setForm] = useState(() => toForm(editingAddress));
  const [makeDefault, setMakeDefault] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset the form each time the modal opens (new or different address)
  const [openedFor, setOpenedFor] = useState(null);
  const openKey = open ? editingAddress?._id || "new" : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setForm(toForm(editingAddress));
      setMakeDefault(false);
      setErrors({});
      setFormError("");
    }
  }

  const [toast, setToast] = useState({ message: "", success: false, error: false });
  const clearToast = useCallback(() => setToast({ message: "", success: false, error: false }), []);

  // Escape closes (unless a save is in flight)
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleChange = (e) => setField(e.target.name, e.target.value);

  // Quick client check for obvious gaps; the server re-validates everything
  const validate = () => {
    const next = {};
    for (const field of REQUIRED) {
      if (!form[field].trim()) next[field] = REQUIRED_MESSAGES[field];
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setFormError("");

    if (!validate()) {
      setFormError("Please fill in the highlighted fields.");
      return;
    }

    setSaving(true);
    const payload = { ...form, isDefault: makeDefault };
    const result = editingAddress
      ? await updateAddress(editingAddress._id, payload)
      : await createAddress(payload);
    setSaving(false);

    if (!result.success) {
      if (result.errors) setErrors(result.errors);
      setFormError(result.message || "We couldn't save this address. Please try again.");
      return;
    }

    setToast({ message: editingAddress ? "Address updated." : "Address saved.", success: true, error: false });
    onSaved?.(result.address);
    onClose?.();
  };

  const field = ({ name, label, placeholder, type = "text", required = true, autoComplete, className = "" }) => (
    <div className={className}>
      <label htmlFor={`address-${name}`} className="field-label">
        {label}
        {!required && <span className="ml-1 font-normal text-muted">(optional)</span>}
      </label>
      <input
        id={`address-${name}`}
        type={type}
        name={name}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={form[name]}
        onChange={handleChange}
        disabled={saving}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `address-${name}-error` : undefined}
        className="field"
      />
      {errors[name] && (
        <p id={`address-${name}-error`} className="field-error">
          {errors[name]}
        </p>
      )}
    </div>
  );

  const defaultLocked = isFirstAddress || isCurrentDefault;

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-300 bg-ink/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={saving ? undefined : onClose}
            />

            <div className="pointer-events-none fixed inset-0 z-301 flex items-end justify-center sm:items-center sm:p-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                className="storefront pointer-events-auto flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-plate bg-paper shadow-lift sm:max-w-xl sm:rounded-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="address-modal-title"
              >
                <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4 sm:px-7">
                  <h2 id="address-modal-title" className="font-display text-[28px] leading-tight text-ink">
                    {editingAddress ? "Edit address" : "New address"}
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-cream disabled:opacity-50"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
                  <div className="space-y-5 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
                    {formError && (
                      <p role="alert" className="alert-error">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        {formError}
                      </p>
                    )}

                    <fieldset>
                      <legend className="field-label">Label</legend>
                      <div className="flex gap-2" role="radiogroup" aria-label="Address label">
                        {LABELS.map((value) => {
                          const active = form.label === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => setField("label", value)}
                              disabled={saving}
                              className={`min-h-11 flex-1 rounded-full border px-4 text-[14px] transition-colors sm:flex-none ${
                                active ? "border-ink bg-ink text-cream" : "border-line bg-white text-ink hover:border-ink/40"
                              }`}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {field({ name: "fullName", label: "Full name", autoComplete: "name" })}
                      {field({ name: "phone", label: "Phone number", type: "tel", placeholder: "024 123 4567", autoComplete: "tel" })}
                    </div>
                    {field({ name: "address", label: "Street address", placeholder: "House number, street, landmark", autoComplete: "street-address" })}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {field({ name: "city", label: "City or town", autoComplete: "address-level2" })}
                      {field({ name: "region", label: "Region", placeholder: "Greater Accra", autoComplete: "address-level1" })}
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {field({ name: "country", label: "Country", autoComplete: "country-name" })}
                      {field({ name: "postalCode", label: "Digital address", placeholder: "GA-123-4567", required: false, autoComplete: "postal-code" })}
                    </div>

                    <div>
                      <label htmlFor="address-additionalInfo" className="field-label">
                        Delivery notes <span className="font-normal text-muted">(optional)</span>
                      </label>
                      <textarea
                        id="address-additionalInfo"
                        name="additionalInfo"
                        rows={2}
                        maxLength={300}
                        placeholder="Gate colour, nearby landmark, best time to call"
                        value={form.additionalInfo}
                        onChange={handleChange}
                        disabled={saving}
                        aria-invalid={Boolean(errors.additionalInfo)}
                        className="field resize-none py-3"
                      />
                      {errors.additionalInfo && <p className="field-error">{errors.additionalInfo}</p>}
                    </div>

                    <label className={`flex items-start gap-3 ${defaultLocked ? "" : "cursor-pointer"}`}>
                      <input
                        type="checkbox"
                        checked={defaultLocked || makeDefault}
                        onChange={(e) => setMakeDefault(e.target.checked)}
                        disabled={defaultLocked || saving}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-ink"
                      />
                      <span className="text-[15px]">
                        <span className="text-ink">Use as my default address</span>
                        <span className="mt-0.5 block text-[13px] text-muted">
                          {isFirstAddress
                            ? "Your first address becomes your default automatically."
                            : isCurrentDefault
                              ? "This is your default. Set another address as default to change it."
                              : "Checkout will select it automatically."}
                        </span>
                      </span>
                    </label>
                  </div>

                  <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                    <button type="button" onClick={onClose} disabled={saving} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving} className="btn-primary">
                      {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                      {saving ? "Saving" : editingAddress ? "Save changes" : "Save address"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <div className="toast-region">
        <Toast success={toast.success} error={toast.error} message={toast.message} onClose={clearToast} />
      </div>
    </>
  );
}
