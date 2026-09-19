"use client";

import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#F5F1EA]">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <span className="text-3xl font-bold tracking-tight">
          <span className="text-[#1C1A17]">ELE</span>
          <span className="text-[#D98880]">OKA</span>
        </span>
      </motion.div>

      {/* Spinner */}
      <div className="relative w-14 h-14">
        {/* Outer ring - static */}
        <div className="absolute inset-0 rounded-full border-2 border-[#1C1A17]/10" />

        {/* Spinning arc - primary */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#1C1A17] border-r-[#1C1A17]"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Spinning arc - accent (opposite direction) */}
        <motion.div
          className="absolute inset-1 rounded-full border-2 border-transparent border-b-[#D98880]"
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Center dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1C1A17]"
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Loading text with pulsing dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6 flex items-center gap-1"
      >
        <span className="text-xs text-[#8A6A52] font-medium tracking-[0.2em] uppercase">
          Loading
        </span>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1 h-1 rounded-full bg-[#8A6A52]"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
