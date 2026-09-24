import Image from "next/image";
import Link from "next/link";
import storyImage from "@/data/images/aboutStory.jpg";
import { shopCategoryHref } from "@/lib/categories";

// A brand moment between product rows: one photograph, a few lines of copy
export default function EditorialBand() {
  return (
    <section className="bg-cream" aria-labelledby="editorial-title">
      <div className="page-x grid grid-cols-1 items-center gap-10 py-14 sm:py-20 md:grid-cols-2 lg:gap-20 lg:py-24">
        <div className="relative mx-auto aspect-4/5 w-full max-w-md md:max-w-none lg:w-4/5 lg:justify-self-end">
          <Image
            src={storyImage}
            alt="A woman in a lilac pleated halter dress with a floral hem"
            fill
            placeholder="blur"
            sizes="(max-width: 767px) 90vw, 40vw"
            className="rounded-xs object-cover object-top"
          />
        </div>

        <div className="max-w-md">
          <p className="eyebrow">The Eleoka edit</p>
          <h2 id="editorial-title" className="heading-display mt-4 text-4xl sm:text-5xl">
            Made for real days, not just photographs.
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-ink-soft">
            We look for pieces that are comfortable from the first wear, simple to style and
            worth keeping. Fewer things, chosen with more care.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href={shopCategoryHref("dresses")} className="btn-primary">
              Shop dresses
            </Link>
            <Link href="/about" className="link text-[15px]">
              Our story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
