"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { VIEWPORT, cardVariants } from "@/lib/storeMotion";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/card/ProductCard";
import {
  PRODUCT_GRID,
  ProductGridSkeleton,
  ProductsEmpty,
  ProductsError,
} from "@/components/card/ProductStates";
import ShopBanner from "@/components/shop/ShopBanner";
import FilterDrawer, { TOGGLE_FILTERS } from "@/components/shop/FilterDrawer";
import Pagination from "@/components/shop/Pagination";
import { fetchCategories } from "@/lib/productsApi";
import useProducts from "@/lib/useProducts";
import {
  STORE_CATEGORIES,
  categoryLabel,
  findStoreCategory,
  shopCategoryHref,
} from "@/lib/categories";

const PRODUCTS_PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
];

const same = (a, b) => (a || "").toLowerCase() === (b || "").toLowerCase();

export default function ShopPage() {
  // useSearchParams needs a Suspense boundary
  return (
    <Suspense
      fallback={
        <>
          <div className="border-b border-line bg-ivory-fade" aria-hidden="true">
            <div className="page-x space-y-4 py-10 lg:py-14">
              <div className="skeleton h-3 w-32" />
              <div className="skeleton h-16 w-72" />
            </div>
          </div>
          <div className="page-x py-10">
            <ProductGridSkeleton count={8} />
          </div>
        </>
      }
    >
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ---------------------------------------------------------
     Filters live in the URL so links, back/forward and the
     navbar search all work. Every change triggers a new
     /api/products request - filtering happens in MongoDB.
  --------------------------------------------------------- */
  const filters = {
    category: searchParams.get("category") || "",
    subCategory: searchParams.get("subCategory") || "",
    search: searchParams.get("search") || "",
    sort: searchParams.get("sort") || "newest",
    page: Math.max(1, Number(searchParams.get("page")) || 1),
    bestseller: searchParams.get("bestseller") === "true",
    newArrival: searchParams.get("newArrival") === "true",
    onSale: searchParams.get("onSale") === "true",
    inStock: searchParams.get("inStock") === "true",
  };

  const updateFilters = (patch) => {
    const next = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(patch)) {
      if (value === "" || value === null || value === false || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    }

    // Any filter change starts again from page 1
    if (!("page" in patch)) next.delete("page");
    if (next.get("page") === "1") next.delete("page");

    const qs = next.toString();
    router.push(qs ? `/shop?${qs}` : "/shop", { scroll: false });
  };

  const { products, pagination, loading, error, retry } = useProducts({
    ...filters,
    limit: PRODUCTS_PER_PAGE,
  });

  const totalProducts = pagination?.totalProducts ?? 0;
  const totalPages = pagination?.totalPages ?? 0;

  /* ---------------------------------------------------------
     Subcategories (for the filter drawer) from MongoDB
  --------------------------------------------------------- */
  const [categoryTree, setCategoryTree] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories({ signal: controller.signal })
      .then(setCategoryTree)
      .catch((err) => {
        if (!controller.signal.aborted) console.error(err);
      });
    return () => controller.abort();
  }, []);

  const dbCategory = categoryTree.find((c) => same(c.name, filters.category));
  const subCategories = filters.category
    ? (dbCategory?.subCategories || []).map((s) => s.name)
    : [...new Set(categoryTree.flatMap((c) => c.subCategories.map((s) => s.name)))];

  /* ---------------------------------------------------------
     Search box - debounced into the URL
  --------------------------------------------------------- */
  const [searchInput, setSearchInput] = useState(filters.search);
  const [syncedSearch, setSyncedSearch] = useState(filters.search);

  // Keep the box in sync when the URL changes (e.g. navbar search)
  if (filters.search !== syncedSearch) {
    setSyncedSearch(filters.search);
    setSearchInput(filters.search);
  }

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === filters.search) return;

    const timer = setTimeout(() => updateFilters({ search: trimmed }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const clearFilters = () => {
    setSearchInput("");
    router.push("/shop", { scroll: false });
  };

  const goToPage = (page) => {
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------------------------------------------------
     Banner text follows the URL
  --------------------------------------------------------- */
  const storeCategory = findStoreCategory(filters.category);
  const catLabel = categoryLabel(filters.category);

  let title = "Shop";
  let eyebrow = null;
  let description = "Everything in the Eleoka collection.";

  if (filters.search) {
    eyebrow = "Search";
    title = `“${filters.search}”`;
    description = null;
  } else if (filters.category) {
    title = filters.subCategory || catLabel;
    eyebrow = filters.subCategory ? catLabel : null;
    description = storeCategory?.blurb || null;
  } else if (filters.onSale) {
    title = "On sale";
    description = "Pieces with a reduced price, while stock lasts.";
  } else if (filters.newArrival || searchParams.get("sort") === "newest") {
    title = "New in";
    description = "The latest additions to the collection.";
  } else if (filters.bestseller) {
    title = "Bestsellers";
    description = "The pieces customers keep coming back for.";
  }

  const crumbs = [{ label: "Shop", href: "/shop" }];
  if (filters.category) crumbs.push({ label: catLabel });
  else if (title !== "Shop") crumbs.push({ label: filters.search ? "Search" : title });

  const activeToggles = TOGGLE_FILTERS.filter(({ key }) => filters[key]);
  const activeCount = activeToggles.length + (filters.subCategory ? 1 : 0);
  const hasFilters = Boolean(filters.category || filters.search) || activeCount > 0;

  return (
    <>
      <ShopBanner
        title={title}
        eyebrow={eyebrow}
        description={description}
        crumbs={crumbs}
        showSlidesOnMobile={!hasFilters}
      />

      {/* Category bar: stays under the navbar while browsing */}
      <div className="sticky top-16 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-xl backdrop-saturate-150 lg:top-18">
        <nav aria-label="Categories" className="page-x">
          <ul className="-mx-4 flex gap-1.5 overflow-x-auto px-4 py-2.5 no-scrollbar sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0">
            {[{ slug: "", label: "All" }, ...STORE_CATEGORIES].map((c) => {
              const active = c.slug ? same(c.slug, filters.category) || same(c.label, filters.category) : !filters.category;
              return (
                <li key={c.slug || "all"} className="shrink-0">
                  <Link
                    href={c.slug ? shopCategoryHref(c.slug) : "/shop"}
                    scroll={false}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-10 items-center rounded-full px-4 text-[13.5px] whitespace-nowrap transition-colors duration-300 ${
                      active ? "bg-ink font-medium text-paper" : "text-ink-soft hover:bg-cream hover:text-ink"
                    }`}
                  >
                    {c.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="page-x pt-7 pb-16 sm:pt-9 sm:pb-24">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="order-2 text-[12px] font-semibold tracking-[0.14em] text-muted uppercase md:order-1" aria-live="polite">
            {loading ? "Loading products..." : `${totalProducts} ${totalProducts === 1 ? "product" : "products"}`}
          </p>

          <div className="order-1 flex flex-col gap-3 sm:flex-row sm:items-center md:order-2">
            <label className="relative block sm:w-64">
              <span className="sr-only">Search products</span>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-taupe" aria-hidden="true" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products"
                enterKeyHint="search"
                className="field min-h-11 rounded-full pl-10 text-[14px]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="btn-secondary min-h-11 px-5 text-[14px] font-medium tracking-normal normal-case"
                aria-haspopup="dialog"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filters{activeCount > 0 && ` (${activeCount})`}
              </button>

              <label className="relative block">
                <span className="sr-only">Sort products</span>
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilters({ sort: e.target.value === "newest" ? "" : e.target.value })}
                  className="field min-h-11 cursor-pointer appearance-none rounded-full pr-10 pl-5 text-[14px] sm:w-56"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-taupe" aria-hidden="true" />
              </label>
            </div>
          </div>
        </div>

        {/* Active refinements */}
        {(filters.subCategory || activeToggles.length > 0 || filters.search) && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active filters">
            {filters.search && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    updateFilters({ search: "" });
                  }}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-terracotta-tint pr-2.5 pl-3.5 text-[13px] font-medium text-terracotta-deep transition-colors hover:bg-terracotta hover:text-white"
                  aria-label={`Remove search ${filters.search}`}
                >
                  Search: {filters.search}
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            )}
            {filters.subCategory && (
              <li>
                <button
                  type="button"
                  onClick={() => updateFilters({ subCategory: "" })}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-terracotta-tint pr-2.5 pl-3.5 text-[13px] font-medium text-terracotta-deep transition-colors hover:bg-terracotta hover:text-white"
                  aria-label={`Remove ${filters.subCategory} filter`}
                >
                  {filters.subCategory}
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            )}
            {activeToggles.map(({ key, label }) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => updateFilters({ [key]: false })}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-terracotta-tint pr-2.5 pl-3.5 text-[13px] font-medium text-terracotta-deep transition-colors hover:bg-terracotta hover:text-white"
                  aria-label={`Remove ${label} filter`}
                >
                  {label}
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
            <li>
              <button type="button" onClick={clearFilters} className="link min-h-9 px-2 text-[13px] text-ink-soft">
                Clear all
              </button>
            </li>
          </ul>
        )}

        {/* Results */}
        <div className="mt-9">
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : error ? (
            <ProductsError onRetry={retry} />
          ) : products.length === 0 ? (
            hasFilters ? (
              <ProductsEmpty
                title={filters.search ? `No results for “${filters.search}”` : "Nothing matches these filters"}
                message={
                  filters.category && !filters.search && activeCount === 0
                    ? `We don't have any ${catLabel.toLowerCase()} in stock right now. New pieces arrive regularly.`
                    : "Try a different word, fewer filters or another category."
                }
                action={
                  <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <button type="button" onClick={clearFilters} className="btn-primary">
                      See all products
                    </button>
                  </div>
                }
              />
            ) : (
              <ProductsEmpty
                title="The collection is being restocked"
                message="New pieces are on the way. Please check back soon."
              />
            )
          ) : (
            <ul className={PRODUCT_GRID}>
              {products.map((product, index) => (
                <motion.li
                  key={product._id}
                  variants={cardVariants}
                  custom={index}
                  initial="hidden"
                  whileInView="show"
                  viewport={VIEWPORT}
                >
                  <ProductCard product={product} priority={index < 4} />
                </motion.li>
              ))}
            </ul>
          )}

          {!loading && !error && (
            <Pagination page={filters.page} totalPages={totalPages} onChange={goToPage} />
          )}
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        filters={filters}
        subCategories={subCategories}
        onChange={updateFilters}
        onClear={() => {
          closeDrawer();
          clearFilters();
        }}
        resultCount={totalProducts}
        loading={loading}
      />
    </>
  );
}
