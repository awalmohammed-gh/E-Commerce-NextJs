"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Heart,
  Leaf,
  Sparkles,
  Truck,
  Scissors,
  Star,
} from "lucide-react";

import aboutHero from "@/data/images/aboutHero.jpg";
import aboutStory from "@/data/images/aboutStory.jpg";

/* ------------------------------------------------------------------
   Shared animation variant
------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.12,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function About() {
  const values = [
    {
      icon: Scissors,
      title: "Crafted with care",
      text: "Every ELEOKA piece is cut, stitched, and finished with the kind of attention you can feel the moment you slip it on.",
    },
    {
      icon: Leaf,
      title: "Thoughtful fabrics",
      text: "We choose breathable, skin-friendly materials that move with you from morning meetings to evening soirées.",
    },
    {
      icon: Sparkles,
      title: "Timeless, not trendy",
      text: "Silhouettes designed to stay in your wardrobe for seasons, not weeks. Quiet luxury, made for real women.",
    },
    {
      icon: Heart,
      title: "Made for you",
      text: "Sizes that actually fit, cuts that flatter, and details that make you feel like the best version of yourself.",
    },
  ];

  return (
    <main className="bg-[#F5F1EA] text-[#1C1A17] overflow-hidden">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Work+Sans:wght@400;500;600&display=swap");
        .font-editorial {
          font-family: "Cormorant Garamond", serif;
        }
        .font-utility {
          font-family: "Work Sans", sans-serif;
        }
      `}</style>

      {/* ============================================================
          HERO
      ============================================================ */}
      <section className="relative pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
              className="text-center lg:text-left"
            >
              <span className="inline-block text-[#8A6A52] font-utility text-xs font-semibold tracking-[0.25em] uppercase mb-4">
                Our Story
              </span>

              <h1 className="font-editorial font-semibold text-[#1C1A17] text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
                Dresses made
                <br />
                for the woman
                <span className="text-[#D98880]"> you are.</span>
              </h1>

              <p className="font-utility text-[#4A463F] text-base sm:text-lg leading-relaxed mt-6 max-w-lg mx-auto lg:mx-0">
                ELEOKA is a women&apos;s dress boutique born in Accra, made for
                women everywhere. We design pieces that feel as good as they
                look — elegant, effortless, and unapologetically you.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-8">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 bg-[#1C1A17] text-[#F5F1EA] px-7 py-3.5 rounded-full font-utility font-medium text-sm hover:bg-[#332F29] transition-colors"
                  >
                    Shop the collection
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>

                <Link
                  href="/contact"
                  className="font-utility text-sm font-medium text-[#1C1A17] underline underline-offset-4 decoration-[#1C1A17]/30 hover:decoration-[#1C1A17] transition-colors"
                >
                  Get in touch
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5] rounded-3xl overflow-hidden"
            >
              <Image
                src={aboutHero}
                alt="ELEOKA woman wearing a signature dress"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="absolute bottom-5 left-5 right-5 sm:right-auto bg-[#F5F1EA]/95 backdrop-blur-sm rounded-2xl px-5 py-4 flex items-center gap-3 max-w-xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#D98880]/15 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-[#D98880] fill-[#D98880]" />
                </div>
                <div>
                  <p className="font-utility text-xs text-[#8A6A52]">
                    Loved by women in
                  </p>
                  <p className="font-utility font-semibold text-sm text-[#1C1A17]">
                    Accra, Ghana
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          STORY
      ============================================================ */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden order-2 lg:order-1"
            >
              <Image
                src={aboutStory}
                alt="Inside the ELEOKA atelier"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
            </motion.div>

            <div className="order-1 lg:order-2">
              <motion.span
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={0}
                className="inline-block text-[#8A6A52] font-utility text-xs font-semibold tracking-[0.25em] uppercase mb-4"
              >
                Born in Accra
              </motion.span>

              <motion.h2
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={1}
                className="font-editorial font-semibold text-[#1C1A17] text-3xl sm:text-4xl lg:text-[2.6rem] leading-tight"
              >
                A boutique built on the belief that every woman deserves to feel
                extraordinary.
              </motion.h2>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={2}
                className="font-utility text-[#4A463F] text-sm sm:text-base leading-relaxed mt-5"
              >
                ELEOKA began with a simple frustration: finding dresses that
                were beautiful <em>and</em> comfortable <em>and</em> made for
                real bodies. So we created them ourselves quietly, carefully,
                one silhouette at a time. Every collection starts with the women
                who wear it: her days, her nights, her moments worth
                remembering.
              </motion.p>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={3}
                className="font-utility text-[#4A463F] text-sm sm:text-base leading-relaxed mt-4"
              >
                Today, our pieces travel the world from Accra to Lagos, London
                to New York but our promise stays the same: dresses that make
                you feel like <em>you</em>, only more.
              </motion.p>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={4}
                className="flex items-center gap-3 mt-8"
              >
                <div className="w-12 h-[1px] bg-[#8A6A52]/40" />
                <span className="font-editorial text-lg text-[#8A6A52] italic">
                  The ELE<span className="text-pink-500">OKA</span> Atelier
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          VALUES
      ============================================================ */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
          >
            <span className="inline-block text-[#8A6A52] font-utility text-xs font-semibold tracking-[0.25em] uppercase mb-3">
              What we stand for
            </span>
            <h2 className="font-editorial font-semibold text-[#1C1A17] text-3xl sm:text-4xl lg:text-[2.6rem] leading-tight">
              Values stitched into every piece
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  custom={i}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-[#D98880]/15 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-[#D98880]" />
                  </div>
                  <h3 className="font-editorial font-semibold text-[#1C1A17] text-xl mb-2">
                    {v.title}
                  </h3>
                  <p className="font-utility text-[#4A463F] text-sm leading-relaxed">
                    {v.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          PROMISE STRIP
      ============================================================ */}
      <section className="pb-16 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-3xl bg-white p-8 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center gap-6 lg:gap-12"
          >
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-14 h-14 rounded-full bg-[#C89B3C]/15 flex items-center justify-center">
                <Truck className="w-6 h-6 text-[#C89B3C]" />
              </div>
              <div>
                <p className="font-editorial text-xl text-[#1C1A17]">
                  Free delivery in Accra
                </p>
                <p className="font-utility text-sm text-[#8A6A52]">
                  Dispatched within 24 hours
                </p>
              </div>
            </div>

            <div className="hidden lg:block w-[1px] h-12 bg-[#1C1A17]/10" />

            <div className="flex-1 text-center lg:text-left">
              <p className="font-utility text-sm sm:text-base text-[#4A463F] leading-relaxed">
                <span className="font-semibold text-[#1C1A17]">
                  Try it, love it, or send it back.
                </span>{" "}
                Every ELE<span className="text-pink-500">OKA</span> dress
                comes with easy 14-day returns because finding &ldquo;the
                one&rdquo; should feel effortless.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          CTA
      ============================================================ */}
      <section className="pb-20 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="font-editorial font-semibold text-[#1C1A17] text-3xl sm:text-4xl lg:text-5xl leading-tight">
              Find the dress that feels like{" "}
              <span className="text-[#D98880]">you.</span>
            </h2>
            <p className="font-utility text-[#4A463F] text-base mt-5">
              Browse our latest collection new pieces drop every month.
            </p>

            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-block mt-8"
            >
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-[#1C1A17] text-[#F5F1EA] px-8 py-4 rounded-full font-utility font-medium text-sm hover:bg-[#332F29] transition-colors"
              >
                Explore the collection
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
