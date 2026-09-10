"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import advertImage from "../../data/images/advert1.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ThirdLandingAdvert() {
  const products = [
    {
      _id: "fashion-dress-001",
      title: "Dusty Pink Corset Mini Dress",
      description:
        "A romantic dusty pink mini dress featuring a fitted structured corset waist, ruched straight neckline, delicate spaghetti straps, and a flared pleated A-line skirt.",
      price: 750,
      image: advertImage,
    },
  ];

  return (
    <section className="bg-[#F5F1EA] py-10 sm:py-12 overflow-hidden">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Work+Sans:wght@400;500;600&display=swap");
        .font-editorial {
          font-family: "Cormorant Garamond", serif;
        }
        .font-utility {
          font-family: "Work Sans", sans-serif;
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {products.map((product) => (
          <div
            key={product._id}
            className="flex flex-col lg:flex-row items-center gap-8 lg:gap-14"
          >
            {/* Floating Image — no shadow, shorter height */}
            <motion.div
              className="w-full lg:w-[52%] relative flex justify-center lg:justify-start"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Gentle floating animation */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-full max-w-xs sm:max-w-sm lg:max-w-sm"
              >
                <motion.div
                  className="relative w-full aspect-square sm:aspect-[4/5] lg:aspect-[5/6] overflow-hidden rounded-2xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(max-width: 1024px) 80vw, 35vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                  />
                </motion.div>

                {/* Price tag */}
                <motion.div
                  className="absolute left-4 bottom-4 bg-[#F5F1EA] text-[#1C1A17] font-utility text-sm font-medium px-4 py-2 rounded-full"
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: 0.6,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                >
                  GH₵{product.price.toLocaleString()}
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Content */}
            <div className="w-full lg:w-[48%] flex flex-col justify-center font-utility">
              <motion.span
                className="inline-block text-[#8A6A52] text-sm font-medium mb-4 w-fit"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                custom={0}
              >
                New arrival
              </motion.span>

              <motion.h2
                className="font-editorial font-semibold text-[#1C1A17] text-3xl sm:text-4xl lg:text-[2.6rem] leading-[1.15] max-w-md"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                custom={1}
              >
                {product.title}
              </motion.h2>

              <motion.p
                className="text-[#4A463F] text-sm sm:text-base leading-relaxed mt-5 max-w-md"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                custom={2}
              >
                {product.description}
              </motion.p>

              <motion.div
                className="flex flex-wrap items-center gap-5 mt-8"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                custom={3}
              >
                <motion.button
                  className="bg-[#1C1A17] text-[#F5F1EA] px-6 py-3 rounded-full font-medium text-sm flex items-center gap-2 group hover:bg-[#332F29] transition-colors"
                  whileHover={{
                    y: -2,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  Shop this look
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </motion.button>
                <span className="text-[#8A6A52] text-sm font-medium">
                  Free delivery in Accra
                </span>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
