"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Trash2,
  Users as UsersIcon,
  Loader2,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import axios from "axios";
import LoadingSpinner from "@/ui/LoadingSpinner";
import Toast from "@/ui/Toast";
import ConfirmDialog from "@/ui/ConfirmDialog";

export default function Users() {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

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
     Fetch users
  --------------------------------------------------------- */
  const fetchUsersData = async () => {
    try {
      setLoading(true);
      setIsError(null);

      const { data } = await axios.get("/api/auth/users");

      if (data.success) {
        setUsersData(data.users || []);
      } else {
        throw new Error(data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Failed to load users";
      setIsError({ message });
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------
     Delete user
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

      const { data } = await axios.delete(`/api/auth/users?id=${id}`);

      if (data.success) {
        showSuccess("User deleted.");
        setUsersData((prev) => prev.filter((u) => u._id !== id));
      } else {
        throw new Error(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Failed to delete user";
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

  useEffect(() => {
    fetchUsersData();
  }, []);

  /* ---------------------------------------------------------
     Filter
  --------------------------------------------------------- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return usersData;

    return usersData.filter((u) => {
      const matches = (v) => v?.toLowerCase().includes(q);

      return (
        matches(u.fullName) ||
        matches(u.email) ||
        u.addresses?.some(
          (a) => matches(a.fullName) || matches(a.phone) || matches(a.city),
        )
      );
    });
  }, [usersData, search]);

  /* ---------------------------------------------------------
     Helpers
  --------------------------------------------------------- */
  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
    return (
      (parts[0][0] || "") + (parts[parts.length - 1][0] || "")
    ).toUpperCase();
  };

  const getPrimaryAddress = (user) =>
    user.addresses?.find((a) => a.id === user.selectedAddressId) ||
    user.addresses?.[0] ||
    null;

  const countCartItems = (user) => {
    const cart = user.cartData || {};
    return Object.values(cart).reduce(
      (sum, sizes) =>
        sum + Object.values(sizes).reduce((s, q) => s + (Number(q) || 0), 0),
      0,
    );
  };

  /* ---------------------------------------------------------
     Loading
  --------------------------------------------------------- */
  if (loading && usersData.length === 0) {
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
          Customers
        </h1>
        <p className="text-sm text-[#8A6A52]">
          All registered customers on your store.
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
            placeholder="Search by name, email, or phone..."
            className="w-full bg-transparent outline-none text-sm text-[#1C1A17] placeholder:text-[#8A6A52]/50"
          />
        </div>

        <button
          type="button"
          onClick={fetchUsersData}
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
            <UsersIcon className="w-6 h-6 text-[#8A6A52]" />
          </div>
          <div>
            <p className="text-2xl text-[#1C1A17] font-semibold">
              {usersData.length === 0 ? "No customers yet" : "No matches"}
            </p>
            <p className="text-sm text-[#8A6A52] mt-1">
              {usersData.length === 0
                ? "Customers will appear here once they sign up."
                : "Try a different search."}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#1C1A17]/5 shadow-[0_1px_2px_rgba(28,26,23,0.04)] overflow-hidden">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-[2fr_1.6fr_1fr_0.9fr_0.6fr_auto] gap-4 px-6 py-4 bg-[#FAF8F4] border-b border-[#1C1A17]/5 text-[11px] font-semibold uppercase tracking-wider text-[#8A6A52]">
            <p>Customer</p>
            <p>Contact</p>
            <p>Address</p>
            <p>Joined</p>
            <p>Cart</p>
            <p className="text-right">Actions</p>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#1C1A17]/5">
            <AnimatePresence initial={false}>
              {filtered.map((user) => {
                const id = user._id;
                const isDeleting = deletingId === id;
                const primaryAddress = getPrimaryAddress(user);
                const cartItems = countCartItems(user);

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className={`group grid grid-cols-1 md:grid-cols-[2fr_1.6fr_1fr_0.9fr_0.6fr_auto] gap-4 px-4 sm:px-6 py-4 items-center hover:bg-[#FAF8F4]/60 transition-colors ${
                      isDeleting ? "opacity-40 pointer-events-none" : ""
                    }`}
                  >
                    {/* Customer - avatar + name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#D98880]/15 text-[#D98880] flex items-center justify-center shrink-0 font-semibold text-sm">
                        {getInitials(user.fullName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1C1A17] truncate">
                          {user.fullName || "—"}
                        </p>
                        <p className="text-[11px] text-[#8A6A52] truncate">
                          #{String(id).slice(-8)}
                        </p>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="min-w-0 space-y-0.5">
                      {user.email && (
                        <div className="flex items-center gap-1.5 text-xs text-[#4A463F] truncate">
                          <Mail className="w-3 h-3 text-[#8A6A52] shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      )}
                      {primaryAddress?.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-[#8A6A52] truncate">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {primaryAddress.phone}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Address */}
                    <div className="min-w-0 text-xs text-[#4A463F]">
                      {primaryAddress ? (
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3 h-3 text-[#8A6A52] mt-0.5 shrink-0" />
                          <span className="line-clamp-2">
                            {primaryAddress.city ||
                              primaryAddress.address ||
                              "—"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#8A6A52]/60">No address</span>
                      )}
                    </div>

                    {/* Joined */}
                    <p className="text-sm text-[#4A463F]">
                      {formatDate(user.createdAt)}
                    </p>

                    {/* Cart */}
                    <p className="text-sm text-[#4A463F]">
                      {cartItems > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#F7F4EE] text-[11px] font-medium">
                          {cartItems}
                        </span>
                      ) : (
                        <span className="text-[#8A6A52]/60 text-xs">—</span>
                      )}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1.5 md:opacity-60 md:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleAskDelete(id)}
                        disabled={isDeleting}
                        className="w-9 h-9 flex items-center justify-center rounded-full text-[#8A6A52] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        aria-label="Delete customer"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
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
        title="Delete this customer?"
        message="This will permanently remove their account and cannot be undone."
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
