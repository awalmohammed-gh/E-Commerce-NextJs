"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import Slideshow from "@/components/ui/Slideshow";
import { SHOP_SLIDES } from "@/lib/slides";

// One campaign slide: photograph with a short caption and link (real text)
function ShopSlide({ slide, active, priority, loadImages }) {
  return (
    <figure className="relative h-full min-h-full overflow-hidden bg-sand">
      {loadImages && (
        <Image
          src={slide.image}
          alt={slide.alt}
          fill
          priority={priority}
          fetchPriority={priority ? "high" : "low"}
          placeholder="blur"
          sizes="(max-width: 1023px) 100vw, 520px"
          style={{ objectPosition: slide.focus }}
          className={`object-cover transition-transform duration-[1800ms] ease-out-soft ${active ? "scale-100" : "scale-[1.04]"}`}
        />
      )}
      {/* Scrim strong enough for cream text on light photographs */}
      <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/85 via-ink/55 to-transparent px-5 pt-20 pb-14 text-cream sm:px-6 [text-shadow:0_1px_12px_rgba(28,26,23,0.35)]">
        <p className="text-[11px] font-medium tracking-[0.18em] text-cream/85 uppercase">{slide.eyebrow}</p>
        <p className="mt-1 font-display text-2xl leading-tight sm:text-[28px]">{slide.title}</p>
        <Link
          href={slide.primary.href}
          className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-[13px] font-medium tracking-[0.08em] uppercase underline-offset-4 hover:underline"
        >
          {slide.primary.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </figcaption>
    </figure>
  );
}

/*
  Shop page header. The left side is the page title, which follows the
  URL (/shop?category=tops -> "Tops & Blouses"); the right side is a
  slideshow of SHOP_SLIDES (lib/slides.js) for campaigns and collections.
  On phones the slideshow shows on the main shop page only (showSlidesOnMobile),
  so filtered results stay near the top of the screen.
*/
export default function ShopBanner({ title, eyebrow, description, crumbs = [], showSlidesOnMobile = true }) {
  return (
    <section className="border-b border-line bg-cream">
      <div className="page-x grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_540px]">
        <div className="py-8 sm:py-10 lg:py-14">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
              <li>
                <Link href="/" className="hover:text-ink">
                  Home
                </Link>
              </li>
              {crumbs.map((crumb, i) => (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  {crumb.href && i < crumbs.length - 1 ? (
                    <Link href={crumb.href} className="hover:text-ink">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-ink">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {eyebrow && <p className="eyebrow mt-6">{eyebrow}</p>}
          <h1 className={`heading-display wrap-break-word text-[40px] sm:text-5xl lg:text-6xl ${eyebrow ? "mt-2" : "mt-6"}`}>
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-soft sm:text-base">{description}</p>
          )}
        </div>

        <div className={`-mx-4 pb-6 sm:mx-0 sm:pb-8 lg:block lg:pb-0 ${showSlidesOnMobile ? "" : "hidden"}`}>
          <Slideshow
            label="Collections and offers"
            slides={SHOP_SLIDES}
            interval={6000}
            tone="light"
            className="relative h-full"
            trackClassName="aspect-16/10 sm:aspect-2/1 lg:aspect-auto lg:h-full lg:min-h-80"
            renderSlide={(slide, state) => <ShopSlide slide={slide} {...state} />}
            renderControls={(controls) =>
              controls && <div className="absolute right-2 bottom-2 z-20 sm:right-3">{controls}</div>
            }
          />
        </div>
      </div>
    </section>
  );
}
