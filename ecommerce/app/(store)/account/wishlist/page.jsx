"use client";

import { useCallback, useState } from "react";
import { Heart, Loader2, PackageX } from "lucide-react";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import { AccountPageHeader } from "@/components/account/AccountShell";
import ProductCard from "@/components/card/ProductCard";
import { ProductGridSkeleton } from "@/components/card/ProductStates";
import { EmptyState, ErrorState } from "@/components/ui/States";
import Toast from "@/ui/Toast";

// Narrower than the shop grid: the account sidebar takes a column on desktop
const GRID = "grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:gap-x-6";

// A saved product that was deleted from the store: nothing to buy, only remove
function RemovedProductCard({ pending, onRemove }) {
  return (
    <div className="flex flex-col">
      <div className="flex aspect-4/5 flex-col items-center justify-center gap-2 rounded-card bg-sand px-4 text-center">
        <PackageX className="h-6 w-6 text-taupe" strokeWidth={1.5} aria-hidden="true" />
        <p className="text-[13px] text-muted">No longer in the store</p>
      </div>
      <p className="mt-3 text-[14px] text-ink sm:text-[15px]">Currently unavailable</p>
      <button
        type="button"
        onClick={onRemove}
        disabled={pending}
        className="mt-1 inline-flex min-h-10 w-fit items-center gap-1.5 text-[14px] text-muted underline decoration-muted/40 underline-offset-4 hover:text-danger disabled:opacity-50"
      >
        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
        {pending ? "Removing" : "Remove"}
      </button>
    </div>
  );
}

export default function WishlistPage() {
  const { wishlist, wishlistLoading, wishlistError, retryWishlist, removeFromWishlist, isWishlistPending, isLoggedIn } =
    useEcommerce();

  const [toast, setToast] = useState({ message: "", success: false, error: false });
  const notify = (result) =>
    setToast({ message: result.message, success: result.success, error: !result.success });
  const clearToast = useCallback(() => setToast({ message: "", success: false, error: false }), []);

  const handleRemove = async (productId) => {
    const result = await removeFromWishlist(productId);
    if (!result.pending) notify(result.success ? { ...result, message: "Removed from your wishlist." } : result);
  };

  const showSkeleton = wishlistLoading || !isLoggedIn;
  const unavailable = wishlist.filter((item) => !item.available).length;

  return (
    <>
      <AccountPageHeader
        title="Wishlist"
        description={
          !showSkeleton && wishlist.length > 0
            ? `${wishlist.length} saved ${wishlist.length === 1 ? "piece" : "pieces"}${unavailable ? ` · ${unavailable} unavailable` : ""}`
            : "Products you've saved for later."
        }
      />

      {showSkeleton ? (
        <ProductGridSkeleton count={3} className={GRID} />
      ) : wishlistError ? (
        <ErrorState title="Your wishlist didn't load." onRetry={retryWishlist} />
      ) : wishlist.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          message="Save products you love and come back to them later. Tap the heart on any product to add it here."
          actionLabel="Explore products"
          actionHref="/shop"
        />
      ) : (
        <ul className={GRID}>
          {wishlist.map((item) => (
            <li key={item.productId}>
              {item.product ? (
                // Current price and stock from MongoDB; the heart removes it
                <ProductCard
                  product={item.product}
                  showActions
                  soldOutLabel="Currently unavailable"
                  onWishlistResult={notify}
                />
              ) : (
                <RemovedProductCard
                  pending={isWishlistPending(item.productId)}
                  onRemove={() => handleRemove(item.productId)}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="toast-region">
        <Toast success={toast.success} error={toast.error} message={toast.message} onClose={clearToast} />
      </div>
    </>
  );
}
