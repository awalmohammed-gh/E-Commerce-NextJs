"use client";

import { landingCategories } from "@/data/db";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SecondLandingAdvert() {
  return (
    <section className="bg-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.05 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          {landingCategories.map((cat, index) => (
            <motion.div
              className="group relative overflow-hidden cursor-pointer"
              key={cat.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.03 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
            >
              <Link
                href={`/shop?category=${cat.title.toLowerCase()}`}
                className="block"
              >
                {/* Image Container */}
                <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                  <motion.div
                    className="w-full h-full"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Image
                      className="object-cover w-full h-full"
                      src={cat.image}
                      alt={cat.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      priority={index < 6}
                    />
                  </motion.div>

                  {/* Dark Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
                    initial={{ opacity: 0.7 }}
                    whileHover={{ opacity: 0.85 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Text Content - Overlay on Image */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 p-3 sm:p-4"
                    initial={{ y: 10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.03 + 0.1 }}
                    viewport={{ once: true }}
                  >
                    <motion.h3
                      className="text-xs sm:text-sm font-semibold text-white leading-tight"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.03 + 0.12 }}
                      viewport={{ once: true }}
                    >
                      {cat.title}
                    </motion.h3>
                    <motion.p
                      className="text-[8px] sm:text-[10px] text-white/80 mt-0.5 font-medium tracking-wider"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.03 + 0.15 }}
                      viewport={{ once: true }}
                    >
                      {cat.subtitle}
                    </motion.p>
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
