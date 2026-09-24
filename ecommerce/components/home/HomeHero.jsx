"use client";

import Image from "next/image";
import Link from "next/link";
import Slideshow from "@/components/ui/Slideshow";
import { HERO_SLIDES } from "@/lib/slides";

function HeroSlide({ slide, active, priority, loadImages }) {
  return (
    <div className="grid grid-cols-1 lg:min-h-[min(78vh,760px)] lg:grid-cols-12">
      {/* Words */}
      <div className="order-2 flex flex-col justify-center px-4 pt-8 pb-4 sm:px-6 sm:pt-12 lg:order-1 lg:col-span-5 lg:py-20 lg:pr-4 lg:pb-28 lg:pl-10">
        <p className="eyebrow">{slide.eyebrow}</p>
        <h2 className="heading-display mt-4 text-[42px] sm:text-6xl xl:text-7xl">{slide.title}</h2>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft sm:text-[17px]">{slide.text}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
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

      {/*
        Product image: fixed near-square ratio on phones/tablets (the banners
        are ~1:1 cut-outs, so object-cover barely crops them), full column
        height from lg. White backdrop blends with the transparent PNGs.
        The frame has its size before the image arrives, so nothing shifts.
      */}
      <div className="relative order-1 aspect-square overflow-hidden bg-white sm:aspect-5/4 lg:order-2 lg:col-span-7 lg:aspect-auto">
        {loadImages && (
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={priority}
            fetchPriority={priority ? "high" : "low"}
            placeholder="blur"
            sizes="(max-width: 1023px) 100vw, 58vw"
            style={{ objectPosition: slide.focus }}
            className={`object-cover transition-transform duration-[1800ms] ease-out-soft ${active ? "scale-100" : "scale-[1.04]"}`}
          />
        )}
      </div>
    </div>
  );
}

/*
  Homepage hero: a slideshow of HERO_SLIDES (lib/slides.js), the four
  heroBanner images from data/images, auto-advancing in order.
  The first slide's image is preloaded for a fast LCP; the rest load
  as they come up.
*/
export default function HomeHero() {
  return (
    <div className="bg-cream">
      <h1 className="sr-only">Eleoka, women&apos;s fashion from Accra</h1>
      <Slideshow
        label="Featured collections"
        slides={HERO_SLIDES}
        interval={5500}
        className="relative mx-auto max-w-340"
        renderSlide={(slide, state) => <HeroSlide slide={slide} {...state} />}
        renderControls={(controls) =>
          controls && (
            <div className="px-4 pb-8 sm:px-6 lg:absolute lg:bottom-8 lg:left-0 lg:z-20 lg:w-5/12 lg:pb-0 lg:pl-8">
              <div className="-ml-2.5">{controls}</div>
            </div>
          )
        }
      />
    </div>
  );
}
