import Image from "next/image";
import Link from "next/link";
import aboutHero from "@/data/images/aboutHero.jpg";
import aboutStory from "@/data/images/aboutStory.jpg";

export const metadata = {
  title: "About",
  description: "ELEOKA is a women's fashion boutique born in Accra.",
};

const VALUES = [
  {
    title: "Chosen with care",
    text: "Every piece is picked for how it feels to wear, not just how it photographs.",
  },
  {
    title: "Comfortable fabrics",
    text: "Breathable, skin-friendly materials that move with you from morning to evening.",
  },
  {
    title: "Timeless over trendy",
    text: "Shapes that stay in your wardrobe for seasons, not weeks.",
  },
  {
    title: "Made for real women",
    text: "Cuts that flatter and details that make you feel like the best version of yourself.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Opening */}
      <section className="bg-cream">
        <div className="page-x grid grid-cols-1 items-center gap-10 py-12 sm:py-16 md:grid-cols-2 lg:gap-20 lg:py-24">
          <div>
            <p className="eyebrow">Our story</p>
            <h1 className="heading-display mt-4 text-[44px] sm:text-6xl">Clothes made for the woman you are.</h1>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink-soft">
              ELEOKA is a women&rsquo;s fashion boutique born in Accra, made for women everywhere. We choose
              pieces that feel as good as they look: elegant, easy and unmistakably you.
            </p>
          </div>
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-xs md:justify-self-end lg:w-4/5">
            <Image
              src={aboutHero}
              alt="A woman in a black jumpsuit holding a burgundy handbag"
              fill
              priority
              placeholder="blur"
              sizes="(max-width: 767px) 92vw, 40vw"
              className="object-cover object-[50%_20%]"
            />
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="page-x grid grid-cols-1 items-center gap-10 py-16 sm:py-24 md:grid-cols-2 lg:gap-20">
        <div className="relative order-2 aspect-4/5 w-full overflow-hidden rounded-xs md:order-1 lg:w-4/5">
          <Image
            src={aboutStory}
            alt="A woman in a lilac pleated halter dress"
            fill
            placeholder="blur"
            sizes="(max-width: 767px) 92vw, 40vw"
            className="object-cover object-top"
          />
        </div>
        <div className="order-1 max-w-lg md:order-2">
          <p className="eyebrow">Born in Accra</p>
          <h2 className="heading-display mt-4 text-4xl sm:text-5xl">
            Every woman deserves to feel extraordinary.
          </h2>
          <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-ink-soft">
            <p>
              ELEOKA began with a simple frustration: finding clothes that were beautiful <em>and</em>{" "}
              comfortable <em>and</em> made for real bodies. So we set out to find them ourselves, carefully,
              one piece at a time.
            </p>
            <p>
              Every edit starts with the women who wear it: her days, her evenings and the moments worth
              remembering.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-line">
        <div className="page-x py-16 sm:py-24">
          <h2 className="heading-section max-w-xl">What we care about</h2>
          <ol className="mt-10 grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, index) => (
              <li key={value.title} className="bg-paper py-6 sm:p-6 lg:first:pl-0">
                <span className="text-[13px] text-muted">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-display text-2xl text-ink">{value.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{value.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Close */}
      <section className="bg-ink text-cream">
        <div className="page-x flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between sm:py-16">
          <h2 className="max-w-xl font-display text-3xl leading-tight sm:text-4xl">Find the piece that feels like you.</h2>
          <Link href="/shop" className="btn-light shrink-0">
            Shop the collection
          </Link>
        </div>
      </section>
    </>
  );
}
