"use client";

import { useEffect, useState } from "react";
import { Check, Plus, RotateCcw, Save, X } from "lucide-react";
import { formatCedis } from "@/lib/formatCurrency";
import Button from "@/components/admin/ui/Button";
import { Card, CardHeader, CARD_X } from "@/components/admin/ui/Card";
import { Field, INPUT, TEXTAREA, PrefixInput, describedBy } from "@/components/admin/ui/Field";
import { InlineAlert } from "@/components/admin/ui/States";
import ImageUploader, { existingImages, releaseImage } from "@/components/admin/products/ImageUploader";
import useUnsavedChangesWarning from "@/components/admin/settings/useUnsavedChangesWarning";

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "",
  subCategory: "",
  price: "",
  offerPrice: "",
  stock: "",
  bestseller: false,
  newArrival: false,
};

const SIZE_SUGGESTIONS = ["XS", "S", "M", "L", "XL", "XXL"];
const DESCRIPTION_MAX = 2000;

// Order matters: the first invalid field in this list gets focus
const FIELD_ORDER = ["name", "description", "category", "images", "price", "offerPrice", "stock"];

// Saved product -> form state (numbers become strings so inputs can hold "")
function fromProduct(product) {
  if (!product) return { form: EMPTY_FORM, sizes: [], images: [] };

  return {
    form: {
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      subCategory: product.subCategory || "",
      price: product.price != null ? String(product.price) : "",
      offerPrice: Number(product.offerPrice) > 0 ? String(product.offerPrice) : "",
      stock: product.stock != null ? String(product.stock) : "",
      bestseller: Boolean(product.bestseller),
      newArrival: Boolean(product.newArrival),
    },
    sizes: product.sizes || [],
    images: existingImages(product.images),
  };
}

// Comparable fingerprint of the form, for unsaved-change detection
const snapshotOf = (form, sizes, images) =>
  JSON.stringify([
    { ...form, offerPrice: Number(form.offerPrice) || 0, stock: Number(form.stock) || 0 },
    sizes,
    images.map((i) => (i.file ? `new:${i.key}` : i.url)),
  ]);

const EMPTY_SNAPSHOT = snapshotOf(EMPTY_FORM, [], []);

function validate(form, images) {
  const errors = {};
  const price = Number(form.price);
  const offer = Number(form.offerPrice);
  const stock = Number(form.stock);

  if (!form.name.trim()) errors.name = "Enter a product name.";
  if (!form.description.trim()) errors.description = "Add a short description.";
  if (!form.category.trim()) errors.category = "Choose or type a category.";
  if (images.length === 0) errors.images = "Add at least one image.";
  if (!form.price || !(price > 0)) errors.price = "Enter a price greater than 0.";
  if (form.offerPrice !== "" && (offer < 0 || Number.isNaN(offer))) {
    errors.offerPrice = "Offer price can't be negative.";
  } else if (offer > 0 && price > 0 && offer >= price) {
    errors.offerPrice = "Offer price must be lower than the regular price.";
  }
  if (form.stock !== "" && (!Number.isInteger(stock) || stock < 0)) {
    errors.stock = "Stock must be a whole number, 0 or more.";
  }

  return errors;
}

function Toggle({ id, label, description, checked, onChange }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 py-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink ${
          checked ? "border-ink bg-ink" : "border-ink/30 bg-white"
        }`}
        aria-hidden="true"
      >
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="mt-0.5 block text-[13px] text-muted">{description}</span>
      </span>
    </label>
  );
}

/*
  The product form, shared by Add product and Edit product so both look
  and behave the same.

  mode:      "create" | "edit"
  product:   the saved product when editing
  onSubmit:  async (formData) => savedProduct
             Throw an Error to show its message; attach `fieldErrors`
             ({ field: message }) to mark fields. Return null when the
             page has navigated away (e.g. session expired).
  aside:     extra cards above the save card (edit: product info)

  FormData carries the /api/add-product fields plus `imageOrder`:
  the final image order, each entry an existing URL or "new:<n>" for
  the n-th file in `images`.
*/
export default function ProductForm({ mode = "create", product = null, onSubmit, aside }) {
  const editing = mode === "edit";

  const [initial] = useState(() => fromProduct(product));
  const [form, setForm] = useState(initial.form);
  const [images, setImages] = useState(initial.images);
  const [sizes, setSizes] = useState(initial.sizes);
  const [baseline, setBaseline] = useState(() => snapshotOf(initial.form, initial.sizes, initial.images));
  const [savedProduct, setSavedProduct] = useState(product);

  const [sizeInput, setSizeInput] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Existing categories, to suggest while typing (optional nicety)
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/products/categories", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.success && setCategoryOptions(data.categories || []))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const subCategoryOptions =
    categoryOptions.find((c) => c.name.toLowerCase() === form.category.trim().toLowerCase())?.subCategories || [];

  const dirty = snapshotOf(form, sizes, images) !== baseline || Boolean(sizeInput.trim());

  useUnsavedChangesWarning(
    dirty && !loading,
    editing
      ? "You have unsaved changes to this product. Leave and discard them?"
      : "This product hasn't been saved yet. Leave and discard it?",
  );

  /* Handlers */
  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleChange = (e) => setField(e.target.name, e.target.value);

  const handleImages = (next) => {
    setImages(next);
    if (errors.images && next.length) setErrors((prev) => ({ ...prev, images: undefined }));
  };

  const addSize = (value) => {
    const trimmed = value.trim();
    if (!trimmed || sizes.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
    setSizes((prev) => [...prev, trimmed]);
  };

  const handleAddSize = () => {
    addSize(sizeInput);
    setSizeInput("");
  };

  const removeSize = (size) => setSizes((prev) => prev.filter((s) => s !== size));

  // Replace everything in the form (create: blank, edit: the saved product)
  const loadFrom = (source) => {
    images.forEach(releaseImage);
    const next = fromProduct(source);
    setForm(next.form);
    setImages(next.images);
    setSizes(next.sizes);
    setSizeInput("");
    setErrors({});
    setSubmitError(null);
    setBaseline(source ? snapshotOf(next.form, next.sizes, next.images) : EMPTY_SNAPSHOT);
  };

  const focusFirstError = (errs) => {
    const first = FIELD_ORDER.find((key) => errs[key]);
    if (!first) return;
    // The images card itself is focusable (tabIndex -1), the rest are inputs
    const el = document.getElementById(`product-${first}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus?.({ preventScroll: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const nextErrors = validate(form, images);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      focusFirstError(nextErrors);
      return;
    }

    try {
      setLoading(true);
      // A size typed but not yet added still counts
      const sizesForSubmission = sizeInput.trim() ? [...new Set([...sizes, sizeInput.trim()])] : sizes;

      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("category", form.category.trim());
      formData.append("subCategory", form.subCategory.trim());
      formData.append("price", Number(form.price));
      formData.append("offerPrice", Number(form.offerPrice) || 0);
      formData.append("stock", Number(form.stock) || 0);
      formData.append("bestseller", form.bestseller);
      formData.append("newArrival", form.newArrival);
      formData.append("sizes", JSON.stringify(sizesForSubmission));

      let newCount = 0;
      const imageOrder = images.map((item) => {
        if (!item.file) return item.url;
        formData.append("images", item.file);
        return `new:${newCount++}`;
      });
      formData.append("imageOrder", JSON.stringify(imageOrder));

      const saved = await onSubmit(formData);
      if (saved === null) return; // navigated away

      if (editing) {
        setSavedProduct(saved);
        loadFrom(saved);
      } else {
        loadFrom(null);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      if (err.fieldErrors) {
        setErrors(err.fieldErrors);
        focusFirstError(err.fieldErrors);
      }
      setSubmitError(
        err instanceof TypeError ? "Can't reach the server. Check your connection and try again." : err.message,
      );
      if (!err.fieldErrors) window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const price = Number(form.price);
  const offer = Number(form.offerPrice);
  const discount = price > 0 && offer > 0 && offer < price ? Math.round((1 - offer / price) * 100) : null;
  const errorCount = Object.values(errors).filter(Boolean).length;
  const hasNewImages = images.some((i) => i.file);

  const checklist = [
    { label: "Name and description", done: form.name.trim() && form.description.trim() },
    { label: "Category", done: form.category.trim() },
    { label: "At least one image", done: images.length > 0 },
    { label: "Price", done: price > 0 },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate>
      {(submitError || errorCount > 0) && (
        <div className="mb-4">
          <InlineAlert>
            {submitError ||
              `${errorCount} ${errorCount === 1 ? "field needs" : "fields need"} attention before the product can be saved.`}
          </InlineAlert>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5">
        {/* ================= Main column ================= */}
        <div className="min-w-0 space-y-4 lg:space-y-5">
          <Card aria-labelledby="details-title">
            <CardHeader id="details-title" title="Product details" border />
            <div className={`${CARD_X} space-y-4 py-4 sm:py-5`}>
              <Field id="product-name" label="Name" required error={errors.name}>
                <input
                  id="product-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Dusty pink corset mini dress"
                  maxLength={160}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={describedBy("product-name", { error: errors.name })}
                  className={INPUT}
                />
              </Field>

              <Field
                id="product-description"
                label="Description"
                required
                error={errors.description}
                hint={`Fabric, fit and care. ${form.description.length}/${DESCRIPTION_MAX}`}
              >
                <textarea
                  id="product-description"
                  name="description"
                  rows={5}
                  value={form.description}
                  onChange={handleChange}
                  maxLength={DESCRIPTION_MAX}
                  placeholder="Describe the fabric, fit and when to wear it"
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={describedBy("product-description", { error: errors.description, hint: true })}
                  className={`${TEXTAREA} resize-y`}
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  id="product-category"
                  label="Category"
                  required
                  error={errors.category}
                  hint={categoryOptions.length ? "Pick an existing one or type a new one" : undefined}
                >
                  <input
                    id="product-category"
                    name="category"
                    type="text"
                    list="category-options"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g. Dresses"
                    autoComplete="off"
                    aria-invalid={Boolean(errors.category)}
                    aria-describedby={describedBy("product-category", {
                      error: errors.category,
                      hint: categoryOptions.length,
                    })}
                    className={INPUT}
                  />
                  <datalist id="category-options">
                    {categoryOptions.map((c) => (
                      <option key={c.name} value={c.name} />
                    ))}
                  </datalist>
                </Field>

                <Field id="product-subCategory" label="Subcategory" optional>
                  <input
                    id="product-subCategory"
                    name="subCategory"
                    type="text"
                    list="subcategory-options"
                    value={form.subCategory}
                    onChange={handleChange}
                    placeholder="e.g. Mini dresses"
                    autoComplete="off"
                    className={INPUT}
                  />
                  <datalist id="subcategory-options">
                    {subCategoryOptions.map((s) => (
                      <option key={s.name} value={s.name} />
                    ))}
                  </datalist>
                </Field>
              </div>
            </div>
          </Card>

          <Card aria-labelledby="images-title" id="product-images" tabIndex={-1}>
            <CardHeader
              id="images-title"
              title={
                <>
                  Images<span className="ml-0.5 text-danger" aria-hidden="true">*</span>
                </>
              }
              description="The first image is the cover on product cards. Use the arrows to reorder."
              border
            />
            <div className={`${CARD_X} py-4 sm:py-5`}>
              <ImageUploader
                items={images}
                onChange={handleImages}
                error={errors.images}
                uploading={loading}
                markNew={editing}
                describedBy={errors.images ? "product-images-error" : undefined}
              />
              {errors.images && (
                <p id="product-images-error" className="mt-2 text-[13px] text-danger">
                  {errors.images}
                </p>
              )}
            </div>
          </Card>

          <Card aria-labelledby="pricing-title">
            <CardHeader id="pricing-title" title="Pricing" border />
            <div className={`${CARD_X} grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 sm:py-5`}>
              <Field id="product-price" label="Price" required error={errors.price}>
                <PrefixInput
                  prefix="GH₵"
                  id="product-price"
                  name="price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  aria-invalid={Boolean(errors.price)}
                  aria-describedby={describedBy("product-price", { error: errors.price })}
                />
              </Field>

              <Field
                id="product-offerPrice"
                label="Offer price"
                optional
                error={errors.offerPrice}
                hint={
                  discount
                    ? `Shows as ${discount}% off: ${formatCedis(offer)} instead of ${formatCedis(price)}`
                    : "Set a lower price to put this product on sale"
                }
              >
                <PrefixInput
                  prefix="GH₵"
                  id="product-offerPrice"
                  name="offerPrice"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={form.offerPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  aria-invalid={Boolean(errors.offerPrice)}
                  aria-describedby={describedBy("product-offerPrice", { error: errors.offerPrice, hint: true })}
                />
              </Field>
            </div>
          </Card>

          <Card aria-labelledby="inventory-title">
            <CardHeader id="inventory-title" title="Inventory" border />
            <div className={`${CARD_X} space-y-4 py-4 sm:py-5`}>
              <Field
                id="product-stock"
                label="Stock"
                optional
                error={errors.stock}
                hint="Units available to sell. Leave empty for 0."
                className="sm:max-w-[calc(50%-0.5rem)]"
              >
                <input
                  id="product-stock"
                  name="stock"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  aria-invalid={Boolean(errors.stock)}
                  aria-describedby={describedBy("product-stock", { error: errors.stock, hint: true })}
                  className={`${INPUT} tabular-nums`}
                />
              </Field>

              <div>
                <Field
                  id="product-size"
                  label="Sizes"
                  optional
                  hint="Leave empty for one-size products. Press Enter to add each size."
                >
                  <div className="flex gap-2">
                    <input
                      id="product-size"
                      type="text"
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSize();
                        }
                      }}
                      placeholder="e.g. M or 12"
                      aria-describedby="product-size-hint"
                      className={INPUT}
                    />
                    <Button icon={Plus} onClick={handleAddSize} disabled={!sizeInput.trim()} className="h-11 sm:h-10">
                      Add
                    </Button>
                  </div>
                </Field>

                {/* Common sizes not yet added, one tap each */}
                {SIZE_SUGGESTIONS.some((s) => !sizes.includes(s)) && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 text-xs text-muted">Quick add:</span>
                    {SIZE_SUGGESTIONS.filter((s) => !sizes.includes(s)).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => addSize(size)}
                        className="h-8 min-w-9 rounded border border-dashed border-ink/25 px-2 text-xs text-ink-soft transition-colors hover:border-ink hover:text-ink"
                        aria-label={`Add size ${size}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}

                {sizes.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Added sizes">
                    {sizes.map((size) => (
                      <li
                        key={size}
                        className="inline-flex h-8 items-center gap-1 rounded border border-line bg-paper pr-1 pl-2.5 text-[13px] font-medium text-ink"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="flex h-6 w-6 items-center justify-center rounded text-muted transition-colors hover:bg-danger-tint hover:text-danger"
                          aria-label={`Remove size ${size}`}
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* ================= Side column ================= */}
        <div className="min-w-0 space-y-4 lg:sticky lg:top-8 lg:space-y-5">
          {aside}

          <Card aria-labelledby="visibility-title">
            <CardHeader id="visibility-title" title="Storefront highlights" border />
            <div className={`${CARD_X} divide-y divide-line py-1`}>
              <Toggle
                id="product-bestseller"
                label="Bestseller"
                description="Listed in the homepage bestsellers and the bestseller filter."
                checked={form.bestseller}
                onChange={(v) => setField("bestseller", v)}
              />
              <Toggle
                id="product-newArrival"
                label="New arrival"
                description="Marks the product as a new arrival in the store."
                checked={form.newArrival}
                onChange={(v) => setField("newArrival", v)}
              />
            </div>
          </Card>

          <Card aria-labelledby="publish-title">
            <CardHeader id="publish-title" title={editing ? "Save changes" : "Ready to save"} border />
            <div className={`${CARD_X} py-4`}>
              {editing ? (
                <p className="flex items-center gap-2 text-[13px]" role="status">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${dirty ? "bg-warning-mark" : "bg-success"}`}
                    aria-hidden="true"
                  />
                  <span className={dirty ? "text-warning" : "text-muted"}>
                    {dirty ? "You have unsaved changes." : "All changes saved."}
                  </span>
                </p>
              ) : (
                <ul className="space-y-2">
                  {checklist.map((item) => (
                    <li key={item.label} className="flex items-center gap-2 text-[13px]">
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                          item.done ? "bg-success text-white" : "border border-ink/25"
                        }`}
                        aria-hidden="true"
                      >
                        {item.done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                      </span>
                      <span className={item.done ? "text-ink" : "text-muted"}>
                        {item.label}
                        <span className="sr-only">{item.done ? " (done)" : " (to do)"}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 flex flex-col gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  icon={editing ? Save : Plus}
                  loading={loading}
                  loadingText={hasNewImages ? "Uploading images..." : "Saving..."}
                  disabled={editing && !dirty}
                  className="w-full"
                >
                  {editing ? "Save changes" : "Create product"}
                </Button>
                <Button
                  variant="ghost"
                  icon={editing ? RotateCcw : undefined}
                  onClick={() => loadFrom(editing ? savedProduct : null)}
                  disabled={loading || !dirty}
                  className="w-full"
                >
                  {editing ? "Discard changes" : "Clear form"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
