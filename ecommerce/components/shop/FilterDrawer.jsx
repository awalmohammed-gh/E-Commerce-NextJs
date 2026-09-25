"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

export const TOGGLE_FILTERS = [
  { key: "inStock", label: "In stock only" },
  { key: "onSale", label: "On sale" },
  { key: "newArrival", label: "New arrivals" },
  { key: "bestseller", label: "Bestsellers" },
];

// Phones get a bottom sheet, larger screens a drawer from the right
const WIDE = "(min-width: 640px)";
function subscribeWide(callback) {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const useIsWide = () => useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => true);

function Option({ selected, onClick, children, type = "radio" }) {
  return (
    <button
      type="button"
      role={type === "radio" ? "radio" : "checkbox"}
      aria-checked={selected}
      onClick={onClick}
      className="flex min-h-12 w-full items-center gap-3 rounded-field px-2 text-left text-[15px] text-ink transition-colors hover:bg-cream"
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center border transition-colors ${
          type === "radio" ? "rounded-full" : "rounded-md"
        } ${selected ? "border-terracotta-deep bg-terracotta-deep text-white" : "border-ink/25 bg-white"}`}
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
  const wide = useIsWide();
  const hidden = wide ? { x: "100%" } : { y: "100%" };

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
            className="fixed inset-0 z-200 bg-espresso-deep/45 backdrop-blur-sm"
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
            className="fixed inset-x-0 bottom-0 z-201 flex max-h-[88dvh] flex-col rounded-t-plate bg-paper shadow-lift sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:max-h-none sm:w-[420px] sm:rounded-t-none sm:rounded-l-plate"
            initial={hidden}
            animate={{ x: 0, y: 0 }}
            exit={hidden}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Grab handle (phones) */}
            <span className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-line sm:hidden" aria-hidden="true" />
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5 sm:h-18 sm:px-6">
              <h2 className="font-display text-[28px] leading-none">Filters</h2>
              <button
                type="button"
                onClick={onClose}
                className="-mr-1 flex h-11 w-11 items-center justify-center rounded-full border border-line transition-colors hover:border-ink"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto overscroll-contain px-3 py-6 sm:px-4">
              {subCategories.length > 0 && (
                <fieldset>
                  <legend className="eyebrow mb-2 px-2">Type</legend>
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
                <legend className="eyebrow mb-2 px-2">Show</legend>
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

            <div className="grid shrink-0 grid-cols-[auto_1fr] gap-3 border-t border-line bg-paper/90 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
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
