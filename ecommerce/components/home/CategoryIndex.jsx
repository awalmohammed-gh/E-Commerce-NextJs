import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { STORE_CATEGORIES, shopCategoryHref } from "@/lib/categories";

// The eight categories as an editorial index: large serif names on hairlines
export default function CategoryIndex() {
  return (
    <section id="categories" className="page-x scroll-mt-24" aria-labelledby="categories-title">
      <div className="mb-8 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="categories-title" className="heading-section">
          Shop by category
        </h2>
        <Link href="/shop" className="link text-[15px] text-ink-soft sm:pb-1">
          Or see everything
        </Link>
      </div>

      {/* 1px gaps over a line-coloured background draw the hairline grid */}
      <ul className="grid grid-cols-1 gap-px border-y border-line bg-line sm:grid-cols-2 sm:border lg:grid-cols-4">
        {STORE_CATEGORIES.map((category) => (
          <li key={category.slug} className="bg-paper">
            <Link
              href={shopCategoryHref(category.slug)}
              className="group flex h-full min-h-18 items-start justify-between gap-4 py-5 transition-colors hover:bg-cream sm:min-h-36 sm:px-6 sm:py-7"
            >
              <span>
                <span className="block font-display text-[26px] leading-tight text-ink sm:text-[28px]">
                  {category.label}
                </span>
                <span className="mt-1.5 hidden text-[14px] leading-snug text-muted sm:block">
                  {category.blurb}
                </span>
              </span>
              <ArrowUpRight
                className="mt-1.5 h-5 w-5 shrink-0 text-taupe transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
