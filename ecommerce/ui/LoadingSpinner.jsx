"use client";

import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <span className="text-3xl font-bold text-[#0F172A] tracking-tight">
          AURA
        </span>
      </motion.div>

      {/* Spinner */}
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#0F172A] border-t-transparent rounded-full animate-spin"></div>
      </div>

      {/* Loading Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-4 text-sm text-gray-400 font-medium tracking-wider uppercase"
      >
        Loading...
      </motion.p>
    </div>
  );
}
