import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { STORE_CATEGORIES, shopCategoryHref } from "@/lib/categories";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

/*
  The eight categories: the section title on top, then one box per
  category (2 across on phones, 4 on wide screens). Boxes turn espresso
  on hover.
*/
export default function CategoryIndex() {
  return (
    <section id="categories" className="page-x scroll-mt-24" aria-labelledby="categories-title">
      <Reveal className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="kicker">The index</p>
          <h2 id="categories-title" className="heading-section mt-4">
            Shop by <em>category</em>
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Eight edits, from easy day dresses to the bag that finishes the look.
          </p>
        </div>
        <Link href="/shop" className="link-arrow group shrink-0 sm:pb-1.5">
          See everything
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </Reveal>

      <RevealGroup as="ul" stagger={0.05} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {STORE_CATEGORIES.map((category, index) => (
          <RevealItem as="li" key={category.slug}>
            <Link
              href={shopCategoryHref(category.slug)}
              className="group relative flex h-full min-h-40 flex-col overflow-hidden rounded-card border border-line bg-cream p-4 transition-[background-color,border-color,box-shadow,transform] duration-500 ease-out-soft hover:-translate-y-1 hover:border-espresso hover:bg-espresso hover:shadow-lift sm:min-h-52 sm:p-6"
            >
              {/* Warm glow that appears with the hover colour */}
              <span
                className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-terracotta/30 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden="true"
              />

              <span className="relative flex items-start justify-between gap-3">
                <span className="text-[11px] font-semibold tracking-[0.18em] text-taupe tabular-nums transition-colors duration-500 group-hover:text-terracotta-light">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors duration-500 group-hover:border-transparent group-hover:bg-terracotta-deep group-hover:text-white sm:h-10 sm:w-10">
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                </span>
              </span>

              <span className="relative mt-auto pt-6">
                <span className="block font-display text-[24px] leading-[1.05] text-ink transition-colors duration-500 group-hover:text-paper sm:text-[32px]">
                  {category.label}
                </span>
                <span className="mt-2 hidden text-[13.5px] leading-snug text-muted transition-colors duration-500 group-hover:text-paper/70 sm:block">
                  {category.blurb}
                </span>
              </span>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
