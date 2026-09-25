import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SHOP_SLIDES } from "@/lib/slides";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

/*
  The current campaigns (SHOP_SLIDES in lib/slides.js, the same data as
  the shop banner) as image tiles: one large, two stacked beside it.
  Phones get a swipeable row instead of three tall images.
*/
function Tile({ slide, large = false }) {
  return (
    <Link
      href={slide.primary.href}
      className="group relative block aspect-4/5 overflow-hidden rounded-card bg-sand md:aspect-auto md:h-full"
    >
      <Image
        src={slide.image}
        alt={slide.alt}
        fill
        placeholder="blur"
        sizes={large ? "(max-width: 767px) 85vw, 58vw" : "(max-width: 767px) 85vw, 40vw"}
        style={{ objectPosition: slide.focus }}
        className="object-cover transition-transform duration-[1200ms] ease-out-soft group-hover:scale-[1.05]"
      />
      <span className="scrim-bottom absolute inset-x-0 bottom-0 h-3/4" aria-hidden="true" />

      <span className="glass-tint absolute top-4 left-4 rounded-full px-3 py-1 text-[10.5px] font-semibold tracking-[0.2em] uppercase">
        {slide.eyebrow}
      </span>

      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-paper sm:p-6 lg:p-8">
        <span className="min-w-0">
          <span
            className={`block font-display leading-[1.02] ${large ? "text-[32px] sm:text-[40px] lg:text-[52px]" : "text-[28px] sm:text-[32px] lg:text-[36px]"}`}
          >
            {slide.title}
          </span>
          <span className="mt-2 block text-[12px] font-semibold tracking-[0.14em] text-paper/80 uppercase">
            {slide.primary.label}
          </span>
        </span>
        <span className="glass-dark flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors duration-300 group-hover:border-transparent group-hover:bg-paper group-hover:text-ink">
          <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" aria-hidden="true" />
        </span>
      </span>
    </Link>
  );
}

export default function CampaignTiles() {
  const [lead, ...rest] = SHOP_SLIDES;
  if (!lead) return null;

  return (
    <section className="page-x" aria-labelledby="campaigns-title">
      <h2 id="campaigns-title" className="sr-only">
        Current collections and offers
      </h2>

      {/* Phones: swipe; md+: asymmetric grid */}
      <RevealGroup
        as="ul"
        stagger={0.08}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 no-scrollbar sm:-mx-6 sm:px-6 md:mx-0 md:grid md:h-[clamp(480px,70vh,680px)] md:grid-cols-12 md:grid-rows-2 md:gap-5 md:overflow-visible md:px-0"
      >
        <RevealItem as="li" className="w-[85%] shrink-0 snap-start md:col-span-7 md:row-span-2 md:w-auto">
          <Tile slide={lead} large />
        </RevealItem>
        {rest.map((slide) => (
          <RevealItem as="li" key={slide.id} className="w-[85%] shrink-0 snap-start md:col-span-5 md:w-auto">
            <Tile slide={slide} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
