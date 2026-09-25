"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";
import ProductImage from "@/components/card/ProductImage";
import useProducts from "@/lib/useProducts";
import { formatCedis } from "@/lib/formatCurrency";
import { getUnitPrice } from "@/lib/pricing";
import { STORE_CATEGORIES, shopCategoryHref } from "@/lib/categories";
import { fadeIn } from "@/lib/storeMotion";

const MIN_CHARS = 2;

/*
  Search drawn under the navbar. Typing shows up to four matching
  products straight from /api/products; Enter opens the full results
  on the shop page.
*/
export default function SearchPanel({ onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Wait for a pause in typing before asking the server
  useEffect(() => {
    const timer = setTimeout(() => setQuery(term.trim()), 250);
    return () => clearTimeout(timer);
  }, [term]);

  const enabled = query.length >= MIN_CHARS;
  const { products, pagination, loading } = useProducts(
    { search: query, limit: 4 },
    { enabled },
  );

  const submit = (e) => {
    e.preventDefault();
    const value = term.trim();
    router.push(value ? `/shop?search=${encodeURIComponent(value)}` : "/shop");
    onClose();
  };

  const total = pagination?.totalProducts ?? 0;
  // Each state (browse, loading, results for a query) fades in when it appears
  const view = !enabled ? "browse" : loading ? "loading" : `${products.length ? "results" : "empty"}:${query}`;

  return (
    <div className="page-x py-5 sm:py-8">
      <form onSubmit={submit} role="search" className="flex items-center gap-3 rounded-full border border-line bg-white py-1 pr-1.5 pl-5 shadow-soft transition-[border-color,box-shadow] focus-within:border-ink focus-within:ring-4 focus-within:ring-terracotta/10">
        <Search className="h-5 w-5 shrink-0 text-taupe" aria-hidden="true" />
        <label htmlFor="site-search" className="sr-only">
          Search products
        </label>
        <input
          ref={inputRef}
          id="site-search"
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search dresses, tops, bags..."
          autoComplete="off"
          enterKeyHint="search"
          className="min-h-12 w-full bg-transparent font-display text-[22px] text-ink outline-none placeholder:text-muted/55 sm:text-[26px] [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream text-ink-soft transition-colors hover:bg-sand hover:text-ink"
          aria-label="Close search"
        >
          <X className="h-5 w-5" />
        </button>
      </form>

      <motion.div key={view} variants={fadeIn} initial="hidden" animate="show" className="mt-6 min-h-24" aria-live="polite">
        {!enabled ? (
          <div>
            <p className="eyebrow mb-3">Browse categories</p>
            <div className="flex flex-wrap gap-2">
              {STORE_CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={shopCategoryHref(c.slug)}
                  onClick={onClose}
                  className="chip"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4" aria-busy="true">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex gap-3">
                <div className="skeleton h-20 w-16 shrink-0 rounded-field" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-[15px] text-muted">
            No products match &ldquo;{query}&rdquo;. Try a different word or browse the{" "}
            <Link href="/shop" onClick={onClose} className="link text-ink">
              full collection
            </Link>
            .
          </p>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <li key={p._id}>
                  <Link href={`/product/${p._id}`} onClick={onClose} className="group flex gap-3">
                    <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-field bg-sand">
                      <ProductImage src={p.images?.[0]} alt="" sizes="64px" className="object-cover" />
                    </span>
                    <span className="min-w-0 pt-1">
                      <span className="line-clamp-2 text-sm text-ink group-hover:underline decoration-ink/30 underline-offset-4">
                        {p.name}
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-ink">{formatCedis(getUnitPrice(p))}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`/shop?search=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="link-arrow mt-6"
            >
              See all {total} {total === 1 ? "result" : "results"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
