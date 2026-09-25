"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/card/ProductCard";
import { ProductCardSkeleton, ProductsError } from "@/components/card/ProductStates";
import useProducts from "@/lib/useProducts";
import { motion } from "framer-motion";
import { VIEWPORT, cardVariants } from "@/lib/storeMotion";
import { Reveal } from "@/components/motion/Reveal";

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
      <Reveal className="mb-7 flex items-end justify-between gap-6 sm:mb-10">
        <div className="min-w-0">
          {eyebrow && <p className="kicker mb-3">{eyebrow}</p>}
          <h2 id={headingId} className="heading-section">
            {title}
          </h2>
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="link-arrow group shrink-0 pb-1.5">
            {viewAllLabel}
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 transition-colors duration-300 group-hover:border-terracotta-deep group-hover:bg-terracotta-deep group-hover:text-white">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
        )}
      </Reveal>

      {error ? (
        <ProductsError onRetry={retry} />
      ) : loading ? (
        <div className={ROW} aria-busy="true" aria-label="Loading products">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className={`${itemClass(i, count)} flex-col`}>
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <ul className={ROW}>
          {products.map((product, index) => (
            <motion.li
              key={product._id}
              className={itemClass(index, products.length)}
              variants={cardVariants}
              custom={index}
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT}
            >
              <div className="w-full">
                <ProductCard product={product} priority={index < 2} />
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}
