"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

export const TOGGLE_FILTERS = [
  { key: "inStock", label: "In stock only" },
  { key: "onSale", label: "On sale" },
  { key: "newArrival", label: "New arrivals" },
  { key: "bestseller", label: "Bestsellers" },
];

function Option({ selected, onClick, children, type = "radio" }) {
  return (
    <button
      type="button"
      role={type === "radio" ? "radio" : "checkbox"}
      aria-checked={selected}
      onClick={onClick}
      className="flex min-h-11 w-full items-center gap-3 text-left text-[15px] text-ink"
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center border transition-colors ${
          type === "radio" ? "rounded-full" : "rounded-[3px]"
        } ${selected ? "border-ink bg-ink text-cream" : "border-ink/30 bg-white"}`}
        aria-hidden="true"
      >
        {selected && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      {children}
    </button>
  );
}

/*
  Refinements that don't fit in the toolbar: subcategory and the
  availability/offer toggles. Every change is applied immediately (the
  grid updates behind the drawer); the footer button just closes it.
*/
export default function FilterDrawer({
  open,
  onClose,
  filters,
  subCategories,
  onChange,
  onClear,
  resultCount,
  loading,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("button")?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-200 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="fixed inset-y-0 right-0 z-201 flex w-[min(92vw,420px)] flex-col bg-paper"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
              <h2 className="text-[13px] font-medium tracking-[0.08em] uppercase">Filters</h2>
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-cream"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto overscroll-contain px-5 py-6">
              {subCategories.length > 0 && (
                <fieldset>
                  <legend className="eyebrow mb-2">Type</legend>
                  <div role="radiogroup">
                    <Option selected={!filters.subCategory} onClick={() => onChange({ subCategory: "" })}>
                      All types
                    </Option>
                    {subCategories.map((sub) => (
                      <Option
                        key={sub}
                        selected={filters.subCategory.toLowerCase() === sub.toLowerCase()}
                        onClick={() => onChange({ subCategory: sub })}
                      >
                        {sub}
                      </Option>
                    ))}
                  </div>
                </fieldset>
              )}

              <fieldset>
                <legend className="eyebrow mb-2">Show</legend>
                {TOGGLE_FILTERS.map(({ key, label }) => (
                  <Option
                    key={key}
                    type="checkbox"
                    selected={Boolean(filters[key])}
                    onClick={() => onChange({ [key]: !filters[key] })}
                  >
                    {label}
                  </Option>
                ))}
              </fieldset>
            </div>

            <div className="grid shrink-0 grid-cols-[auto_1fr] gap-3 border-t border-line p-4">
              <button type="button" onClick={onClear} className="btn-secondary">
                Clear
              </button>
              <button type="button" onClick={onClose} className="btn-primary">
                {loading ? "Show products" : `Show ${resultCount} ${resultCount === 1 ? "product" : "products"}`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
