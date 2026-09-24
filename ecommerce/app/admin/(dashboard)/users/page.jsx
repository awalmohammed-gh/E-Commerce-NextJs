"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { RefreshCw, SearchX, ShoppingCart, Trash2, Users as UsersIcon } from "lucide-react";
import { isUnauthorized } from "@/lib/adminDashboardApi";
import { formatDate } from "@/lib/formatDate";
import PageHeader from "@/components/admin/ui/PageHeader";
import Button from "@/components/admin/ui/Button";
import { Card } from "@/components/admin/ui/Card";
import Avatar from "@/components/admin/ui/Avatar";
import SearchInput from "@/components/admin/ui/SearchInput";
import { TABLE, TD, TH, TR } from "@/components/admin/ui/Table";
import { ConfirmDialog } from "@/components/admin/ui/Dialog";
import { useToast } from "@/components/admin/ui/Toast";
import { EmptyState, ErrorState, InlineAlert, Skeleton, friendlyError } from "@/components/admin/ui/States";

const primaryAddress = (user) => user.addresses?.find((a) => a.isDefault) || user.addresses?.[0] || null;

const cartItemCount = (user) =>
  Object.values(user.cartData || {}).reduce(
    (sum, sizes) => sum + Object.values(sizes || {}).reduce((s, q) => s + (Number(q) || 0), 0),
    0,
  );

function CustomersSkeleton() {
  return (
    <Card>
      <div className="divide-y divide-line">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 sm:px-5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="hidden h-3.5 w-24 sm:block" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Customers() {
  const router = useRouter();
  const toast = useToast();

  const [usersData, setUsersData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* Fetch */
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get("/api/auth/users");
        if (!data.success) throw new Error(data.message || "Failed to fetch users");

        setUsersData(data.users || []);
        setLoadError(null);
        setLoaded(true);
      } catch (error) {
        if (isUnauthorized(error)) {
          router.replace("/admin/admin-login");
          return;
        }
        console.error(error);
        setLoadError(friendlyError(error, "Customers couldn't be loaded."));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [reloadKey, router]);

  // Refresh / Retry
  const fetchUsersData = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  /* Delete */
  const handleConfirmDelete = async () => {
    const user = pendingDelete;
    if (!user) return;

    try {
      setDeleting(true);
      const { data } = await axios.delete(`/api/auth/users?id=${user._id}`);
      if (!data.success) throw new Error(data.message || "Failed to delete user");

      setUsersData((prev) => prev.filter((u) => u._id !== user._id));
      toast.success(`${user.fullName || "The customer"}'s account was deleted.`);
    } catch (error) {
      if (isUnauthorized(error)) {
        router.replace("/admin/admin-login");
        return;
      }
      console.error(error);
      toast.error(friendlyError(error, "The account couldn't be deleted. Please try again."));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  /* Filter */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return usersData;

    const matches = (v) => v?.toLowerCase().includes(q);
    return usersData.filter(
      (u) =>
        matches(u.fullName) ||
        matches(u.email) ||
        u.addresses?.some((a) => matches(a.fullName) || matches(a.phone) || matches(a.city)),
    );
  }, [usersData, search]);

  /* Render */
  let content;

  if (!loaded && loading) {
    content = <CustomersSkeleton />;
  } else if (!loaded && loadError) {
    content = (
      <Card>
        <ErrorState title="Couldn't load customers" message={loadError} onRetry={fetchUsersData} retrying={loading} />
      </Card>
    );
  } else if (usersData.length === 0) {
    content = (
      <Card>
        <EmptyState
          icon={UsersIcon}
          title="No customers yet"
          message="Customers appear here as soon as they create an account in the store."
        />
      </Card>
    );
  } else if (filtered.length === 0) {
    content = (
      <Card>
        <EmptyState
          icon={SearchX}
          title="No customers match"
          message={`Nothing found for "${search.trim()}". Try a name, email, phone number or city.`}
          action={<Button onClick={() => setSearch("")}>Clear search</Button>}
        />
      </Card>
    );
  } else {
    content = (
      <Card className="overflow-hidden">
        {/* Phones */}
        <ul className="divide-y divide-line md:hidden">
          {filtered.map((user) => {
            const address = primaryAddress(user);
            const cart = cartItemCount(user);
            return (
              <li key={user._id} className="flex items-start gap-3 p-4">
                <Avatar name={user.fullName} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{user.fullName || "Unnamed customer"}</p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                  <p className="mt-1 text-xs text-muted">
                    Joined {formatDate(user.createdAt)}
                    {address?.city && ` · ${address.city}`}
                    {cart > 0 && ` · ${cart} in cart`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => setPendingDelete(user)}
                  className="hover:bg-danger-tint hover:text-danger"
                  aria-label={`Delete ${user.fullName || user.email}`}
                >
                  Delete
                </Button>
              </li>
            );
          })}
        </ul>

        {/* md and up */}
        <div className="hidden overflow-x-auto md:block">
          <table className={TABLE}>
            <thead>
              <tr>
                <th scope="col" className={`${TH} border-t-0`}>Customer</th>
                <th scope="col" className={`${TH} border-t-0`}>Phone</th>
                <th scope="col" className={`${TH} border-t-0`}>Location</th>
                <th scope="col" className={`${TH} hidden border-t-0 lg:table-cell`}>Cart</th>
                <th scope="col" className={`${TH} border-t-0`}>Joined</th>
                <th scope="col" className={`${TH} border-t-0`}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const address = primaryAddress(user);
                const cart = cartItemCount(user);
                return (
                  <tr key={user._id} className={TR}>
                    <td className={TD}>
                      <div className="flex min-w-50 items-center gap-3">
                        <Avatar name={user.fullName} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{user.fullName || "Unnamed customer"}</p>
                          <p className="truncate text-xs text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`${TD} whitespace-nowrap text-ink-soft`}>{address?.phone || <Muted />}</td>
                    <td className={`${TD} text-ink-soft`}>
                      {address ? (
                        <p className="max-w-50 truncate">
                          {[address.city, address.region].filter(Boolean).join(", ") || address.address}
                        </p>
                      ) : (
                        <Muted>No address saved</Muted>
                      )}
                    </td>
                    <td className={`${TD} hidden text-ink-soft lg:table-cell`}>
                      {cart > 0 ? (
                        <span className="inline-flex items-center gap-1.5 tabular-nums">
                          <ShoppingCart className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                          {cart} {cart === 1 ? "item" : "items"}
                        </span>
                      ) : (
                        <Muted>Empty</Muted>
                      )}
                    </td>
                    <td className={`${TD} whitespace-nowrap text-ink-soft`}>{formatDate(user.createdAt)}</td>
                    <td className={`${TD} text-right`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setPendingDelete(user)}
                        className="hover:bg-danger-tint hover:text-danger"
                        aria-label={`Delete ${user.fullName || user.email}`}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {search.trim() && (
          <p className="border-t border-line px-4 py-2.5 text-xs text-muted sm:px-5">
            Showing {filtered.length} of {usersData.length} customers
          </p>
        )}
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title="Customers"
        description={
          loaded
            ? `${usersData.length} registered ${usersData.length === 1 ? "customer" : "customers"}`
            : "Everyone with an account in the store."
        }
        actions={
          <Button icon={RefreshCw} onClick={fetchUsersData} loading={loading && loaded} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {loaded && usersData.length > 0 && (
        <div className="mb-4 sm:max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, phone or city"
            label="Search customers"
          />
        </div>
      )}

      {loaded && loadError && (
        <div className="mb-4">
          <InlineAlert>{loadError} Showing the last loaded list.</InlineAlert>
        </div>
      )}

      {content}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this customer account?"
        message={
          pendingDelete && (
            <p>
              <span className="font-medium text-ink">{pendingDelete.fullName || pendingDelete.email}</span> will lose
              access to their account, saved addresses, cart and wishlist. Their past orders stay in Orders. This
              can&apos;t be undone.
            </p>
          )
        }
        confirmLabel="Delete account"
        cancelLabel="Keep account"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

function Muted({ children = "—" }) {
  return <span className="text-muted">{children}</span>;
}
