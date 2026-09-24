"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { ChevronRight, RefreshCw, SearchX, ShoppingBag } from "lucide-react";
import { isUnauthorized } from "@/lib/adminDashboardApi";
import { ORDER_STATUSES, DEFAULT_ORDER_STATUS } from "@/lib/orderStatus";
import { formatCedis } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import PageHeader from "@/components/admin/ui/PageHeader";
import Button from "@/components/admin/ui/Button";
import { Card } from "@/components/admin/ui/Card";
import { OrderStatusBadge, PaymentBadge } from "@/components/admin/ui/Badge";
import SearchInput from "@/components/admin/ui/SearchInput";
import { Select } from "@/components/admin/ui/Field";
import { TABLE, TD, TH, TR } from "@/components/admin/ui/Table";
import { ConfirmDialog } from "@/components/admin/ui/Dialog";
import { useToast } from "@/components/admin/ui/Toast";
import { EmptyState, ErrorState, InlineAlert, Skeleton, friendlyError } from "@/components/admin/ui/States";
import OrderDrawer from "@/components/admin/orders/OrderDrawer";
import { customerOf, itemCount, orderLines, orderTotal, shortOrderId } from "@/components/admin/orders/orderUtils";

const STATUS_TABS = ["all", ...ORDER_STATUSES];

function OrdersSkeleton() {
  return (
    <Card>
      <div className="divide-y divide-line">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="hidden h-5 w-20 sm:block" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function Orders() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [ordersData, setOrderData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(() => {
    const initial = searchParams.get("status");
    return ORDER_STATUSES.includes(initial) ? initial : "all";
  });
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Product names/prices for older orders without a line-item snapshot
  const [products, setProducts] = useState([]);

  // Order shown in the details drawer (opened from ?order=<id> too)
  const [selectedId, setSelectedId] = useState(() => searchParams.get("order"));
  const [updating, setUpdating] = useState(null); // "status" | "payment" | null

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleError = (error, fallback) => {
    if (isUnauthorized(error)) {
      router.replace("/admin/admin-login");
      return true;
    }
    console.error(error);
    toast.error(friendlyError(error, fallback));
    return false;
  };

  /* ---------------------------------------------------------
     Fetch orders (and products for older orders)
  --------------------------------------------------------- */
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data }, productsRes] = await Promise.all([
          axios.get("/api/orders"),
          axios.get("/api/list").catch(() => null),
        ]);

        if (productsRes?.data?.success) setProducts(productsRes.data.list || []);

        if (!data.success) throw new Error(data.message || "Failed to fetch orders");
        setOrderData(data.orders || []);
        setLoadError(null);
        setLoaded(true);
      } catch (error) {
        // Orders are admin-only: send signed-out/expired sessions to login
        if (isUnauthorized(error)) {
          router.replace("/admin/admin-login");
          return;
        }
        console.error(error);
        setLoadError(friendlyError(error, "Orders couldn't be loaded."));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [reloadKey, router]);

  // Refresh / Retry
  const fetchOrdersData = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  /* ---------------------------------------------------------
     Updates (same PATCH/DELETE calls as before)
  --------------------------------------------------------- */
  const patchOrder = (id, changes) =>
    setOrderData((prev) => prev.map((o) => (o._id === id ? { ...o, ...changes } : o)));

  const handleOrderStatus = async (order, orderStatus) => {
    if (orderStatus === (order.orderStatus || DEFAULT_ORDER_STATUS)) return;
    try {
      setUpdating("status");
      const { data } = await axios.patch(`/api/orders?id=${order._id}`, { orderStatus });
      if (!data.success) throw new Error(data.message || "Failed to update status");

      patchOrder(order._id, { orderStatus });
      toast.success(`Order ${shortOrderId(order._id)} is now ${orderStatus.toLowerCase()}.`);
    } catch (error) {
      handleError(error, "The status couldn't be updated. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const handleTogglePayment = async (order) => {
    const payment = !order.payment;
    try {
      setUpdating("payment");
      const { data } = await axios.patch(`/api/orders?id=${order._id}`, { payment });
      if (!data.success) throw new Error(data.message || "Failed to update payment");

      patchOrder(order._id, { payment });
      toast.success(`Order ${shortOrderId(order._id)} marked as ${payment ? "paid" : "unpaid"}.`);
    } catch (error) {
      handleError(error, "The payment status couldn't be updated. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const handleConfirmDelete = async () => {
    const order = pendingDelete;
    if (!order) return;

    try {
      setDeleting(true);
      const { data } = await axios.delete(`/api/orders?id=${order._id}`);
      if (!data.success) throw new Error(data.message || "Failed to delete order");

      setOrderData((prev) => prev.filter((o) => o._id !== order._id));
      setSelectedId(null);
      toast.success(`Order ${shortOrderId(order._id)} was deleted.`);
    } catch (error) {
      handleError(error, "The order couldn't be deleted. Please try again.");
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  /* ---------------------------------------------------------
     Derived data
  --------------------------------------------------------- */
  const productsById = useMemo(() => new Map(products.map((p) => [String(p._id), p])), [products]);

  const rows = useMemo(
    () =>
      ordersData.map((order) => {
        const lines = orderLines(order, productsById);
        return {
          order,
          status: order.orderStatus || DEFAULT_ORDER_STATUS,
          customer: customerOf(order),
          items: itemCount(lines),
          total: orderTotal(order, lines),
        };
      }),
    [ordersData, productsById],
  );

  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(STATUS_TABS.map((s) => [s, 0]));
    for (const row of rows) {
      counts.all++;
      if (row.status in counts) counts[row.status]++;
    }
    return counts;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter(({ order, status, customer }) => {
      const matchesSearch =
        !q ||
        String(order._id).toLowerCase().includes(q.replace(/^#/, "")) ||
        customer.name.toLowerCase().includes(q) ||
        customer.phone.toLowerCase().includes(q) ||
        order.paymentMethod?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesPayment =
        paymentFilter === "all" || (paymentFilter === "paid" ? Boolean(order.payment) : !order.payment);
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [rows, search, statusFilter, paymentFilter]);

  const selectedOrder = ordersData.find((o) => o._id === selectedId) || null;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
  };

  /* ---------------------------------------------------------
     Render
  --------------------------------------------------------- */
  let content;

  if (!loaded && loading) {
    content = <OrdersSkeleton />;
  } else if (!loaded && loadError) {
    content = (
      <Card>
        <ErrorState title="Couldn't load orders" message={loadError} onRetry={fetchOrdersData} retrying={loading} />
      </Card>
    );
  } else if (ordersData.length === 0) {
    content = (
      <Card>
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          message="When customers check out, their orders appear here for you to process."
        />
      </Card>
    );
  } else if (filtered.length === 0) {
    content = (
      <Card>
        <EmptyState
          icon={SearchX}
          title="No orders match"
          message="Try another search, or clear the filters to see every order."
          action={<Button onClick={clearFilters}>Clear filters</Button>}
        />
      </Card>
    );
  } else {
    content = (
      <Card className="overflow-hidden">
        {/* Phones: one card per order, whole card opens the details */}
        <ul className="divide-y divide-line md:hidden">
          {filtered.map(({ order, status, customer, items, total }) => (
            <li key={order._id}>
              <button
                type="button"
                onClick={() => setSelectedId(order._id)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-ink/2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-medium text-ink">{customer.name || "Guest"}</p>
                    <p className="shrink-0 text-sm font-medium text-ink tabular-nums">{formatCedis(total)}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    <span className="font-mono">{shortOrderId(order._id)}</span> · {formatDate(order.createdAt)} ·{" "}
                    {items} {items === 1 ? "item" : "items"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <OrderStatusBadge status={status} />
                    <PaymentBadge paid={Boolean(order.payment)} />
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                <span className="sr-only">View order details</span>
              </button>
            </li>
          ))}
        </ul>

        {/* md and up: table; clicking a row opens the details */}
        <div className="hidden overflow-x-auto md:block">
          <table className={TABLE}>
            <thead>
              <tr>
                <th scope="col" className={`${TH} border-t-0`}>Order</th>
                <th scope="col" className={`${TH} border-t-0`}>Customer</th>
                <th scope="col" className={`${TH} hidden border-t-0 lg:table-cell`}>Date</th>
                <th scope="col" className={`${TH} border-t-0`}>Payment</th>
                <th scope="col" className={`${TH} border-t-0`}>Status</th>
                <th scope="col" className={`${TH} border-t-0 text-right`}>Total</th>
                <th scope="col" className={`${TH} w-px border-t-0`}>
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ order, status, customer, items, total }) => (
                <tr
                  key={order._id}
                  onClick={() => setSelectedId(order._id)}
                  className={`${TR} cursor-pointer ${selectedId === order._id ? "bg-ink/3" : ""}`}
                >
                  <td className={TD}>
                    <p className="font-mono text-[13px] font-medium text-ink">{shortOrderId(order._id)}</p>
                    <p className="text-xs text-muted">
                      {items} {items === 1 ? "item" : "items"}
                      <span className="lg:hidden"> · {formatDate(order.createdAt)}</span>
                    </p>
                  </td>
                  <td className={`${TD} max-w-55`}>
                    <p className="truncate text-ink">{customer.name || "Guest"}</p>
                    {customer.phone && <p className="truncate text-xs text-muted">{customer.phone}</p>}
                  </td>
                  <td className={`${TD} hidden whitespace-nowrap text-ink-soft lg:table-cell`}>
                    {formatDate(order.createdAt)}
                  </td>
                  <td className={TD}>
                    <PaymentBadge paid={Boolean(order.payment)} />
                    <p className="mt-1 text-xs whitespace-nowrap text-muted">{order.paymentMethod || "—"}</p>
                  </td>
                  <td className={TD}>
                    <OrderStatusBadge status={status} />
                  </td>
                  <td className={`${TD} text-right font-medium whitespace-nowrap text-ink tabular-nums`}>
                    {formatCedis(total)}
                  </td>
                  <td className={TD}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(order._id);
                      }}
                      aria-label={`View order ${shortOrderId(order._id)}`}
                    >
                      View
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length !== ordersData.length && (
          <p className="border-t border-line px-4 py-2.5 text-xs text-muted sm:px-5">
            Showing {filtered.length} of {ordersData.length} orders
          </p>
        )}
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title="Orders"
        description={
          loaded
            ? `${statusCounts.Processing} awaiting dispatch · ${ordersData.length} in total`
            : "Process, track and update customer orders."
        }
        actions={
          <Button icon={RefreshCw} onClick={fetchOrdersData} loading={loading && loaded} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {loaded && ordersData.length > 0 && (
        <div className="mb-4 space-y-3">
          {/* Status tabs: scroll sideways on phones instead of wrapping */}
          <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="inline-flex min-w-max gap-1 rounded-md border border-line bg-white p-1" role="group" aria-label="Filter by status">
              {STATUS_TABS.map((s) => {
                const active = statusFilter === s;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setStatusFilter(s)}
                    className={`inline-flex h-9 items-center gap-1.5 rounded px-3 text-[13px] transition-colors sm:h-8 ${
                      active ? "bg-ink font-medium text-white" : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                    }`}
                  >
                    {s === "all" ? "All" : s}
                    <span className={`tabular-nums ${active ? "text-white/70" : "text-muted"}`}>{statusCounts[s]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_180px]">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by customer, phone or order number"
              label="Search orders"
            />
            <Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} aria-label="Filter by payment">
              <option value="all">All payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </Select>
          </div>
        </div>
      )}

      {loaded && loadError && (
        <div className="mb-4">
          <InlineAlert>{loadError} Showing the last loaded orders.</InlineAlert>
        </div>
      )}

      {content}

      <OrderDrawer
        order={selectedOrder}
        productsById={productsById}
        updating={updating}
        onClose={() => setSelectedId(null)}
        onStatusChange={handleOrderStatus}
        onTogglePayment={handleTogglePayment}
        onDelete={setPendingDelete}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this order?"
        message={
          pendingDelete && (
            <p>
              Order <span className="font-mono font-medium text-ink">{shortOrderId(pendingDelete._id)}</span>
              {pendingDelete.address?.fullName ? ` from ${pendingDelete.address.fullName}` : ""} will be permanently
              removed, including from revenue totals. To stop an order without losing its record, set its status to
              Cancelled instead.
            </p>
          )
        }
        confirmLabel="Delete order"
        cancelLabel="Keep order"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <Orders />
    </Suspense>
  );
}
