"use client";

import { products } from "@/data/images/data";
import ProductCard from "../card/ProductCard";
import { Sparkles, ArrowRight, FlameIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NewArrival() {
  const newArrivalData = products
    .filter((product) => product.isNew)
    .sort(() => 0.5 - Math.random());

  return (
    <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Header Title */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3">
            <FlameIcon className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/shop?sort=newest"
            className="text-sm text-[#0F172A] hover:text-gray-600 transition-colors duration-200 flex items-center gap-1 group mt-2 sm:mt-0"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </motion.div>

        {/* Main Content */}
        {newArrivalData.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            {newArrivalData.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 text-lg">No new arrivals found</p>
            <p className="text-gray-400 text-sm mt-2">
              Check back soon for new products
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
