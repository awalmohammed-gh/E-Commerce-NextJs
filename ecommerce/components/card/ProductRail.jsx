"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/card/ProductCard";
import { ProductsError } from "@/components/card/ProductStates";
import useProducts from "@/lib/useProducts";

/*
  One complete row at every width:
  phones 2 x 2, tablets (md) 3 across with the 4th card hidden, lg+ 4 across.
  grid-cols-N uses minmax(0,1fr), so columns shrink on the narrowest
  phones instead of overflowing.
*/
const ROW =
  "grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12";
// With exactly four products, tablets show three so the row stays complete
const itemClass = (index, total) =>
  `flex min-w-0 ${total === 4 && index === 3 ? "md:max-lg:hidden" : ""}`;

/*
  A titled row of products from /api/products. `query` is sent as-is
  (e.g. { onSale: true, limit: 4 }). Optional sections vanish when
  there's nothing to show instead of displaying an empty message.
*/
export default function ProductRail({
  title,
  eyebrow,
  query,
  viewAllHref,
  viewAllLabel = "View all",
  enabled = true,
  className = "",
}) {
  const { products, loading, error, retry } = useProducts(query, { enabled });

  if (!enabled || (!loading && !error && products.length === 0)) return null;

  const count = query.limit || 4;
  const headingId = `rail-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <section className={`page-x ${className}`} aria-labelledby={headingId}>
      <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
        <div>
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h2 id={headingId} className="heading-section">
            {title}
          </h2>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="group inline-flex shrink-0 items-center gap-1.5 pb-1 text-[13px] font-medium tracking-[0.08em] text-ink uppercase"
          >
            {viewAllLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        )}
      </div>

      {error ? (
        <ProductsError onRetry={retry} />
      ) : loading ? (
        <div className={ROW} aria-busy="true" aria-label="Loading products">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className={`${itemClass(i, count)} flex-col`} aria-hidden="true">
              <div className="skeleton aspect-3/4 w-full rounded-xs" />
              <div className="mt-3 space-y-2">
                <div className="skeleton h-3.5 w-4/5" />
                <div className="skeleton h-3.5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ul className={ROW}>
          {products.map((product, index) => (
            <li key={product._id} className={itemClass(index, products.length)}>
              <div className="w-full">
                <ProductCard product={product} priority={index < 2} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
