"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import Slideshow from "@/components/ui/Slideshow";
import { SHOP_SLIDES } from "@/lib/slides";

// One campaign slide: photograph with a short caption and link (real text)
function ShopSlide({ slide, active, priority, loadImages }) {
  return (
    <figure className="relative h-full min-h-full overflow-hidden bg-sand sm:rounded-card">
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
      <figcaption className="scrim-bottom absolute inset-x-0 bottom-0 px-5 pt-24 pb-16 text-paper sm:px-7">
        <p
          className={`glass-tint inline-flex rounded-full px-3 py-1 text-[10.5px] font-semibold tracking-[0.2em] uppercase transition-[opacity,transform] duration-700 ease-out-soft ${
            active ? "translate-y-0 opacity-100 delay-150" : "translate-y-3 opacity-0"
          }`}
        >
          {slide.eyebrow}
        </p>
        <p
          className={`mt-3 font-display text-[28px] leading-[1.02] transition-[opacity,transform] duration-700 ease-out-soft sm:text-[34px] ${
            active ? "translate-y-0 opacity-100 delay-250" : "translate-y-3 opacity-0"
          }`}
        >
          {slide.title}
        </p>
        <Link
          href={slide.primary.href}
          className="group mt-2 inline-flex min-h-10 items-center gap-2 text-[12px] font-semibold tracking-[0.14em] uppercase"
        >
          <span className="underline decoration-paper/40 underline-offset-[6px] group-hover:decoration-terracotta-light">{slide.primary.label}</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
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
    <section className="relative overflow-hidden border-b border-line bg-ivory-fade">
      <div className="page-x grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_540px]">
        <div className="flex flex-col justify-center py-8 sm:py-10 lg:py-16">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-[12px] font-medium tracking-[0.06em] text-muted uppercase">
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

          {eyebrow && <p className="kicker mt-7">{eyebrow}</p>}
          <h1 className={`heading-display wrap-break-word text-[46px] sm:text-[60px] lg:text-[76px] ${eyebrow ? "mt-3" : "mt-7"}`}>
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft sm:text-base">{description}</p>
          )}
        </div>

        <div className={`-mx-4 pb-6 sm:mx-0 sm:pb-8 lg:block lg:py-8 ${showSlidesOnMobile ? "" : "hidden"}`}>
          <Slideshow
            label="Collections and offers"
            slides={SHOP_SLIDES}
            interval={6000}
            tone="light"
            className="relative h-full"
            trackClassName="aspect-16/10 sm:aspect-2/1 lg:aspect-auto lg:h-full lg:min-h-96"
            renderSlide={(slide, state) => <ShopSlide slide={slide} {...state} />}
            renderControls={(controls) =>
              controls && <div className="absolute right-3 bottom-3 z-20 sm:right-4 sm:bottom-4">{controls}</div>
            }
          />
        </div>
      </div>
    </section>
  );
}
