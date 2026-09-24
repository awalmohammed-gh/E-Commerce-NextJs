"use client";

import ProductRail from "@/components/card/ProductRail";
import { shopCategoryHref, findStoreCategory } from "@/lib/categories";

// Other in-stock products from the same category, fetched from MongoDB
export default function RelatedItems({ category, currentProductId }) {
  const storeCategory = findStoreCategory(category);

  return (
    <ProductRail
      title="You may also like"
      query={{ category, exclude: currentProductId, inStock: true, limit: 4 }}
      enabled={Boolean(category)}
      viewAllHref={storeCategory ? shopCategoryHref(storeCategory.slug) : `/shop?category=${encodeURIComponent(category || "")}`}
      className="pt-4 sm:pt-8"
    />
  );
}
