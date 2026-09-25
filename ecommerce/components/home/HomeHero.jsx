"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Slideshow from "@/components/ui/Slideshow";
import { HERO_COVER, HERO_SLIDES } from "@/lib/slides";

const pad = (n) => String(n).padStart(2, "0");

// Text enters with a short rise once its slide is active, staggered by `delay`
const rise = (active, delay) =>
  `transition-[opacity,transform] duration-600 ease-out-soft ${
    active ? `translate-y-0 opacity-100 ${delay}` : "translate-y-4 opacity-0 delay-0"
  }`;

/*
  One campaign message over the cover photograph. Only the words change
  between slides; the photograph and its overlay belong to the section.
*/
function HeroSlide({ slide, index, active }) {
  return (
    <div className="page-x flex h-full flex-col justify-end pt-24 pb-20 md:justify-center md:pt-28 md:pb-16">
      <div className="max-w-xl lg:max-w-2xl">
        <p className={`flex items-center gap-3 ${rise(active, "delay-100")}`}>
          <span className="glass-dark inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10.5px] font-semibold tracking-[0.2em] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-terracotta-light" aria-hidden="true" />
            {slide.eyebrow}
          </span>
          <span className="text-[11px] font-semibold tracking-[0.18em] text-paper/60 tabular-nums">
            {pad(index + 1)} / {pad(HERO_SLIDES.length)}
          </span>
        </p>

        <h2
          className={`heading-display mt-4 text-[40px] text-paper sm:text-[52px] md:mt-5 lg:text-[68px] xl:text-[80px] ${rise(active, "delay-200")}`}
        >
          {slide.title}
        </h2>

        <p
          className={`mt-3 line-clamp-2 max-w-md text-[15px] leading-relaxed text-paper/80 sm:line-clamp-none md:mt-4 lg:text-base ${rise(active, "delay-300")}`}
        >
          {slide.text}
        </p>

        <div className={`mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 md:mt-8 ${rise(active, "delay-[400ms]")}`}>
          <Link href={slide.primary.href} className="btn-accent group sm:px-9">
            {slide.primary.label}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          {slide.secondary && (
            <Link
              href={slide.secondary.href}
              className="inline-flex min-h-11 items-center text-[14px] font-medium text-paper underline decoration-paper/40 underline-offset-[6px] transition-colors hover:decoration-terracotta-light"
            >
              {slide.secondary.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/*
  Homepage hero as a cover page: HERO_COVER fills the section edge to
  edge under the transparent navbar (negative top margin = bar height),
  most of the first screen, like a fashion campaign cover (580-780px
  tall on larger screens, so very tall monitors do not stretch it),
  darkened by overlays so light text reads on it, while the HERO_SLIDES
  copy rotates over the empty wall on the left. Auto-advances with no
  pause button (it pauses on hover/focus and for reduced motion).
*/
export default function HomeHero() {
  return (
    <section className="on-dark relative -mt-16 h-[78svh] min-h-[540px] overflow-hidden bg-espresso-deep text-paper md:h-[84svh] md:max-h-[780px] md:min-h-[580px] lg:-mt-18">
      <h1 className="sr-only">Eleoka, women&apos;s fashion from Accra</h1>

      {/* Cover photograph: a slow settle on load, then still */}
      <Image
        src={HERO_COVER.image}
        alt={HERO_COVER.alt}
        fill
        priority
        fetchPriority="high"
        placeholder="blur"
        sizes="100vw"
        style={{ "--focus": HERO_COVER.focus, "--focus-m": HERO_COVER.focusMobile }}
        className="animate-[hero-settle_2.4s_var(--ease-out-soft)_both] object-cover [object-position:var(--focus-m)] md:[object-position:var(--focus)]"
      />

      {/* Overlays: warm tint, a dark wash under the copy (bottom on
          phones, left from md), and shades at the top and bottom for the
          navbar and the slide controls. The photo is busy edge to edge,
          so the wash is deeper than a plain wall would need. */}
      <div className="absolute inset-0 bg-espresso/20 mix-blend-multiply" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-linear-to-t from-espresso-deep/95 via-espresso-deep/60 to-espresso-deep/10 md:bg-linear-to-r md:from-espresso-deep/92 md:via-espresso-deep/65 md:via-45% md:to-espresso-deep/15"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-espresso-deep/70 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-espresso-deep/60 to-transparent" aria-hidden="true" />

      <Slideshow
        label="Featured collections"
        slides={HERO_SLIDES}
        interval={6000}
        showPauseButton={false}
        tone="light"
        className="relative h-full"
        trackClassName="h-full"
        renderSlide={(slide, state) => <HeroSlide slide={slide} {...state} />}
        renderControls={(controls) =>
          controls && (
            <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 md:bottom-6">
              <div className="page-x flex justify-start md:justify-end">
                <div className="pointer-events-auto">{controls}</div>
              </div>
            </div>
          )
        }
      />
    </section>
  );
}
