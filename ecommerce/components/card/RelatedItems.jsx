"use client";

import { products } from "@/data/images/data";
import { useEffect, useState } from "react";
import ProductCard from "@/components/card/ProductCard";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RelatedItems({ category }) {
  const [relatedItems, setRelatedItems] = useState([]);

  useEffect(() => {
    if (category) {
      const filtered = products.filter(
        (product) =>
          product.category === category &&
          // Exclude current product if needed (you can pass current product id)
          product._id !== category, // This will be handled by the parent
      );
      // Shuffle and get 4 random items
      const shuffled = filtered.sort(() => 0.5 - Math.random());
      setRelatedItems(shuffled.slice(0, 4));
    }
  }, [category]);

  if (relatedItems.length === 0) {
    return (
      <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <p className="text-gray-500 text-sm">No related products found</p>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white py-12 px-4 sm:px-6 border-t border-gray-100">
      <div className="">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
            You May Also Like
          </h2>
          <Link
            href={`/shop?category=${category}`}
            className="text-sm text-[#0F172A] hover:text-gray-600 transition-colors duration-200 flex items-center gap-1 group mt-2 sm:mt-0"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          viewport={{ once: true }}
        >
          {relatedItems.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
