"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { ChevronRight } from "lucide-react";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import { AccountPageHeader } from "@/components/account/AccountShell";
import ProductImage from "@/components/card/ProductImage";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import { ACCOUNT_LINKS } from "@/lib/accountLinks";
import { formatCedis } from "@/lib/formatCurrency";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GH", { year: "numeric", month: "short", day: "numeric" });

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default function AccountOverview() {
  const {
    user,
    isLoggedIn,
    authChecked,
    defaultAddress,
    addresses,
    addressesLoading,
    addressesError,
    wishlist,
    wishlistLoading,
    wishlistError,
  } = useEcommerce();

  // Order summary from /api/my-orders: { status: loading | ready | error, orders }
  const [orders, setOrders] = useState({ status: "loading", orders: [] });

  useEffect(() => {
    if (!authChecked || !isLoggedIn) return;

    const controller = new AbortController();
    axios
      .get("/api/my-orders", { signal: controller.signal })
      .then(({ data }) => setOrders({ status: "ready", orders: data.orders || [] }))
      .catch((error) => {
        if (axios.isCancel(error)) return;
        setOrders({ status: "error", orders: [] });
      });

    return () => controller.abort();
  }, [authChecked, isLoggedIn]);

  const ready = authChecked && isLoggedIn && Boolean(user);
  const latest = orders.orders[0]; // newest first from the API
  const firstName = user?.fullName?.trim().split(" ")[0];

  // One line of live detail per section (null while loading)
  const summaries = {
    "/orders":
      orders.status === "loading"
        ? null
        : orders.status === "error"
          ? "Couldn't load right now"
          : orders.orders.length
            ? plural(orders.orders.length, "order")
            : "No orders yet",
    "/account/addresses": addressesLoading
      ? null
      : addressesError
        ? "Couldn't load right now"
        : defaultAddress
          ? `${defaultAddress.label} · ${defaultAddress.city}${addresses.length > 1 ? ` + ${addresses.length - 1} more` : ""}`
          : "No saved addresses",
    "/account/wishlist": wishlistLoading
      ? null
      : wishlistError
        ? "Couldn't load right now"
        : wishlist.length
          ? `${plural(wishlist.length, "saved piece")}`
          : "Nothing saved yet",
    "/account/settings": "Profile, password, notifications",
  };

  return (
    <>
      <AccountPageHeader
        title={ready ? `Hello, ${firstName}` : "My account"}
        description={ready ? user.email : " "}
      />

      {/* Latest order */}
      <section aria-labelledby="latest-order" className="mb-12">
        <h2 id="latest-order" className="eyebrow mb-3">
          Latest order
        </h2>
        {!ready || orders.status === "loading" ? (
          <div className="skeleton h-28 rounded-card" />
        ) : orders.status === "error" ? (
          <p className="panel px-5 py-6 text-[15px] text-muted">
            Your orders didn&apos;t load. <Link href="/orders" className="link text-ink">Open My Orders</Link> to try again.
          </p>
        ) : !latest ? (
          <div className="panel flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px] text-muted">You haven&apos;t placed an order yet.</p>
            <Link href="/shop" className="btn-primary btn-sm">
              Start shopping
            </Link>
          </div>
        ) : (
          <Link
            href="/orders"
            className="panel group flex flex-col gap-4 p-5 transition-colors hover:border-ink/40 sm:flex-row sm:items-center"
          >
            <div className="flex -space-x-3">
              {latest.lines.slice(0, 3).map((line) => (
                <span
                  key={`${line.productId}-${line.size}`}
                  className="relative h-20 w-15 overflow-hidden rounded-field bg-sand ring-2 ring-white"
                >
                  <ProductImage src={line.image} alt="" sizes="60px" className="object-cover" />
                </span>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[15px] font-medium text-ink">Order #{latest._id.slice(-8).toUpperCase()}</p>
                <OrderStatusBadge status={latest.orderStatus} />
              </div>
              <p className="mt-1 text-[14px] text-muted">
                {formatDate(latest.createdAt)} &middot; {plural(latest.lines.reduce((n, l) => n + l.quantity, 0), "item")} &middot;{" "}
                {formatCedis(latest.totalAmount)}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[14px] text-ink">
              View orders
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </Link>
        )}
      </section>

      {/* Sections */}
      <section aria-labelledby="account-sections">
        <h2 id="account-sections" className="eyebrow mb-3">
          Your account
        </h2>
        <ul className="divide-y divide-line border-y border-line">
          {ACCOUNT_LINKS.filter((l) => l.href !== "/account").map((link) => {
            const Icon = link.icon;
            const summary = summaries[link.href];
            return (
              <li key={link.href}>
                <Link href={link.href} className="group flex min-h-18 items-center gap-4 rounded-field py-4 transition-colors hover:bg-cream sm:px-4">
                  <Icon className="h-5 w-5 shrink-0 text-taupe" strokeWidth={1.5} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] text-ink">{link.label}</span>
                    {summary === null || !ready ? (
                      <span className="skeleton mt-1.5 block h-3 w-32" />
                    ) : (
                      <span className="block truncate text-[14px] text-muted">{summary}</span>
                    )}
                  </span>
                  <ChevronRight className="h-4.5 w-4.5 shrink-0 text-taupe transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 text-[15px] text-muted">
          Need help with an order?{" "}
          <Link href="/contact" className="link text-ink">
            Contact us
          </Link>
        </p>
      </section>
    </>
  );
}
