"use client";

import { heroProducts } from "@/data/db";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AUTOPLAY_MS = 5000;

export default function Hero() {
  const [count, setCount] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef(null);

  const heroDataCount = heroProducts[count];

  const nextSlide = () => {
    setDirection(1);
    setCount((prev) => (prev + 1) % heroProducts.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCount((prev) => (prev - 1 + heroProducts.length) % heroProducts.length);
  };

  // Autoplay — pauses on hover/focus
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCount((prev) => (prev + 1) % heroProducts.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [isPaused, count]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
  };

  return (
    <section
      ref={sectionRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured products"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(e) => {
        if (!sectionRef.current?.contains(e.relatedTarget)) setIsPaused(false);
      }}
      className={`relative overflow-hidden focus:outline-none transition-colors duration-500 ${heroDataCount.bgColor}`}
    >
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap");
        .font-display {
          font-family: "Fraunces", serif;
        }
        .font-body {
          font-family: "Manrope", sans-serif;
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10 py-10 sm:py-14 lg:py-16">
          {/* Left — Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left font-body">
            <AnimatePresence mode="wait">
              <motion.div
                key={count}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <span className="inline-block bg-[#6B8F71]/15 text-[#3F5D45] text-xs font-medium px-3 py-1 rounded-full mb-4">
                  {heroDataCount.category}
                </span>

                <h1 className="font-display font-semibold text-[#1B3022] text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.1] max-w-lg mx-auto lg:mx-0">
                  {heroDataCount.title}
                </h1>

                <p className="text-[#1B3022]/70 text-sm sm:text-base leading-relaxed mt-4 max-w-md mx-auto lg:mx-0">
                  {heroDataCount.description}
                </p>

                <div className="flex items-center justify-center lg:justify-start gap-4 mt-7">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-[#C89B3C] text-[#1B3022] px-6 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 group shadow-sm hover:shadow-md transition-shadow"
                  >
                    Order now
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </motion.button>
                  <button className="text-[#1B3022] text-sm font-medium underline underline-offset-4 decoration-[#1B3022]/30 hover:decoration-[#1B3022] transition-colors">
                    View menu
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress indicators */}
            <div className="flex justify-center lg:justify-start gap-1.5 mt-8 max-w-55 mx-auto lg:mx-0">
              {heroProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > count ? 1 : -1);
                    setCount(index);
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === count}
                  className="relative h-1 flex-1 rounded-full bg-[#1B3022]/10 overflow-hidden"
                >
                  {index < count && (
                    <span className="absolute inset-0 bg-[#C89B3C]/60 rounded-full" />
                  )}
                  {index === count && (
                    <motion.span
                      key={`${count}-${isPaused}`}
                      className="absolute inset-y-0 left-0 bg-[#C89B3C] rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{
                        duration: AUTOPLAY_MS / 1000,
                        ease: "linear",
                      }}
                      style={{
                        animationPlayState: isPaused ? "paused" : "running",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right — Image with BIG dashed ring */}
          <div className="w-full lg:w-1/2 relative flex items-center justify-center h-60 sm:h-75 lg:h-85">
            {/* Dashed accent ring — now much larger, sits behind image */}
            <div
              className={`pointer-events-none absolute -z-10 w-72 h-72 sm:w-96 sm:h-96 lg:w-[440px] lg:h-[440px] rounded-full border-4 border-dashed opacity-30 rotate-12 transition-colors duration-500 ${heroDataCount.bgColor.replace(
                "bg-",
                "border-",
              )}`}
            />

            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) nextSlide();
                else if (info.offset.x > 60) prevSlide();
              }}
              className="relative w-full max-w-55 sm:max-w-70 lg:max-w-[320px] h-full cursor-grab active:cursor-grabbing"
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={count}
                  custom={direction}
                  initial={{ x: direction >= 0 ? 60 : -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction >= 0 ? -60 : 60, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={heroDataCount.image}
                    alt={heroDataCount.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain pointer-events-none"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Arrows */}
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-[#1B3022]/15 flex items-center justify-center text-[#1B3022]/50 opacity-0 hover:opacity-100 hover:text-[#1B3022] hover:border-[#1B3022]/40 transition-all lg:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-[#1B3022]/15 flex items-center justify-center text-[#1B3022]/50 opacity-0 hover:opacity-100 hover:text-[#1B3022] hover:border-[#1B3022]/40 transition-all lg:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
