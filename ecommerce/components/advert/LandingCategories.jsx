"use client";

import { categories } from "@/data/db";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingCategories() {
  return (
    <section className="bg-white py-12 px-4 sm:px-6 lg:px-8 my-20">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {categories.map((cat, index) => (
            <motion.div
              key={cat._id || cat.title || index}
              className="group flex flex-col items-center cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -4 }}
            >
              {/* Circular image */}
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden bg-gray-100 shadow-md ring-1 ring-black/5 transition-all duration-300 group-hover:shadow-xl group-hover:ring-[#0F172A]/20">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 640px) 96px, (max-width: 1024px) 128px, 160px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Soft dark overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-full" />
              </div>

              {/* Text below */}
              <div className="text-center mt-4">
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-[#0F172A] mb-1">
                  {cat.title}
                </h2>

                <Link
                  href={`/shop?category=${cat.slug || cat.title.toLowerCase()}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#0F172A] hover:text-gray-600 transition-colors duration-200"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
