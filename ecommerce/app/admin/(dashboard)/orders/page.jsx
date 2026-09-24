"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Trash2,
  Package,
  Loader2,
  AlertCircle,
  RefreshCw,
  Eye,
  ChevronDown,
  BadgeCheck,
  BadgeX,
} from "lucide-react";
import axios from "axios";
import LoadingSpinner from "@/ui/LoadingSpinner";
import Toast from "@/ui/Toast";
import ConfirmDialog from "@/ui/ConfirmDialog";
import { isUnauthorized } from "@/lib/adminDashboardApi";

/* ------------------------------------------------------------------
   Status options
------------------------------------------------------------------ */
const STATUS_OPTIONS = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Processing: "bg-blue-50 text-blue-700 border-blue-200",
  Shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Delivered: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

const DEFAULT_STATUS = "Pending";

export default function MyOrders() {
  const router = useRouter();
  const [ordersData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Product names/prices for order lines, from the admin product list
  const [products, setProducts] = useState([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

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

  /* ---------------------------------------------------------
     Fetch orders
  --------------------------------------------------------- */
  const fetchOrdersData = async () => {
    try {
      setLoading(true);
      setIsError(null);

      const [{ data }, productsRes] = await Promise.all([
        axios.get("/api/orders"),
        axios.get("/api/list").catch(() => null),
      ]);

      if (productsRes?.data?.success) {
        setProducts(productsRes.data.list || []);
      }

      if (data.success) {
        setOrderData(data.orders || []);
      } else {
        throw new Error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      // Orders are admin-only: send signed-out/expired sessions to login
      if (isUnauthorized(error)) {
        router.replace("/admin/admin-login");
        return;
      }

      console.error(error);
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Failed to load orders";
      setIsError({ message });
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------
     Delete
  --------------------------------------------------------- */
  const handleAskDelete = (id) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    const id = pendingDeleteId;
    if (!id) return;

    try {
      setDeletingId(id);

      const { data } = await axios.delete(`/api/orders?id=${id}`);

      if (data.success) {
        showSuccess("Order deleted.");
        setOrderData((prev) => prev.filter((o) => o._id !== id));
      } else {
        throw new Error(data.message || "Failed to delete order");
      }
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Failed to delete order";
      showError(message);
    } finally {
      setDeletingId(null);
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  /* ---------------------------------------------------------
     Update order status
  --------------------------------------------------------- */
  const handleOrderStatus = async (id, orderStatus) => {
    try {
      const { data } = await axios.patch(`/api/orders?id=${id}`, {
        orderStatus,
      });

      if (data.success) {
        showSuccess("Order status updated.");
        setOrderData((prev) =>
          prev.map((o) => (o._id === id ? { ...o, orderStatus } : o)),
        );
      } else {
        throw new Error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Failed to update status";
      showError(message);
    }
  };

  /* ---------------------------------------------------------
     Toggle payment status
  --------------------------------------------------------- */
  const handleTogglePayment = async (id, currentPayment) => {
    try {
      setUpdatingPaymentId(id);

      const nextPayment = !currentPayment;

      const { data } = await axios.patch(`/api/orders?id=${id}`, {
        payment: nextPayment,
      });

      if (data.success) {
        showSuccess(nextPayment ? "Marked as paid." : "Marked as unpaid.");
        setOrderData((prev) =>
          prev.map((o) => (o._id === id ? { ...o, payment: nextPayment } : o)),
        );
      } else {
        throw new Error(data.message || "Failed to update payment");
      }
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Failed to update payment";
      showError(message);
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  useEffect(() => {
    fetchOrdersData();
  }, []);

  /* ---------------------------------------------------------
     Filter
  --------------------------------------------------------- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return ordersData.filter((o) => {
      const matchesSearch =
        !q ||
        o._id?.toLowerCase().includes(q) ||
        o.address?.fullName?.toLowerCase().includes(q) ||
        o.address?.phone?.toLowerCase().includes(q) ||
        o.paymentMethod?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" || o.orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [ordersData, search, statusFilter]);

  /* ---------------------------------------------------------
     Helpers
  --------------------------------------------------------- */
  const formatPrice = (n) =>
    `GH₵${Number(n || 0).toLocaleString("en-GH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return date.toLocaleDateString("en-GH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const findProduct = (productId) =>
    products?.find((p) => String(p._id) === String(productId));

  const getUnitPrice = (product) =>
    Number(product?.offerPrice) || Number(product?.price) || 0;

  const itemCount = (order) => {
    if (!order?.items) return 0;
    if (Array.isArray(order.items)) return order.items.length;

    return Object.values(order.items).reduce(
      (sum, sizes) =>
        sum + Object.values(sizes).reduce((s, q) => s + (Number(q) || 0), 0),
      0,
    );
  };

  const computeOrderTotal = (order) => {
    if (!order?.items) return 0;

    return Object.entries(order.items).reduce(
      (orderTotal, [productId, sizes]) => {
        const product = findProduct(productId);
        if (!product) return orderTotal;

        const unitPrice = getUnitPrice(product);
        const qty = Object.values(sizes).reduce(
          (sum, q) => sum + (Number(q) || 0),
          0,
        );

        return orderTotal + unitPrice * qty;
      },
      0,
    );
  };

  const getOrderTotal = (order) => {
    if (typeof order.total === "number") return order.total;
    if (typeof order.totalAmount === "number") return order.totalAmount;
    if (typeof order.itemsTotal === "number") return order.itemsTotal;
    return computeOrderTotal(order);
  };

  const flattenItems = (order) => {
    // Orders placed after checkout pricing moved server-side carry a snapshot
    if (order?.lineItems?.length) {
      return order.lineItems.map((line) => ({
        key: `${order._id}-${line.product}-${line.size}`,
        productId: line.product,
        size: line.size,
        qty: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal,
        name: line.name,
      }));
    }

    if (!order?.items) return [];

    return Object.entries(order.items).flatMap(([productId, sizes]) => {
      const product = findProduct(productId);
      const unitPrice = getUnitPrice(product);

      return Object.entries(sizes)
        .filter(([, qty]) => Number(qty) > 0)
        .map(([size, qty]) => ({
          key: `${order._id}-${productId}-${size}`,
          productId,
          size,
          qty: Number(qty),
          unitPrice,
          lineTotal: unitPrice * Number(qty),
          name: product?.name || productId,
        }));
    });
  };

  const toggleExpand = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  /* ---------------------------------------------------------
     Loading
  --------------------------------------------------------- */
  if (loading && ordersData.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8A6A52]">
          Store
        </p>
        <h1 className="font-semibold text-3xl sm:text-4xl text-[#1C1A17]">
          Orders
        </h1>
        <p className="text-sm text-[#8A6A52]">
          Track and manage all customer orders.
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 bg-[#F7F4EE] border border-[#E5DDD1] rounded-full px-4 py-2.5 focus-within:bg-white focus-within:border-[#1C1A17] transition-colors">
          <Search className="w-4 h-4 text-[#8A6A52] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, phone, or order ID..."
            className="w-full bg-transparent outline-none text-sm text-[#1C1A17] placeholder:text-[#8A6A52]/50"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none w-full sm:w-auto bg-[#F7F4EE] border border-[#E5DDD1] hover:border-[#1C1A17] rounded-full pl-4 pr-10 py-2.5 text-sm text-[#1C1A17] outline-none cursor-pointer transition-colors"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[#8A6A52] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <button
          type="button"
          onClick={fetchOrdersData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-[#F7F4EE] border border-[#E5DDD1] hover:bg-white hover:border-[#1C1A17] text-[#1C1A17] px-5 py-2.5 rounded-full text-sm transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {isError && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4" />
          {isError.message}
        </div>
      )}

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#1C1A17]/5 shadow-[0_1px_2px_rgba(28,26,23,0.04)] py-16 px-6 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-[#F7F4EE] flex items-center justify-center">
            <Package className="w-6 h-6 text-[#8A6A52]" />
          </div>
          <div>
            <p className="text-2xl text-[#1C1A17] font-semibold">
              {ordersData.length === 0 ? "No orders yet" : "No matches"}
            </p>
            <p className="text-sm text-[#8A6A52] mt-1">
              {ordersData.length === 0
                ? "Orders will appear here as customers buy."
                : "Try a different search or filter."}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#1C1A17]/5 shadow-[0_1px_2px_rgba(28,26,23,0.04)] overflow-hidden">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-[1.2fr_1.6fr_1fr_1fr_1.4fr_1.4fr_auto] gap-4 px-6 py-4 bg-[#FAF8F4] border-b border-[#1C1A17]/5 text-[11px] font-semibold uppercase tracking-wider text-[#8A6A52]">
            <p>Order</p>
            <p>Customer</p>
            <p>Date</p>
            <p>Total</p>
            <p>Payment</p>
            <p>Status</p>
            <p className="text-right">Actions</p>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#1C1A17]/5">
            <AnimatePresence initial={false}>
              {filtered.map((order) => {
                const id = order._id;
                const isDeleting = deletingId === id;
                const isUpdatingPayment = updatingPaymentId === id;
                const isExpanded = expandedId === id;
                const status = order.orderStatus || DEFAULT_STATUS;
                const total = getOrderTotal(order);
                const items = flattenItems(order);
                const isPaid = Boolean(order.payment);

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className={
                      isDeleting ? "opacity-40 pointer-events-none" : ""
                    }
                  >
                    {/* Main row */}
                    <div className="group grid grid-cols-1 md:grid-cols-[1.2fr_1.6fr_1fr_1fr_1.4fr_1.4fr_auto] gap-4 px-4 sm:px-6 py-4 items-center hover:bg-[#FAF8F4]/60 transition-colors">
                      {/* Order ID + item count */}
                      <div className="min-w-0">
                        <p className="text-sm font-mono font-medium text-[#1C1A17] truncate">
                          #{String(id).slice(-8)}
                        </p>
                        <p className="text-[11px] text-[#8A6A52] mt-0.5">
                          {itemCount(order)}{" "}
                          {itemCount(order) === 1 ? "item" : "items"}
                        </p>
                      </div>

                      {/* Customer */}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1C1A17] truncate">
                          {order.address?.fullName || "—"}
                        </p>
                        <p className="text-xs text-[#8A6A52] truncate">
                          {order.address?.phone || ""}
                        </p>
                      </div>

                      {/* Date */}
                      <p className="text-sm text-[#4A463F]">
                        {formatDate(order.createdAt)}
                      </p>

                      {/* Total */}
                      <p className="text-sm font-semibold text-[#1C1A17]">
                        {formatPrice(total)}
                      </p>

                      {/* Payment */}
                      <div className="text-sm flex flex-col items-start gap-1">
                        <p className="text-[#1C1A17] truncate">
                          {order.paymentMethod || "—"}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleTogglePayment(id, order.payment)}
                          disabled={isUpdatingPayment || isDeleting}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors disabled:opacity-60 ${
                            isPaid
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          }`}
                          title={
                            isPaid
                              ? "Click to mark as unpaid"
                              : "Click to mark as paid"
                          }
                        >
                          {isUpdatingPayment ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isPaid ? (
                            <BadgeCheck className="w-3 h-3" />
                          ) : (
                            <BadgeX className="w-3 h-3" />
                          )}
                          {isPaid ? "Paid" : "Unpaid"}
                        </button>
                      </div>

                      {/* Status selector */}
                      <div className="relative">
                        <select
                          value={status}
                          onChange={(e) =>
                            handleOrderStatus(id, e.target.value)
                          }
                          disabled={isDeleting}
                          className={`appearance-none w-full px-3 py-1.5 pr-8 rounded-full text-[11px] font-semibold uppercase tracking-wider cursor-pointer outline-none border transition-colors ${
                            STATUS_STYLES[status] ||
                            STATUS_STYLES[DEFAULT_STATUS]
                          }`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option
                              key={s}
                              value={s}
                              className="bg-white text-[#1C1A17]"
                            >
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1.5 md:opacity-60 md:group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => toggleExpand(id)}
                          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                            isExpanded
                              ? "text-[#1C1A17] bg-[#1C1A17]/5"
                              : "text-[#8A6A52] hover:text-[#1C1A17] hover:bg-[#1C1A17]/5"
                          }`}
                          aria-label="View order items"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAskDelete(id)}
                          disabled={isDeleting}
                          className="w-9 h-9 flex items-center justify-center rounded-full text-[#8A6A52] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          aria-label="Delete order"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded item breakdown */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden bg-[#FAF8F4]/60 border-t border-[#1C1A17]/5"
                        >
                          <div className="px-4 sm:px-6 py-4 space-y-2">
                            {items.length === 0 ? (
                              <p className="text-xs text-[#8A6A52]">
                                No items to display.
                              </p>
                            ) : (
                              items.map((item) => (
                                <div
                                  key={item.key}
                                  className="flex items-center justify-between gap-3 text-sm"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[#1C1A17] font-medium truncate">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-[#8A6A52] mt-0.5">
                                      Size {item.size} · Qty × {item.qty} ·{" "}
                                      {formatPrice(item.unitPrice)} each
                                    </p>
                                  </div>
                                  <p className="text-[#1C1A17] font-semibold shrink-0">
                                    {formatPrice(item.lineTotal)}
                                  </p>
                                </div>
                              ))
                            )}

                            {/* Order total recap */}
                            <div className="pt-3 mt-2 border-t border-[#1C1A17]/10 flex items-center justify-between">
                              <span className="text-xs uppercase tracking-wider text-[#8A6A52] font-semibold">
                                Order total
                              </span>
                              <span className="text-base font-semibold text-[#1C1A17]">
                                {formatPrice(total)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete this order?"
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
