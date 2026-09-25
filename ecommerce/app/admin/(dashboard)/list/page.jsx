"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Package, PackagePlus, Pencil, RefreshCw, SearchX, Trash2 } from "lucide-react";
import { formatCedis } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { stockLevel } from "@/lib/orderStatus";
import PageHeader from "@/components/admin/ui/PageHeader";
import Button from "@/components/admin/ui/Button";
import Badge, { StockBadge } from "@/components/admin/ui/Badge";
import { Card } from "@/components/admin/ui/Card";
import SearchInput from "@/components/admin/ui/SearchInput";
import { Select } from "@/components/admin/ui/Field";
import { TABLE, TD, TH, TR } from "@/components/admin/ui/Table";
import { ConfirmDialog } from "@/components/admin/ui/Dialog";
import ProductDetailsModal from "@/components/admin/products/ProductDetailsModal";
import { rowVariants } from "@/lib/adminMotion";
import { useToast } from "@/components/admin/ui/Toast";
import { EmptyState, ErrorState, InlineAlert, Skeleton, friendlyError } from "@/components/admin/ui/States";

const STOCK_FILTERS = [
  { value: "all", label: "Any stock" },
  { value: "attention", label: "Needs attention" },
  { value: "in", label: "In stock" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
];

const matchesStock = (product, filter) => {
  if (filter === "all") return true;
  const level = stockLevel(product.stock);
  if (filter === "attention") return level === "low" || level === "out";
  return level === filter;
};

const hasOffer = (p) => Number(p.offerPrice) > 0 && Number(p.offerPrice) < Number(p.price);

const productId = (p) => p._id || p.id;

/* ------------------------------------------------------------------
   Small pieces
------------------------------------------------------------------ */
function Thumb({ product, size = "h-11 w-9" }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded border border-line bg-paper ${size}`}>
      {product.images?.[0] ? (
        <Image src={product.images[0]} alt="" fill sizes="48px" className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Package className="h-4 w-4 text-muted" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

function Price({ product }) {
  if (!hasOffer(product)) {
    return <span className="font-medium text-ink tabular-nums">{formatCedis(product.price)}</span>;
  }

  const off = Math.round((1 - Number(product.offerPrice) / Number(product.price)) * 100);

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2 tabular-nums">
      <span className="font-medium text-ink">{formatCedis(product.offerPrice)}</span>
      <span className="text-xs text-muted line-through">
        <span className="sr-only">was </span>
        {formatCedis(product.price)}
      </span>
      <span className="text-xs font-medium text-rose-deep">-{off}%</span>
    </span>
  );
}

function Flags({ product }) {
  if (!product.bestseller && !product.newArrival) return null;
  return (
    <span className="mt-1 flex flex-wrap gap-1">
      {product.bestseller && (
        <Badge tone="accent" dot={false}>
          Bestseller
        </Badge>
      )}
      {product.newArrival && <Badge dot={false}>New arrival</Badge>}
    </span>
  );
}

function RowActions({ product, deleting, onView, onDelete }) {
  const id = productId(product);
  return (
    <div className="flex items-center justify-end gap-1">
      <Button size="sm" icon={Pencil} href={`/admin/edit-product/${id}`} aria-label={`Edit ${product.name}`}>
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon={Eye}
        onClick={() => onView(product)}
        aria-haspopup="dialog"
        aria-label={`View details of ${product.name}`}
      >
        View
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon={Trash2}
        onClick={() => onDelete(product)}
        loading={deleting}
        className="hover:bg-danger-tint hover:text-danger"
        aria-label={`Delete ${product.name}`}
      >
        Delete
      </Button>
    </div>
  );
}

function ListSkeleton() {
  return (
    <Card>
      <div className="divide-y divide-line">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 sm:px-5">
            <Skeleton className="h-12 w-10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <Skeleton className="hidden h-3.5 w-20 sm:block" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------
   Page
------------------------------------------------------------------ */
function ProductList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [listData, setListData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState(() => {
    const initial = searchParams.get("stock");
    return STOCK_FILTERS.some((f) => f.value === initial) ? initial : "all";
  });

  const [pendingDelete, setPendingDelete] = useState(null);
  // Product shown in the details modal
  const [viewing, setViewing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /* Fetch */
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/list", { method: "GET" });
        if (res.status === 401 || res.status === 403) {
          router.replace("/admin/admin-login");
          return;
        }
        if (!res.ok) throw Object.assign(new Error("Failed to fetch products"), { status: res.status });

        const data = await res.json();
        setListData(data.list || []);
        setLoadError(null);
        setLoaded(true);
      } catch (error) {
        console.error(error);
        setLoadError(friendlyError(error, "The product list couldn't be loaded."));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [reloadKey, router]);

  // Refresh / Retry
  const handleFetchList = () => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  };

  /* Delete */
  const handleConfirmDelete = async () => {
    const product = pendingDelete;
    if (!product) return;
    const id = productId(product);

    try {
      setDeletingId(id);

      const res = await fetch("/api/list", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.status === 401 || res.status === 403) {
        router.replace("/admin/admin-login");
        return;
      }
      if (!res.ok) throw Object.assign(new Error("Failed to delete product"), { status: res.status });

      setListData((prev) => prev.filter((p) => productId(p) !== id));
      toast.success(`"${product.name}" was deleted.`);
    } catch (error) {
      console.error(error);
      toast.error(`Couldn't delete "${product.name}". Please try again.`);
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  /* Derived */
  const categories = useMemo(
    () => [...new Set(listData.map((p) => p.category?.trim()).filter(Boolean))].sort(),
    [listData],
  );

  const counts = useMemo(() => {
    const levels = listData.map((p) => stockLevel(p.stock));
    return {
      low: levels.filter((l) => l === "low").length,
      out: levels.filter((l) => l === "out").length,
    };
  }, [listData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return listData.filter((p) => {
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.subCategory?.toLowerCase().includes(q);
      const matchesCategory = category === "all" || p.category?.trim() === category;
      return matchesSearch && matchesCategory && matchesStock(p, stockFilter);
    });
  }, [listData, search, category, stockFilter]);

  const filtersActive = search.trim() || category !== "all" || stockFilter !== "all";
  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setStockFilter("all");
  };

  /* Render */
  const summary = loaded ? (
    <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted">
      <span>
        <span className="font-medium text-ink tabular-nums">{listData.length}</span>{" "}
        {listData.length === 1 ? "product" : "products"}
      </span>
      {counts.low > 0 && (
        <span>
          <span className="font-medium text-warning tabular-nums">{counts.low}</span> low stock
        </span>
      )}
      {counts.out > 0 && (
        <span>
          <span className="font-medium text-danger tabular-nums">{counts.out}</span> out of stock
        </span>
      )}
    </p>
  ) : null;

  let content;

  if (!loaded && isLoading) {
    content = <ListSkeleton />;
  } else if (!loaded && loadError) {
    content = (
      <Card>
        <ErrorState title="Couldn't load products" message={loadError} onRetry={handleFetchList} retrying={isLoading} />
      </Card>
    );
  } else if (listData.length === 0) {
    content = (
      <Card>
        <EmptyState
          icon={Package}
          title="No products yet"
          message="Products you add appear here and in the store straight away."
          action={
            <Button variant="primary" icon={PackagePlus} href="/admin/add-product">
              Add your first product
            </Button>
          }
        />
      </Card>
    );
  } else if (filtered.length === 0) {
    content = (
      <Card>
        <EmptyState
          icon={SearchX}
          title="No products match"
          message="Try a different search term, or clear the filters to see every product."
          action={<Button onClick={clearFilters}>Clear filters</Button>}
        />
      </Card>
    );
  } else {
    content = (
      <Card className="overflow-hidden">
        {/* Phones: cards */}
        <ul className="divide-y divide-line md:hidden">
          <AnimatePresence>
            {filtered.map((product, index) => {
              const id = productId(product);
              return (
                <motion.li
                  key={id}
                  variants={rowVariants}
                  custom={index}
                  initial="hidden"
                  animate={deletingId === id ? { opacity: 0.5 } : "show"}
                  exit="exit"
                  className="p-4"
                >
                  <div className="flex gap-3">
                    <Thumb product={product} size="h-16 w-14" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium text-ink">{product.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {[product.category, product.subCategory].filter(Boolean).join(" · ") || "Uncategorised"}
                      </p>
                      <div className="mt-1.5 text-sm">
                        <Price product={product} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1">
                      <StockBadge stock={product.stock} />
                      <Flags product={product} />
                    </div>
                    <RowActions product={product} deleting={deletingId === id} onView={setViewing} onDelete={setPendingDelete} />
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        {/* md and up: table */}
        <div className="hidden overflow-x-auto md:block">
          <table className={TABLE}>
            <thead>
              <tr>
                <th scope="col" className={`${TH} border-t-0`}>Product</th>
                <th scope="col" className={`${TH} border-t-0`}>Category</th>
                <th scope="col" className={`${TH} border-t-0`}>Price</th>
                <th scope="col" className={`${TH} border-t-0`}>Stock</th>
                <th scope="col" className={`${TH} hidden border-t-0 xl:table-cell`}>Added</th>
                <th scope="col" className={`${TH} border-t-0 text-right`}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((product, index) => {
                  const id = productId(product);
                  return (
                    <motion.tr
                      key={id}
                      variants={rowVariants}
                      custom={index}
                      initial="hidden"
                      animate={deletingId === id ? { opacity: 0.5 } : "show"}
                      exit="exit"
                      className={TR}
                    >
                      <td className={TD}>
                        <div className="flex min-w-55 items-center gap-3">
                          <Thumb product={product} />
                          <div className="min-w-0">
                            <p className="line-clamp-2 font-medium text-ink">{product.name}</p>
                            <Flags product={product} />
                          </div>
                        </div>
                      </td>
                      <td className={`${TD} text-ink-soft`}>
                        <p className="whitespace-nowrap">{product.category || "—"}</p>
                        {product.subCategory && <p className="text-xs whitespace-nowrap text-muted">{product.subCategory}</p>}
                      </td>
                      <td className={`${TD} whitespace-nowrap`}>
                        <Price product={product} />
                      </td>
                      <td className={TD}>
                        <StockBadge stock={product.stock} />
                      </td>
                      <td className={`${TD} hidden whitespace-nowrap text-ink-soft xl:table-cell`}>
                        {formatDate(product.createdAt)}
                      </td>
                      <td className={TD}>
                        <RowActions product={product} deleting={deletingId === id} onView={setViewing} onDelete={setPendingDelete} />
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filtersActive && (
          <p className="border-t border-line px-4 py-2.5 text-xs text-muted sm:px-5">
            Showing {filtered.length} of {listData.length} products
          </p>
        )}
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title="Products"
        actions={
          <>
            <Button icon={RefreshCw} onClick={handleFetchList} loading={isLoading && loaded} disabled={isLoading}>
              Refresh
            </Button>
            <Button variant="primary" icon={PackagePlus} href="/admin/add-product">
              Add product
            </Button>
          </>
        }
      >
        {summary || <p className="mt-1 text-sm text-muted">Everything in your catalog.</p>}
      </PageHeader>

      {loaded && listData.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_200px_190px]">
          <SearchInput
            className="col-span-2 sm:col-span-1"
            value={search}
            onChange={setSearch}
            placeholder="Search by name or category"
            label="Search products"
          />
          <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} aria-label="Filter by stock level">
            {STOCK_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      {loaded && loadError && (
        <div className="mb-4">
          <InlineAlert>{loadError} Showing the last loaded list.</InlineAlert>
        </div>
      )}

      {content}

      <ProductDetailsModal
        product={viewing}
        onClose={() => setViewing(null)}
        onDelete={(product) => {
          setViewing(null);
          setPendingDelete(product);
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this product?"
        message={
          pendingDelete && (
            <p>
              <span className="font-medium text-ink">{pendingDelete.name}</span> will be permanently removed from your
              catalog and the storefront. This can&apos;t be undone.
            </p>
          )
        }
        confirmLabel="Delete product"
        cancelLabel="Keep product"
        loading={deletingId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

export default function ProductListPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <ProductList />
    </Suspense>
  );
}
