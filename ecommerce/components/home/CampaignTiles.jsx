import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SHOP_SLIDES } from "@/lib/slides";
import { Reveal } from "@/components/motion/Reveal";

/*
  Where each campaign photograph sits in the collage, by position:
  a large lead plate on the right, a smaller one layered over its lower
  left edge, and a small square tucked in at the top left.
*/
const COLLAGE = [
  {
    frame: "relative ml-auto aspect-4/5 w-[64%] shadow-lift",
    sizes: "(max-width: 767px) 60vw, 30vw",
  },
  {
    frame: "absolute -bottom-8 left-0 z-10 aspect-3/4 w-[44%] border-[6px] border-paper shadow-lift md:-bottom-10",
    sizes: "(max-width: 767px) 40vw, 20vw",
  },
  {
    frame: "absolute top-0 left-[6%] aspect-square w-[26%] shadow-soft",
    sizes: "(max-width: 767px) 26vw, 13vw",
  },
];

// One campaign photograph in the collage, linking to its edit
function Plate({ slide, index, layout }) {
  return (
    <Link
      href={slide.primary.href}
      aria-label={`${slide.eyebrow}: ${slide.title}`}
      className={`group block overflow-hidden rounded-card bg-sand ${layout.frame}`}
    >
      <Image
        src={slide.image}
        alt={slide.alt}
        fill
        placeholder="blur"
        sizes={layout.sizes}
        style={{ objectPosition: slide.focus }}
        className="object-cover transition-transform duration-900 ease-out-soft group-hover:scale-[1.04]"
      />
      <span className="absolute top-3 left-3 rounded-full bg-paper/95 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-ink uppercase shadow-soft">
        {String(index + 1).padStart(2, "0")}
        <span className={index === 2 ? "sr-only" : ""}> · {slide.eyebrow}</span>
      </span>
    </Link>
  );
}

/*
  The current campaigns (SHOP_SLIDES in lib/slides.js, the same data as
  the shop banner) as a brand moment: a few lines of copy with the
  campaigns listed as links on the left, and their photographs layered
  off the grid on the right. The mirror of EditorialBand further down.
  The collage is composed for three campaigns; only the first three show.
*/
export default function CampaignTiles() {
  const slides = SHOP_SLIDES.slice(0, COLLAGE.length);
  if (slides.length === 0) return null;

  return (
    <section className="page-x relative" aria-labelledby="campaigns-title">
      <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-12 lg:gap-8">
        {/* Words */}
        <Reveal className="md:col-span-6 lg:col-span-5">
          <p className="kicker">Shop the edit</p>
          <h2 id="campaigns-title" className="heading-display mt-5 text-[42px] sm:text-[56px] lg:text-[64px]">
            Collections <em>&amp; offers.</em>
          </h2>
          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-ink-soft">
            What&rsquo;s new, what&rsquo;s reduced and the easy pieces we reach for every day,
            gathered in one place.
          </p>

          <ol className="mt-8 max-w-md border-t border-line">
            {slides.map((slide, i) => (
              <li key={slide.id} className="border-b border-line">
                <Link
                  href={slide.primary.href}
                  className="group flex items-center gap-5 py-4 transition-colors hover:text-terracotta-deep"
                >
                  <span className="font-display text-[15px] text-taupe italic">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10.5px] font-semibold tracking-[0.2em] text-muted uppercase">
                      {slide.eyebrow}
                    </span>
                    <span className="mt-0.5 block font-display text-[22px] leading-tight">{slide.title}</span>
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ol>

          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href="/shop" className="btn-primary group">
              Shop all
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link href="/shop?onSale=true" className="link text-[15px] font-medium">
              See the sale
            </Link>
          </div>
        </Reveal>

        {/* Photographs */}
        <Reveal
          variant="fadeScale"
          className="relative mb-8 md:col-span-6 md:col-start-7 md:mb-10 lg:col-span-6 lg:col-start-7"
        >
          {slides.map((slide, i) => (
            <Plate key={slide.id} slide={slide} index={i} layout={COLLAGE[i]} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
