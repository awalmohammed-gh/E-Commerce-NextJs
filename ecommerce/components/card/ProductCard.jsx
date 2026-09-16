"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEcommerce } from "@/context/EcommerceContextProvider";

export default function ProductCard({ product, variant = "grid" }) {
  const router = useRouter();
  const { handleAddToCart } = useEcommerce();

  const { _id, name, price, offerPrice, category, images, sizes } = product;

  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const hasOffer = offerPrice && offerPrice < price;
  const discount = hasOffer
    ? Math.round(((price - offerPrice) / price) * 100)
    : 0;

  const hasSizes = sizes?.length > 0;

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasSizes) {
      router.push(`/product/${_id}`);
    } else {
      handleAddToCart(_id, "default");
    }
  };

  /* ---------------------------------------------------------
     LIST VARIANT - image on the left, details on the right
  --------------------------------------------------------- */
  if (variant === "list") {
    return (
      <motion.div
        className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100/50 transition-shadow duration-300 hover:shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Link href={`/product/${_id}`} className="flex gap-3 sm:gap-5">
          {/* Image - left */}
          <div className="relative w-28 sm:w-40 aspect-[4/5] shrink-0 overflow-hidden bg-gray-50">
            <Image
              src={images[0] || "/placeholder-image.jpg"}
              alt={name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 112px, 160px"
            />

            {hasOffer && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-full z-10">
                {discount}% off
              </div>
            )}
          </div>

          {/* Details - right */}
          <div className="flex-1 min-w-0 py-3 pr-3 sm:py-4 sm:pr-4 flex flex-col justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                {category}
              </p>

              <h3 className="text-[13px] sm:text-base text-gray-800 line-clamp-2 leading-snug">
                {name}
              </h3>

              <div className="flex items-baseline gap-1.5 sm:gap-2 mt-2 flex-wrap">
                {hasOffer ? (
                  <>
                    <span className="text-base sm:text-lg font-semibold text-gray-900">
                      GH₵{Number(offerPrice).toLocaleString()}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-400 line-through">
                      GH₵{Number(price).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-base sm:text-lg font-semibold text-gray-900">
                    GH₵{Number(price).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Actions row */}
            <div className="flex items-center gap-2 mt-1">
              <motion.button
                type="button"
                onClick={handleCartClick}
                whileTap={{ scale: 0.97 }}
                className="flex-1 sm:flex-none bg-gray-900 text-white px-3 sm:px-5 py-2 rounded-full text-[11px] sm:text-sm font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {hasSizes ? "Select Size" : "Add to cart"}
              </motion.button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsLiked(!isLiked);
                }}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-300 transition-colors shrink-0"
                aria-label="Add to wishlist"
              >
                <Heart
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                    isLiked ? "fill-red-500 text-red-500" : "text-gray-700"
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/product/${_id}`);
                }}
                className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full border border-gray-200 hover:border-gray-300 transition-colors shrink-0"
                aria-label="Quick view"
              >
                <Eye className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  /* ---------------------------------------------------------
     GRID VARIANT - default card (image on top)
  --------------------------------------------------------- */
  return (
    <motion.div
      className="group relative bg-white rounded-2xl sm:rounded-[22px] overflow-hidden border border-gray-100/50 transition-shadow duration-300 hover:shadow-xl"
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Link href={`/product/${_id}`} className="block">
        {/* Image */}
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-50">
          <Image
            src={images[0] || "/placeholder-image.jpg"}
            alt={name}
            fill
            loading="eager"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            priority
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Category Badge */}
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 z-10">
            <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] sm:text-[11px] font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/20 shadow-sm">
              {category}
            </span>
          </div>

          {/* Discount badge */}
          {hasOffer && (
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-red-500 text-white text-[10px] sm:text-[11px] font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full z-10">
              {discount}% off
            </div>
          )}

          {/* Quick actions */}
          <motion.div
            className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1.5 sm:gap-2 z-10"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              className="bg-white/95 rounded-full p-1.5 sm:p-2 border border-gray-100 hover:bg-white transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
              aria-label="Add to wishlist"
            >
              <Heart
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-200 ${
                  isLiked ? "fill-red-500 text-red-500" : "text-gray-700"
                }`}
              />
            </button>

            <button
              className="bg-white/95 rounded-full p-1.5 sm:p-2 border border-gray-100 hover:bg-white transition-colors duration-200"
              aria-label="Quick view"
              onClick={(e) => {
                e.preventDefault();
                router.push(`/product/${_id}`);
              }}
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
            </button>
          </motion.div>
        </div>

        {/* Details */}
        <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
          <h3 className="text-[13px] sm:text-[15px] text-gray-800 line-clamp-2 leading-snug">
            {name}
          </h3>

          <div className="flex items-baseline gap-1.5 sm:gap-2 pt-0.5 sm:pt-1 flex-wrap">
            {hasOffer ? (
              <>
                <span className="text-base sm:text-xl font-semibold text-gray-900">
                  GH₵{Number(offerPrice).toLocaleString()}
                </span>
                <span className="text-xs sm:text-sm text-gray-400 line-through">
                  GH₵{Number(price).toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-base sm:text-xl font-semibold text-gray-900">
                GH₵{Number(price).toLocaleString()}
              </span>
            )}
          </div>

          <motion.button
            type="button"
            onClick={handleCartClick}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-gray-900 text-white py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {hasSizes ? "Select Size" : "Add to cart"}
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
}
