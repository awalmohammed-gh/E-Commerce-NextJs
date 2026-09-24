"use client";

import Image from "next/image";
import Link from "next/link";
import Slideshow from "@/components/ui/Slideshow";
import { HERO_SLIDES } from "@/lib/slides";

/*
  Each slide paints its own backgroundColor (lib/slides.js) edge to
  edge. Slides crossfade, so the colour blends from one to the next.
  The banners are transparent cut-outs: they sit directly on that
  colour with object-contain, never cropped or stretched.
*/
function HeroSlide({ slide, active, priority, loadImages }) {
  return (
    <div className="h-full" style={{ backgroundColor: slide.backgroundColor }}>
      <div className="mx-auto grid h-full max-w-340 grid-cols-1 md:h-[clamp(360px,52vh,440px)] md:grid-cols-12 lg:h-[clamp(420px,60vh,540px)]">
        {/* Words (bottom padding leaves room for the controls) */}
        <div className="order-2 flex flex-col justify-center px-5 pt-5 pb-16 sm:px-8 md:order-1 md:col-span-6 md:py-12 md:pr-4 md:pb-20 lg:col-span-5 lg:pl-12 xl:pl-16">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="heading-display mt-3 text-[32px] sm:text-[40px] md:mt-4 lg:text-[52px] xl:text-[58px]">{slide.title}</h2>
          <p className="mt-3 line-clamp-2 max-w-md text-[15px] leading-relaxed text-ink-soft sm:line-clamp-none md:mt-4 lg:text-base">
            {slide.text}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 md:mt-7">
            <Link href={slide.primary.href} className="btn-primary sm:px-8">
              {slide.primary.label}
            </Link>
            {slide.secondary && (
              <Link
                href={slide.secondary.href}
                className="inline-flex min-h-11 items-center justify-center text-[15px] text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink"
              >
                {slide.secondary.label}
              </Link>
            )}
          </div>
        </div>

        {/* Product image: fixed short height on phones, full row height from md */}
        <div className="relative order-1 h-[clamp(200px,32vh,280px)] sm:h-72 md:order-2 md:col-span-6 md:h-auto lg:col-span-7">
          <div className="absolute inset-x-5 top-5 bottom-0 sm:inset-x-8 md:inset-y-8 md:right-8 md:left-2 lg:inset-y-10 lg:right-12">
            {loadImages && (
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={priority}
                fetchPriority={priority ? "high" : "low"}
                sizes="(max-width: 767px) 90vw, 50vw"
                style={{ objectPosition: slide.focus }}
                className={`object-contain drop-shadow-[0_18px_24px_rgba(28,26,23,0.12)] transition-transform duration-[1800ms] ease-out-soft ${active ? "scale-100" : "scale-[1.04]"}`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/*
  Homepage hero: a slideshow of HERO_SLIDES (lib/slides.js), the four
  heroBanner images from data/images, auto-advancing in order with no
  pause button. The first slide's image is preloaded for a fast LCP;
  the rest load as they come up.
*/
export default function HomeHero() {
  return (
    <div className="relative" style={{ backgroundColor: HERO_SLIDES[0]?.backgroundColor }}>
      <h1 className="sr-only">Eleoka, women&apos;s fashion from Accra</h1>
      <Slideshow
        label="Featured collections"
        slides={HERO_SLIDES}
        interval={5500}
        showPauseButton={false}
        className="relative overflow-hidden"
        renderSlide={(slide, state) => <HeroSlide slide={slide} {...state} />}
        renderControls={(controls) =>
          controls && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
              <div className="mx-auto max-w-340 px-5 pb-2 sm:px-8 md:pb-5 lg:pl-12 xl:pl-16">
                <div className="pointer-events-auto -ml-2.5 w-fit opacity-80 transition-opacity hover:opacity-100 focus-within:opacity-100">
                  {controls}
                </div>
              </div>
            </div>
          )
        }
      />
    </div>
  );
}
