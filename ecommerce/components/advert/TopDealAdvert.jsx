"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Tag, Truck } from "lucide-react";
import { motion } from "framer-motion";
import deliveryCar from "../../data/images/deliveryCar.jpg";

export default function TopDealAdvert() {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div
        className="relative w-full rounded-2xl overflow-hidden shadow-lg group bg-white"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image - Left Side */}
          <div className="relative w-full sm:w-2/5 lg:w-2/5 h-50 sm:h-auto aspect-square sm:aspect-auto overflow-hidden">
            <Image
              src={deliveryCar}
              alt="Free Delivery"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
          </div>

          {/* Content - Right Side */}
          <div className="flex-1 px-6 sm:px-8 lg:px-10 py-8 sm:py-10 lg:py-12 bg-gradient-to-br from-[#0F172A] to-[#1a1a2e]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold mb-3">
                <Tag className="w-3.5 h-3.5" />
                TOP DEAL
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 leading-tight">
                Free Delivery on orders above GHS200 at all PUS
              </h2>

              {/* Description */}
              <p className="text-white/70 text-xs sm:text-sm mb-4">
                Limited quantity · T&Cs apply
              </p>

              {/* Button */}
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-white text-[#0F172A] px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl group/btn text-sm sm:text-base"
              >
                Shop Now
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-4 right-4 text-white/5 hidden sm:block">
          <Truck className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-red-500/5 rounded-full blur-3xl translate-y-1/2" />
      </motion.div>
    </section>
  );
}
