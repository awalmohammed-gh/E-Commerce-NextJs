"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Truck,
  Shield,
  CreditCard,
  Headphones,
  RefreshCw,
  Gift,
  Award,
} from "lucide-react";

export default function Services() {
  const services = [
    {
      id: 1,
      icon: Clock,
      title: "24/7 Service",
      description: "Available around the clock for your convenience",
    },
    {
      id: 2,
      icon: Truck,
      title: "Fast Delivery",
      description: "Free delivery on orders above GHS200",
    },
    {
      id: 3,
      icon: Shield,
      title: "Secure Shopping",
      description: "100% secure payment and data protection",
    },
    {
      id: 4,
      icon: RefreshCw,
      title: "Easy Returns",
      description: "30-day return policy on all products",
    },
    {
      id: 5,
      icon: Headphones,
      title: "24/7 Support",
      description: "Dedicated customer service team",
    },
    {
      id: 6,
      icon: CreditCard,
      title: "Flexible Payment",
      description: "Multiple payment options available",
    },
    {
      id: 7,
      icon: Gift,
      title: "Special Offers",
      description: "Exclusive deals and discounts daily",
    },
    {
      id: 8,
      icon: Award,
      title: "Quality Guarantee",
      description: "Premium products with quality assurance",
    },
  ];

  return (
    <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] mb-2">
            Why Shop With Us
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            We provide the best shopping experience for our customers
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.05 }}
          viewport={{ once: true }}
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className="group flex flex-col items-center text-center p-4 sm:p-6 rounded-xl border border-gray-100 hover:border-[#0F172A]/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              {/* Icon */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0F172A]/5 group-hover:bg-[#0F172A] transition-all duration-300 flex items-center justify-center mb-3 sm:mb-4">
                <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#0F172A] group-hover:text-white transition-all duration-300" />
              </div>

              {/* Title */}
              <h3 className="text-xs sm:text-sm font-semibold text-[#0F172A] mb-1">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
