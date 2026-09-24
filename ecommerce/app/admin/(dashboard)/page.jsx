"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Package, PackagePlus, RefreshCw, ShoppingBag, Users, Wallet } from "lucide-react";
import { fetchDashboardOverview, isRequestCanceled, isUnauthorized } from "@/lib/adminDashboardApi";
import { formatCedis } from "@/lib/formatCurrency";
import DashboardStatCard from "@/components/admin/dashboard/DashboardStatCard";
import RecentOrders from "@/components/admin/dashboard/RecentOrders";
import RecentUsers from "@/components/admin/dashboard/RecentUsers";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import OrderStatistics from "@/components/admin/dashboard/OrderStatistics";
import StockAlerts from "@/components/admin/dashboard/StockAlerts";
import PageHeader from "@/components/admin/ui/PageHeader";
import Button from "@/components/admin/ui/Button";
import { Card } from "@/components/admin/ui/Card";
import { ErrorState, InlineAlert, friendlyError } from "@/components/admin/ui/States";

const formatCount = (n) => Number(n || 0).toLocaleString("en-GH");

export default function AdminOverview() {
  const router = useRouter();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [products, setProducts] = useState(null);
  const [productsError, setProductsError] = useState(null);

  const [reloadKey, setReloadKey] = useState(0);

  const handleUnauthorized = useCallback(() => {
    router.replace("/admin/admin-login");
  }, [router]);

  /* ---------------------------------------------------------
     Overview (stats, recent orders/users, order statistics)
     and the product list for stock alerts, in parallel
  --------------------------------------------------------- */
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const loadOverview = async () => {
      try {
        setLoading(true);
        setError(null);
        setOverview(await fetchDashboardOverview({ signal }));
      } catch (err) {
        if (isRequestCanceled(err)) return;
        if (isUnauthorized(err)) return handleUnauthorized();

        console.error(err);
        setError(friendlyError(err, "The dashboard couldn't be loaded."));
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    const loadProducts = async () => {
      try {
        setProductsError(null);
        const { data } = await axios.get("/api/list", { signal });
        setProducts(data.list || []);
      } catch (err) {
        if (isRequestCanceled(err) || isUnauthorized(err)) return;

        console.error(err);
        setProductsError(friendlyError(err, "Stock levels couldn't be loaded."));
      }
    };

    loadOverview();
    loadProducts();

    return () => controller.abort();
  }, [reloadKey, handleUnauthorized]);

  const reload = () => setReloadKey((k) => k + 1);

  const stats = overview?.stats;
  const changes = overview?.changes;
  // Skeletons only on first load; a refresh keeps showing current numbers
  const showSkeleton = loading && !overview;

  const statCards = [
    {
      title: "Revenue",
      value: formatCedis(stats?.totalRevenue),
      icon: Wallet,
      change: changes?.revenue,
      formatChange: formatCedis,
    },
    {
      title: "Orders",
      value: formatCount(stats?.totalOrders),
      icon: ShoppingBag,
      change: changes?.orders,
    },
    {
      title: "Customers",
      value: formatCount(stats?.totalUsers),
      icon: Users,
      change: changes?.users,
    },
    {
      title: "Products",
      value: formatCount(stats?.totalProducts),
      icon: Package,
      change: changes?.products,
      formatChange: (n) => `${formatCount(n)} added`,
    },
  ];

  return (
    <>
      <PageHeader
        title="Overview"
        description="Sales, orders and stock across the store."
        actions={
          <>
            <Button icon={RefreshCw} onClick={reload} loading={loading && Boolean(overview)} disabled={loading}>
              Refresh
            </Button>
            <Button variant="primary" icon={PackagePlus} href="/admin/add-product">
              Add product
            </Button>
          </>
        }
      />

      {/* Nothing to show yet: one clear error with a retry */}
      {error && !overview ? (
        <Card>
          <ErrorState
            title="Couldn't load the dashboard"
            message={error}
            onRetry={reload}
            retrying={loading}
          />
        </Card>
      ) : (
        <div className="space-y-4 lg:space-y-5">
          {/* A refresh failed: keep the last numbers and say so */}
          {error && <InlineAlert>{error} Showing the last loaded figures.</InlineAlert>}

          <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 lg:gap-4 xl:grid-cols-4">
            {statCards.map((card) => (
              <DashboardStatCard key={card.title} {...card} loading={showSkeleton} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:gap-5 xl:grid-cols-3">
            <div className="min-w-0 xl:col-span-2">
              <RevenueChart onUnauthorized={handleUnauthorized} />
            </div>
            <OrderStatistics statistics={overview?.orderStatistics} loading={showSkeleton} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:gap-5 xl:grid-cols-3">
            <div className="min-w-0 xl:col-span-2">
              <RecentOrders orders={overview?.recentOrders} loading={showSkeleton} />
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 xl:grid-cols-1">
              <StockAlerts
                products={products}
                loading={products === null && !productsError}
                error={productsError}
                onRetry={reload}
              />
              <RecentUsers users={overview?.recentUsers} loading={showSkeleton} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
