import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import storyImage from "@/data/images/aboutStory.jpg";
import detailImage from "@/data/images/aboutHero.jpg";
import { shopCategoryHref } from "@/lib/categories";
import { Reveal } from "@/components/motion/Reveal";

/*
  A brand moment between product rows: two photographs layered off the
  grid, and a few lines of copy set large.
*/
export default function EditorialBand() {
  return (
    <section className="relative overflow-hidden bg-cream" aria-labelledby="editorial-title">
      {/* Oversized watermark word behind the composition */}
      <span
        className="pointer-events-none absolute -right-6 bottom-0 hidden font-display text-[18vw] leading-[0.8] text-sand/80 italic select-none lg:block"
        aria-hidden="true"
      >
        Eleoka
      </span>

      <div className="page-x relative grid grid-cols-1 items-center gap-12 py-16 sm:py-20 md:grid-cols-12 lg:gap-8 lg:py-28">
        {/* Photographs */}
        <Reveal variant="fadeScale" className="relative md:col-span-6 lg:col-span-6">
          <div className="relative aspect-4/5 w-[82%] overflow-hidden rounded-card shadow-lift sm:w-[74%] md:w-[82%]">
            <Image
              src={storyImage}
              alt="A woman in a lilac pleated halter dress with a floral hem"
              fill
              placeholder="blur"
              sizes="(max-width: 767px) 80vw, 40vw"
              className="object-cover object-top"
            />
          </div>
          <div className="absolute right-0 -bottom-8 aspect-3/4 w-[44%] overflow-hidden rounded-card border-[6px] border-cream shadow-lift sm:w-[38%] md:-bottom-10 md:w-[44%]">
            <Image
              src={detailImage}
              alt="A woman in a black jumpsuit holding a burgundy handbag"
              fill
              placeholder="blur"
              sizes="(max-width: 767px) 40vw, 20vw"
              className="object-cover object-[50%_25%]"
            />
          </div>
        </Reveal>

        {/* Words */}
        <Reveal className="pt-6 md:col-span-6 md:pt-0 lg:col-span-5 lg:col-start-8">
          <p className="kicker">The Eleoka edit</p>
          <h2 id="editorial-title" className="heading-display mt-5 text-[42px] sm:text-[56px] lg:text-[64px]">
            Made for real days, <em>not just photographs.</em>
          </h2>
          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-ink-soft">
            We look for pieces that are comfortable from the first wear, simple to style and
            worth keeping. Fewer things, chosen with more care.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href={shopCategoryHref("dresses")} className="btn-primary group">
              Shop dresses
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link href="/about" className="link text-[15px] font-medium">
              Our story
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
