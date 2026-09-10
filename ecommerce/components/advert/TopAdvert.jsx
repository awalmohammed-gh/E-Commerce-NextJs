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
          className="bg-[#F5F1EA] py-2 border-b border-[#1C1A17]/10 overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
            <p className="text-xs sm:text-sm text-[#1C1A17] text-center sm:text-left">
              <span className="font-bold tracking-tight">
                <span>ELE</span>
                <span className="text-[#D98880]">OKA</span>
              </span>
              <span className="hidden xs:inline text-[#8A6A52]"> | </span>
              <span className="inline xs:hidden"> </span>
              <span className="text-[#4A463F]">
                Free delivery in Accra on orders over GH₵500.
              </span>
            </p>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/shop"
                className="text-xs sm:text-sm font-semibold text-[#1C1A17] hover:text-[#D98880] transition-colors duration-200 underline underline-offset-4 decoration-[#1C1A17]/30 hover:decoration-[#D98880]"
              >
                Shop Dresses
              </Link>

              <button
                type="button"
                onClick={handleClose}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[#1C1A17] hover:bg-[#1C1A17]/10 transition-colors duration-200"
                aria-label="Close announcement"
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
