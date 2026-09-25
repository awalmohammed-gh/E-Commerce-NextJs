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
      <section className="bg-ivory-fade">
        <div className="page-x grid grid-cols-1 items-center gap-10 py-12 sm:py-16 md:grid-cols-2 lg:gap-20 lg:py-24">
          <div>
            <p className="kicker">Our story</p>
            <h1 className="heading-display mt-5 text-[48px] sm:text-[72px]">
              Clothes made for <em>the woman you are.</em>
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink-soft">
              ELEOKA is a women&rsquo;s fashion boutique born in Accra, made for women everywhere. We choose
              pieces that feel as good as they look: elegant, easy and unmistakably you.
            </p>
          </div>
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-card shadow-lift md:justify-self-end lg:w-4/5">
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
        <div className="relative order-2 aspect-4/5 w-full overflow-hidden rounded-card md:order-1 lg:w-4/5">
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
          <p className="kicker">Born in Accra</p>
          <h2 className="heading-display mt-5 text-[40px] sm:text-[56px]">
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
          <h2 className="heading-section max-w-xl">
            What we <em>care about</em>
          </h2>
          <ol className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {VALUES.map((value, index) => (
              <li key={value.title} className="rounded-card bg-cream p-6 sm:p-7">
                <span className="font-display text-[44px] leading-none text-terracotta-deep italic">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-display text-[26px] leading-tight text-ink">{value.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{value.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Close */}
      <section className="page-x pb-16 sm:pb-24">
        <div className="on-dark bg-terracotta-band flex flex-col items-start gap-6 rounded-plate px-6 py-12 text-paper sm:flex-row sm:items-center sm:justify-between sm:px-12 sm:py-16">
          <h2 className="max-w-xl font-display text-[36px] leading-[1.05] sm:text-[48px]">Find the piece that feels like you.</h2>
          <Link href="/shop" className="btn-light shrink-0">
            Shop the collection
          </Link>
        </div>
      </section>
    </>
  );
}
