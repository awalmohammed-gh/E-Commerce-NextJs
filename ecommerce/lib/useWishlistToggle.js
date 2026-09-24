"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEcommerce } from "@/context/EcommerceContextProvider";

/*
  Heart-button behaviour for one product: saved state comes from the
  server-backed wishlist in context; signed-out visitors go to login and
  come back here afterwards. toggle() resolves with the API result.
*/
export function useWishlistToggle(productId) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, authChecked, isInWishlist, isWishlistPending, toggleWishlist } =
    useEcommerce();

  const saved = isInWishlist(productId);
  const pending = isWishlistPending(productId);

  const toggle = async () => {
    if (!authChecked || pending) return null;

    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return null;
    }

    const result = await toggleWishlist(productId);
    if (result.status === 401) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return null;
    }
    return result;
  };

  return { saved, pending, toggle };
}
