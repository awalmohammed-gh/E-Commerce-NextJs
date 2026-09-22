"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  X,
  Plus,
  Check,
  Loader2,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import Toast from "@/ui/Toast";

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    price: 0,
    offerPrice: 0,
    stock: "",
    bestseller: false,
    newArrival: false,
  });

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* Toast state */
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

  /* Handlers */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const valid = files.filter((file) => {
      if (!file.type.startsWith("image/")) return false;
      if (file.size > 5 * 1024 * 1024) return false;
      return true;
    });

    setImages((prev) => [...prev, ...valid].slice(0, 6));
    e.target.value = "";
  };

  const handleRemoveImage = (idx) =>
    setImages((prev) => prev.filter((_, index) => index !== idx));

  const handleAddSize = () => {
    const trimmed = sizeInput.trim();
    if (!trimmed || sizes.includes(trimmed)) return;
    setSizes((prev) => [...prev, trimmed]);
    setSizeInput("");
  };

  const handleRemoveSize = (size) =>
    setSizes((prev) => prev.filter((s) => s !== size));

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      category: "",
      subCategory: "",
      price: 0,
      offerPrice: 0,
      stock: "",
      bestseller: false,
      newArrival: false,
    });
    setImages([]);
    setSizes([]);
    setErrors({});
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Product name is required";
    if (!form.description.trim()) next.description = "Description is required";
    if (!form.category.trim()) next.category = "Category is required";
    if (!form.price || Number(form.price) <= 0)
      next.price = "Price must be greater than 0";
    if (form.offerPrice && Number(form.offerPrice) >= Number(form.price))
      next.offerPrice = "Offer price must be less than price";
    if (images.length === 0) next.images = "At least one image is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      showError("Please fix the errors above.");
      return;
    }

    try {
      setLoading(true);
      const sizesForSubmission = sizeInput.trim()
        ? [...new Set([...sizes, sizeInput.trim()])]
        : sizes;

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("subCategory", form.subCategory);
      formData.append("price", form.price);
      formData.append("offerPrice", form.offerPrice || 0);
      formData.append("stock", form.stock || 0);
      formData.append("bestseller", form.bestseller);
      formData.append("newArrival", form.newArrival);
      formData.append("sizes", JSON.stringify(sizesForSubmission));

      images.forEach((image) => formData.append("images", image));

      const res = await fetch("/api/add-product", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create product");

      showSuccess("Product created successfully.");
      resetForm();
    } catch (err) {
      showError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urls = images.map((file) =>
      file ? URL.createObjectURL(file) : null,
    );
    setPreview(urls);
    return () => {
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [images]);

  /* Small shared input class */
  const inputBase =
    "w-full font-utility text-sm text-[#1C1A17] bg-[#F7F4EE] border rounded-xl px-4 py-3 outline-none transition-all placeholder:text-[#8A6A52]/50 focus:bg-white focus:ring-4";
  const inputOk =
    "border-[#E5DDD1] focus:border-[#1C1A17] focus:ring-[#1C1A17]/5";
  const inputErr =
    "border-red-400 focus:border-red-500 focus:ring-red-500/5 bg-red-50/30";

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

      {/* Header */}
      <div className="mb-8 flex flex-col gap-1">
        <p className="font-utility text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8A6A52]">
          Catalog
        </p>
        <h1 className="font-editorial font-semibold text-3xl sm:text-4xl text-[#1C1A17]">
          Add New Product
        </h1>
        <p className="font-utility text-sm text-[#8A6A52]">
          Fill in the details below to add a new dress to your catalog.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ================= Basic information ================= */}
        <section className="bg-white rounded-3xl border border-[#1C1A17]/5 shadow-[0_1px_2px_rgba(28,26,23,0.04)] p-6 sm:p-8">
          <header className="mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#1C1A17] text-[#F5F1EA] text-xs font-semibold flex items-center justify-center">
              1
            </span>
            <div>
              <h2 className="font-editorial text-xl text-[#1C1A17]">
                Basic information
              </h2>
              <p className="font-utility text-xs text-[#8A6A52]">
                Name, description, and category
              </p>
            </div>
          </header>

          <div className="space-y-5">
            <div>
              <label className="block font-utility text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2">
                Product name
              </label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Dusty Pink Corset Mini Dress"
                className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
              />
              {errors.name && (
                <p className="font-utility text-xs text-red-500 mt-1.5">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block font-utility text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the fabric, fit, occasion..."
                className={`${inputBase} resize-none ${
                  errors.description ? inputErr : inputOk
                }`}
              />
              {errors.description && (
                <p className="font-utility text-xs text-red-500 mt-1.5">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block font-utility text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2">
                  Category
                </label>
                <input
                  name="category"
                  type="text"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Dresses"
                  className={`${inputBase} ${
                    errors.category ? inputErr : inputOk
                  }`}
                />
                {errors.category && (
                  <p className="font-utility text-xs text-red-500 mt-1.5">
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-utility text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2">
                  Subcategory
                </label>
                <input
                  name="subCategory"
                  type="text"
                  value={form.subCategory}
                  onChange={handleChange}
                  placeholder="e.g. Mini Dress"
                  className={`${inputBase} ${inputOk}`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================= Pricing & stock ================= */}
        <section className="bg-white rounded-3xl border border-[#1C1A17]/5 shadow-[0_1px_2px_rgba(28,26,23,0.04)] p-6 sm:p-8">
          <header className="mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#1C1A17] text-[#F5F1EA] text-xs font-semibold flex items-center justify-center">
              2
            </span>
            <div>
              <h2 className="font-editorial text-xl text-[#1C1A17]">
                Pricing and stock
              </h2>
              <p className="font-utility text-xs text-[#8A6A52]">
                Set how much this product sells for
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block font-utility text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2">
                Price (GH₵)
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleNumberChange}
                className={`${inputBase} ${errors.price ? inputErr : inputOk}`}
              />
              {errors.price && (
                <p className="font-utility text-xs text-red-500 mt-1.5">
                  {errors.price}
                </p>
              )}
            </div>

            <div>
              <label className="block font-utility text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2">
                Offer price (GH₵)
              </label>
              <input
                name="offerPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.offerPrice}
                onChange={handleNumberChange}
                placeholder="Optional"
                className={`${inputBase} ${
                  errors.offerPrice ? inputErr : inputOk
                }`}
              />
              {errors.offerPrice && (
                <p className="font-utility text-xs text-red-500 mt-1.5">
                  {errors.offerPrice}
                </p>
              )}
            </div>

            <div>
              <label className="block font-utility text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2">
                Stock
              </label>
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleNumberChange}
                placeholder="e.g. 25"
                className={`${inputBase} ${inputOk}`}
              />
            </div>
          </div>
        </section>

        {/* ================= Sizes ================= */}
        <section className="bg-white rounded-3xl border border-[#1C1A17]/5 shadow-[0_1px_2px_rgba(28,26,23,0.04)] p-6 sm:p-8">
          <header className="mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#1C1A17] text-[#F5F1EA] text-xs font-semibold flex items-center justify-center">
              3
            </span>
            <div>
              <h2 className="font-editorial text-xl text-[#1C1A17]">Sizes</h2>
              <p className="font-utility text-xs text-[#8A6A52]">
                Leave empty if the product is one-size
              </p>
            </div>
          </header>

          <div className="flex gap-2">
            <input
              type="text"
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSize();
                }
              }}
              placeholder="Type a size and press Enter"
              className={`${inputBase} ${inputOk} flex-1`}
            />
            <button
              type="button"
              onClick={handleAddSize}
              className="px-5 rounded-xl bg-[#1C1A17] text-[#F5F1EA] hover:bg-[#332F29] transition-colors flex items-center gap-1.5 font-utility text-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {sizes.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {sizes.map((size) => (
                <motion.span
                  key={size}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1.5 bg-[#F5F1EA] border border-[#1C1A17]/10 text-[#1C1A17] font-utility text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  {size}
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(size)}
                    className="hover:text-red-500 transition-colors"
                    aria-label={`Remove size ${size}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}
            </div>
          )}
        </section>

        {/* ================= Images ================= */}
        <section className="bg-white rounded-3xl border border-[#1C1A17]/5 shadow-[0_1px_2px_rgba(28,26,23,0.04)] p-6 sm:p-8">
          <header className="mb-6 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#1C1A17] text-[#F5F1EA] text-xs font-semibold flex items-center justify-center">
                4
              </span>
              <div>
                <h2 className="font-editorial text-xl text-[#1C1A17]">
                  Images
                </h2>
                <p className="font-utility text-xs text-[#8A6A52]">
                  First image becomes the cover
                </p>
              </div>
            </div>
            <span className="font-utility text-xs font-medium text-[#8A6A52] bg-[#F5F1EA] px-3 py-1.5 rounded-full">
              {images.length}/6
            </span>
          </header>

          <label
            htmlFor="images-input"
            className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-10 px-6 cursor-pointer transition-all ${
              errors.images
                ? "border-red-400 bg-red-50/40"
                : "border-[#1C1A17]/15 hover:border-[#1C1A17]/40 bg-[#F7F4EE]/60 hover:bg-[#F7F4EE]"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
              <UploadCloud className="w-5 h-5 text-[#8A6A52]" />
            </div>
            <div className="text-center">
              <p className="font-utility text-sm text-[#1C1A17] font-medium">
                Click to upload images
              </p>
              <p className="font-utility text-xs text-[#8A6A52] mt-1">
                PNG, JPG or WEBP — up to 5MB each, max 6 images
              </p>
            </div>
            <input
              id="images-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImages}
              className="sr-only"
            />
          </label>
          {errors.images && (
            <p className="font-utility text-xs text-red-500 mt-2">
              {errors.images}
            </p>
          )}

          {preview.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-5">
              <AnimatePresence initial={false}>
                {preview.map((url, idx) => (
                  <motion.div
                    key={url}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-[#F5F1EA] border border-[#1C1A17]/10"
                  >
                    {url && (
                      <Image
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        unoptimized
                      />
                    )}

                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-[#1C1A17] text-[#F5F1EA] text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full">
                        Cover
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove image ${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#8A6A52] font-utility text-xs pt-3">
              <ImageIcon className="w-3.5 h-3.5" />
              The first image will be used as the cover.
            </div>
          )}
        </section>

        {/* ================= Flags ================= */}
        <section className="bg-white rounded-3xl border border-[#1C1A17]/5 shadow-[0_1px_2px_rgba(28,26,23,0.04)] p-6 sm:p-8">
          <header className="mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#1C1A17] text-[#F5F1EA] text-xs font-semibold flex items-center justify-center">
              5
            </span>
            <div>
              <h2 className="font-editorial text-xl text-[#1C1A17]">Flags</h2>
              <p className="font-utility text-xs text-[#8A6A52]">
                Highlight this product on the storefront
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`flex items-start gap-3 rounded-2xl px-4 py-4 cursor-pointer border transition-all ${
                form.bestseller
                  ? "bg-[#1C1A17]/5 border-[#1C1A17]/20"
                  : "bg-[#F7F4EE]/60 border-transparent hover:bg-[#F7F4EE]"
              }`}
            >
              <span className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  name="bestseller"
                  checked={form.bestseller}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <span
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    form.bestseller
                      ? "bg-[#1C1A17] border-[#1C1A17]"
                      : "border-[#1C1A17]/30 bg-white"
                  }`}
                >
                  {form.bestseller && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </span>
              </span>
              <span>
                <span className="block font-utility text-sm font-medium text-[#1C1A17]">
                  Bestseller
                </span>
                <span className="block font-utility text-xs text-[#8A6A52] mt-0.5">
                  Show a &ldquo;Bestseller&rdquo; badge on the product card.
                </span>
              </span>
            </label>

            <label
              className={`flex items-start gap-3 rounded-2xl px-4 py-4 cursor-pointer border transition-all ${
                form.newArrival
                  ? "bg-[#1C1A17]/5 border-[#1C1A17]/20"
                  : "bg-[#F7F4EE]/60 border-transparent hover:bg-[#F7F4EE]"
              }`}
            >
              <span className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  name="newArrival"
                  checked={form.newArrival}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <span
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    form.newArrival
                      ? "bg-[#1C1A17] border-[#1C1A17]"
                      : "border-[#1C1A17]/30 bg-white"
                  }`}
                >
                  {form.newArrival && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </span>
              </span>
              <span>
                <span className="block font-utility text-sm font-medium text-[#1C1A17]">
                  New arrival
                </span>
                <span className="block font-utility text-xs text-[#8A6A52] mt-0.5">
                  Mark as a new arrival on the homepage.
                </span>
              </span>
            </label>
          </div>
        </section>

        {/* ================= Actions ================= */}
        <div className="sticky bottom-4 z-10">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#1C1A17]/5 shadow-[0_8px_24px_rgba(28,26,23,0.08)] p-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="w-full sm:w-auto font-utility text-sm font-medium text-[#4A463F] hover:text-[#1C1A17] px-6 py-3 rounded-full transition-colors"
            >
              Reset
            </button>

            <motion.button
              type="submit"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1C1A17] text-[#F5F1EA] px-8 py-3.5 rounded-full font-utility font-medium text-sm hover:bg-[#332F29] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create product
                </>
              )}
            </motion.button>
          </div>
        </div>
      </form>

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
