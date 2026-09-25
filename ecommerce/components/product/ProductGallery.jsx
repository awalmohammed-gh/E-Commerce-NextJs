"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductImage from "@/components/card/ProductImage";

/*
  Product photos from MongoDB/Cloudinary, all at the same 4:5 ratio.
  Phones: a swipeable strip (native scroll-snap) with position dots.
  md and up: one large image with thumbnails beside it and arrows.
*/
export default function ProductGallery({ images = [], name, badge }) {
  const photos = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const stripRef = useRef(null);

  const count = Math.max(photos.length, 1);
  const go = (index) => setActive((index + count) % count);

  // Track which photo is in view while swiping on phones
  const onStripScroll = () => {
    const el = stripRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== active) setActive(index);
  };

  return (
    <div>
      {/* Phones: swipe */}
      <div className="relative -mx-4 sm:-mx-6 md:hidden">
        <div
          ref={stripRef}
          onScroll={onStripScroll}
          className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar"
          aria-label={`${name} photos`}
        >
          {(photos.length ? photos : [null]).map((src, i) => (
            <div key={src || i} className="relative aspect-4/5 w-full shrink-0 snap-center bg-sand">
              <ProductImage
                src={src}
                alt={photos.length > 1 ? `${name}, photo ${i + 1} of ${photos.length}` : name}
                priority={i === 0}
                sizes="(max-width: 767px) 100vw, 1px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {badge && <div className="absolute top-3 left-4">{badge}</div>}
        {photos.length > 1 && (
          <div className="glass-light absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-3 py-2 shadow-none" aria-hidden="true">
            {photos.map((src, i) => (
              <span
                key={src}
                className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-terracotta-deep" : "w-1.5 bg-ink/25"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* md+: main image with thumbnails */}
      <div className="hidden gap-4 md:flex">
        {photos.length > 1 && (
          <ul className="flex w-20 shrink-0 flex-col gap-3" aria-label="Choose a photo">
            {photos.map((src, i) => (
              <li key={src}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === active ? "true" : undefined}
                  className={`relative block aspect-4/5 w-full overflow-hidden rounded-field bg-sand transition-opacity duration-300 ${
                    i === active ? "ring-1 ring-ink ring-offset-2 ring-offset-paper" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <ProductImage src={src} alt="" sizes="72px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="group relative aspect-4/5 flex-1 overflow-hidden rounded-card bg-sand">
          {/* Crossfade between photos; the first one shows without a fade */}
          <AnimatePresence initial={false}>
            <motion.div
              key={photos[active] || "none"}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.015 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProductImage
                src={photos[active]}
                alt={name}
                priority
                sizes="(max-width: 1023px) 55vw, 45vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          {badge && <div className="absolute top-4 left-4">{badge}</div>}
          {photos.length > 1 && (
            <span className="glass-light absolute right-4 bottom-4 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.14em] tabular-nums shadow-none">
              {String(active + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </span>
          )}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(active - 1)}
                className="glass-light absolute top-1/2 left-4 flex h-11 w-11 -translate-x-2 -translate-y-1/2 items-center justify-center rounded-full opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100 hover:bg-paper focus-visible:translate-x-0 focus-visible:opacity-100"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(active + 1)}
                className="glass-light absolute top-1/2 right-4 flex h-11 w-11 translate-x-2 -translate-y-1/2 items-center justify-center rounded-full opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100 hover:bg-paper focus-visible:translate-x-0 focus-visible:opacity-100"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
