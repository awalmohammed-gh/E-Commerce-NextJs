"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { STORE_CATEGORIES, shopCategoryHref } from "@/lib/categories";

function CategoryListView({ active, onNavigate, size }) {
  const large = size === "lg";

  return (
    <ul className={large ? "divide-y divide-line" : "grid grid-cols-2 gap-x-8"}>
      {STORE_CATEGORIES.map((category) => {
        const isActive = active === category.slug;

        return (
          <li key={category.slug}>
            <Link
              href={shopCategoryHref(category.slug)}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`group flex items-center justify-between gap-3 transition-colors ${
                large ? "min-h-13 text-[17px]" : "min-h-10 text-[15px]"
              } ${isActive ? "font-medium text-ink" : "text-ink-soft hover:text-ink"}`}
            >
              <span className="flex items-center gap-2.5">
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-rose" aria-hidden="true" />}
                <span className={isActive ? "" : "decoration-ink/30 underline-offset-4 group-hover:underline"}>
                  {category.label}
                </span>
              </span>
              {large && <ChevronRight className="h-4 w-4 text-taupe" aria-hidden="true" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ActiveCategoryList(props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = pathname === "/shop" ? (searchParams.get("category") || "").toLowerCase() : null;

  return <CategoryListView {...props} active={active} />;
}

/*
  The eight storefront categories, with the one being browsed marked.
  Reading the URL needs a Suspense boundary, so the unmarked list is
  shown until it resolves.
*/
export default function CategoryList({ onNavigate, size = "md" }) {
  return (
    <Suspense fallback={<CategoryListView active={null} onNavigate={onNavigate} size={size} />}>
      <ActiveCategoryList onNavigate={onNavigate} size={size} />
    </Suspense>
  );
}
