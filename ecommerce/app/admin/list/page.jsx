"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Trash2,
  Package,
  Loader2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import Toast from "@/ui/Toast";
import ConfirmDialog from "@/ui/ConfirmDialog";

export default function ProductList() {
  const [listData, setListData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isError, setIsError] = useState(null);
  const [search, setSearch] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingId, setPendingId] = useState(null);

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

  /* Fetch */
  const handleFetchList = async () => {
    try {
      setIsLoading(true);
      setIsError(null);

      const res = await fetch("/api/list", { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      setListData(data.list || []);
    } catch (error) {
      console.error(error);
      setIsError(error);
      showError(error.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  /* Delete */
  const handleAskDelete = (id) => {
    setPendingId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    const id = pendingId;
    if (!id) return;

    try {
      setDeletingId(id);

      const res = await fetch("/api/list", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete product");

      setListData((prev) => prev.filter((p) => (p._id || p.id) !== id));
      showSuccess("Product deleted.");
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
      setConfirmOpen(false);
      setPendingId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setPendingId(null);
  };

  useEffect(() => {
    handleFetchList();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return listData;

    return listData.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.subCategory?.toLowerCase().includes(q),
    );
  }, [listData, search]);

  /* Helpers */
  const formatPrice = (n) =>
    `GH₵${Number(n || 0).toLocaleString("en-GH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;

  const hasOffer = (p) =>
    p.offerPrice &&
    Number(p.offerPrice) > 0 &&
    Number(p.offerPrice) < Number(p.price);

  const stockBadge = (stock) => {
    const s = Number(stock);
    if (Number.isNaN(s))
      return { label: "—", cls: "bg-[#1C1A17]/[0.04] text-[#8A6A52]" };
    if (s === 0)
      return { label: "Out of stock", cls: "bg-red-50 text-red-600" };
    if (s < 5) return { label: `${s} left`, cls: "bg-amber-50 text-amber-600" };
    return { label: s, cls: "bg-green-50 text-green-700" };
  };

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap");
        .font-utility {
          font-family: "Work Sans", sans-serif;
        }
      `}</style>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-utility font-semibold text-xl text-[#1C1A17]">
            Product list
          </h1>
          <p className="font-utility text-[13px] text-[#8A6A52] mt-0.5">
            All the dresses and products currently in your catalog
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2.5 flex-1 bg-white border border-[#1C1A17]/12 rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#1C1A17]/10 focus-within:border-[#1C1A17]/40 transition-all">
          <Search className="w-4 h-4 text-[#8A6A52] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-transparent outline-none font-utility text-sm text-[#1C1A17] placeholder:text-[#1C1A17]/30"
          />
        </div>

        <button
          type="button"
          onClick={handleFetchList}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 bg-white border border-[#1C1A17]/12 hover:border-[#1C1A17]/30 text-[#1C1A17] px-4 py-2.5 rounded-xl font-utility text-sm font-medium transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {isError && (
        <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 font-utility text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {isError.message || "Something went wrong loading the list."}
        </div>
      )}

      {/* Content */}
      {isLoading && listData.length === 0 ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-[#8A6A52] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#1C1A17]/8 py-16 px-6 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#1C1A17]/[0.04] flex items-center justify-center">
            <Package className="w-5 h-5 text-[#8A6A52]" />
          </div>
          <div>
            <p className="font-utility font-semibold text-base text-[#1C1A17]">
              {listData.length === 0 ? "No products yet" : "No matches"}
            </p>
            <p className="font-utility text-sm text-[#8A6A52] mt-1">
              {listData.length === 0
                ? "Add your first product to get started."
                : "Try a different search term."}
            </p>
          </div>
          {listData.length === 0 && (
            <Link
              href="/admin/add-product"
              className="mt-2 inline-flex items-center gap-2 bg-[#1C1A17] text-[#F5F1EA] px-5 py-2.5 rounded-xl font-utility text-sm font-medium hover:bg-[#332F29] transition-colors"
            >
              Add product
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#1C1A17]/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-[#1C1A17]/8">
                  <th className="text-left font-utility text-xs font-medium text-[#8A6A52] px-6 py-3.5 w-[34%]">
                    Product
                  </th>
                  <th className="text-left font-utility text-xs font-medium text-[#8A6A52] px-4 py-3.5">
                    Category
                  </th>
                  <th className="text-left font-utility text-xs font-medium text-[#8A6A52] px-4 py-3.5">
                    Price
                  </th>
                  <th className="text-left font-utility text-xs font-medium text-[#8A6A52] px-4 py-3.5">
                    Offer price
                  </th>
                  <th className="text-left font-utility text-xs font-medium text-[#8A6A52] px-4 py-3.5">
                    Stock
                  </th>
                  <th className="text-right font-utility text-xs font-medium text-[#8A6A52] px-6 py-3.5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filtered.map((product) => {
                    const id = product._id || product.id;
                    const isDeleting = deletingId === id;
                    const offer = hasOffer(product);
                    const stock = stockBadge(product.stock);

                    return (
                      <motion.tr
                        key={id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.2 }}
                        className={`group border-b border-[#1C1A17]/6 last:border-b-0 hover:bg-[#1C1A17]/[0.02] transition-colors ${
                          isDeleting ? "opacity-40 pointer-events-none" : ""
                        }`}
                      >
                        {/* Product */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className="relative w-12 h-14 shrink-0 rounded-lg overflow-hidden bg-[#1C1A17]/[0.04] border border-[#1C1A17]/8">
                              {product.images?.[0] ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-4 h-4 text-[#8A6A52]" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-utility text-sm font-medium text-[#1C1A17] line-clamp-2 leading-snug">
                                {product.name}
                              </p>
                              {product.subCategory && (
                                <p className="font-utility text-xs text-[#8A6A52] mt-0.5">
                                  {product.subCategory}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4">
                          <p className="font-utility text-sm text-[#4A463F]">
                            {product.category || "—"}
                          </p>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-4">
                          <p
                            className={`font-utility text-sm ${
                              offer
                                ? "text-[#8A6A52] line-through"
                                : "font-semibold text-[#1C1A17]"
                            }`}
                          >
                            {formatPrice(product.price)}
                          </p>
                        </td>

                        {/* Offer Price */}
                        <td className="px-4 py-4">
                          {offer ? (
                            <span className="font-utility text-sm font-semibold text-[#1C1A17]">
                              {formatPrice(product.offerPrice)}
                            </span>
                          ) : (
                            <span className="font-utility text-sm text-[#1C1A17]/25">
                              —
                            </span>
                          )}
                        </td>

                        {/* Stock badge */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg font-utility text-xs font-medium ${stock.cls}`}
                          >
                            {stock.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Link
                              href={`/product/${id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8A6A52] hover:text-[#1C1A17] hover:bg-[#1C1A17]/[0.06] transition-colors"
                              aria-label="View product"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleAskDelete(id)}
                              disabled={isDeleting}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8A6A52] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                              aria-label="Delete product"
                            >
                              {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete this product?"
        message="This action cannot be undone."
        confirmText="Yes, delete"
        cancelText="No, keep it"
        loading={deletingId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

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
