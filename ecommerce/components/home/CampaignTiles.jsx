import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SHOP_SLIDES } from "@/lib/slides";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

/*
  One campaign as a "shop the edit" card: a clean photograph on top
  (no text over it, so nothing fights the picture) and the name plus a
  clear button on a solid panel below. The whole card is the link.
*/
function EditCard({ slide }) {
  return (
    <Link
      href={slide.primary.href}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition-[transform,box-shadow,border-color] duration-500 ease-out-soft hover:-translate-y-1 hover:border-transparent hover:shadow-lift"
    >
      <div className="relative aspect-4/5 overflow-hidden bg-sand sm:aspect-5/6">
        <Image
          src={slide.image}
          alt={slide.alt}
          fill
          placeholder="blur"
          sizes="(max-width: 767px) 80vw, 33vw"
          style={{ objectPosition: slide.focus }}
          className="object-cover transition-transform duration-900 ease-out-soft group-hover:scale-[1.04]"
        />
        <span className="absolute top-3 left-3 rounded-full bg-paper/95 px-3 py-1 text-[10.5px] font-semibold tracking-[0.18em] text-ink uppercase shadow-soft">
          {slide.eyebrow}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:p-6">
        <h3 className="font-display text-[26px] leading-[1.1] text-ink sm:text-[28px]">{slide.title}</h3>
        <span className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-ink/15 px-5 text-[12px] font-semibold tracking-[0.12em] text-ink uppercase transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
          {slide.primary.label}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

/*
  The current campaigns (SHOP_SLIDES in lib/slides.js, the same data as
  the shop banner) as three equal cards under a short heading.
  Phones get a swipeable row; tablets and up a three-column grid.
*/
export default function CampaignTiles() {
  if (SHOP_SLIDES.length === 0) return null;

  return (
    <section className="page-x" aria-labelledby="campaigns-title">
      <Reveal className="mb-7 flex items-end justify-between gap-6 sm:mb-10">
        <div className="min-w-0">
          <p className="kicker mb-3">Shop the edit</p>
          <h2 id="campaigns-title" className="heading-section">
            Collections &amp; <em>offers</em>
          </h2>
        </div>
        <Link href="/shop" className="link-arrow group shrink-0 pb-1.5">
          Shop all
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 transition-colors duration-300 group-hover:border-terracotta-deep group-hover:bg-terracotta-deep group-hover:text-white">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
      </Reveal>

      <RevealGroup
        as="ul"
        stagger={0.08}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:gap-6"
      >
        {SHOP_SLIDES.map((slide) => (
          <RevealItem as="li" key={slide.id} className="w-[78%] shrink-0 snap-start sm:w-[46%] md:w-auto">
            <EditCard slide={slide} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
