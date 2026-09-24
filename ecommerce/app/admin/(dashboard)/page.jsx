"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ShoppingBag, Package, Wallet, AlertCircle } from "lucide-react";
import {
  fetchDashboardOverview,
  getErrorMessage,
  isRequestCanceled,
  isUnauthorized,
} from "@/lib/adminDashboardApi";
import { formatCurrency } from "@/lib/formatCurrency";
import DashboardStatCard from "@/components/admin/dashboard/DashboardStatCard";
import RecentOrders from "@/components/admin/dashboard/RecentOrders";
import RecentUsers from "@/components/admin/dashboard/RecentUsers";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import OrderStatistics from "@/components/admin/dashboard/OrderStatistics";
import { RetryButton } from "@/components/admin/dashboard/DashboardStates";

const formatCount = (n) => Number(n || 0).toLocaleString("en-GH");

export default function AdminOverview() {
  const router = useRouter();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const handleUnauthorized = useCallback(() => {
    router.replace("/admin/admin-login");
  }, [router]);

  /* ---------------------------------------------------------
     Fetch overview (stats, recent orders/users, order stats)
  --------------------------------------------------------- */
  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchDashboardOverview({
          signal: controller.signal,
        });
        setOverview(data);
      } catch (err) {
        if (isRequestCanceled(err)) return;
        if (isUnauthorized(err)) return handleUnauthorized();

        console.error(err);
        setError(getErrorMessage(err, "Failed to load dashboard"));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, [reloadKey, handleUnauthorized]);

  const reload = () => setReloadKey((k) => k + 1);

  const stats = overview?.stats;
  const changes = overview?.changes;
  // Skeletons only on first load; a refresh keeps showing current numbers
  const showSkeleton = loading && !overview;

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue),
      icon: Wallet,
      change: changes?.revenue,
      formatChange: formatCurrency,
    },
    {
      title: "Total Orders",
      value: formatCount(stats?.totalOrders),
      icon: ShoppingBag,
      change: changes?.orders,
    },
    {
      title: "Total Customers",
      value: formatCount(stats?.totalUsers),
      icon: Users,
      change: changes?.users,
    },
    {
      title: "Total Products",
      value: formatCount(stats?.totalProducts),
      icon: Package,
      change: changes?.products,
      formatChange: (n) => `${formatCount(n)} added`,
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8A6A52]">
            Dashboard
          </p>
          <h1 className="font-semibold text-3xl sm:text-4xl text-[#1C1A17]">
            Overview
          </h1>
          <p className="text-sm text-[#8A6A52]">
            How the store is doing at a glance.
          </p>
        </div>

        {overview && (
          <RetryButton onClick={reload} loading={loading} label="Refresh" />
        )}
      </div>

      {/* Error: full-page when there's nothing to show, banner otherwise */}
      {error && !overview ? (
        <div className="bg-white rounded-3xl border border-[#1C1A17]/5 shadow-[0_1px_2px_rgba(28,26,23,0.04)] py-16 px-6 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl text-[#1C1A17] font-semibold">
              Couldn&apos;t load the dashboard
            </p>
            <p className="text-sm text-[#8A6A52] mt-1">{error}</p>
          </div>
          <RetryButton onClick={reload} loading={loading} />
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <DashboardStatCard
                key={card.title}
                {...card}
                loading={showSkeleton}
              />
            ))}
          </div>

          {/* Revenue + order statistics */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 min-w-0">
              <RevenueChart onUnauthorized={handleUnauthorized} />
            </div>
            <OrderStatistics
              statistics={overview?.orderStatistics}
              loading={showSkeleton}
            />
          </div>

          {/* Recent orders + recent users */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 min-w-0">
              <RecentOrders
                orders={overview?.recentOrders}
                loading={showSkeleton}
              />
            </div>
            <RecentUsers users={overview?.recentUsers} loading={showSkeleton} />
          </div>
        </div>
      )}
    </>
  );
}
