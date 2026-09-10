"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TopAdvert() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const closed = localStorage.getItem("topAdvertClosed");
    if (closed === "true") setIsVisible(false);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("topAdvertClosed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="banner"
          aria-label="Announcement"
          className="bg-[#EEEEEE] py-2 border-b border-gray-200/50 overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
            <p className="text-xs sm:text-sm text-[#0F172A] text-center sm:text-left">
              <span className="font-bold">AURA</span>
              <span className="hidden xs:inline"> | </span>
              <span className="inline xs:hidden"> </span>
              Style Meets Technology — Discover Something New Today.
            </p>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/shop"
                className="text-xs sm:text-sm font-semibold text-[#0F172A] hover:text-[#0F172A]/70 transition-colors duration-200 hover:underline underline-offset-2"
              >
                Shop Now
              </Link>

              <button
                type="button"
                onClick={handleClose}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors duration-200"
                aria-label="Close advertisement"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
