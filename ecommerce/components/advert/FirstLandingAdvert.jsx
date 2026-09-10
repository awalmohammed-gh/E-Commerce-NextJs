"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { adverts } from "@/data/db";

export default function FirstLandingAdvert() {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adverts.map((advert, index) => (
          <motion.div
            key={advert.id}
            className="group relative w-full rounded-2xl overflow-hidden cursor-pointer transition-shadow duration-500 hover:shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            viewport={{ once: true }}
          >
            {/* Image */}
            <div className="relative w-full h-50 sm:h-62.5 lg:h-75 overflow-hidden">
              <Image
                src={advert.image}
                alt={advert.title}
                fill
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            {/* Base dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/60 via-[#0F172A]/70 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

            {/* Extra hover dim (deepens on hover) */}
            <div className="absolute inset-0 bg-[#0F172A]/0 group-hover:bg-[#0F172A]/20 transition-colors duration-500" />

            {/* Shine sweep on hover */}
            <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1400ms] ease-out">
              <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
            </div>

            {/* Soft corner glow on hover */}
            <div className="pointer-events-none absolute -top-20 -left-20 w-60 h-60 rounded-full bg-orange-400/0 group-hover:bg-orange-400/15 blur-3xl transition-colors duration-700" />

            {/* Ring border that lights up on hover */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/0 group-hover:ring-white/20 transition-all duration-500" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <motion.div
                className="px-6 sm:px-8 lg:px-10 max-w-xs transition-transform duration-500 group-hover:translate-x-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 + 0.2 }}
                viewport={{ once: true }}
              >
                {/* Brand Badge */}
                <p className="relative text-orange-400 text-[10px] sm:text-xs font-semibold tracking-wider uppercase mb-0.5 w-fit">
                  {advert.brand}
                  <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-orange-400 group-hover:w-full transition-all duration-500" />
                </p>

                {/* Title */}
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 leading-tight">
                  {advert.title}
                </h2>

                {/* Price */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base sm:text-lg font-bold text-white">
                    {advert.price}
                  </span>
                  {advert.oldPrice && (
                    <span className="text-xs sm:text-sm text-white/60 line-through">
                      {advert.oldPrice}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-white/80 text-[10px] sm:text-xs mb-2 sm:mb-3">
                  {advert.description}
                </p>

                {/* Button */}
                <Link
                  href={advert.buttonLink}
                  className="inline-flex items-center gap-1.5 bg-white text-[#0F172A] px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-semibold shadow-lg hover:shadow-xl group/btn text-xs sm:text-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-50"
                >
                  {advert.buttonText}
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
