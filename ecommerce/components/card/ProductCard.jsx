"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEcommerce } from "@/context/EcommerceContextProvider";

export default function ProductCard({ product }) {
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

  //  Add-to-cart / navigate-to-details handler
  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasSizes) {
      router.push(`/product/${_id}`);
    } else {
      handleAddToCart(_id, "default");
    }
  };

  return (
    <motion.div
      className="group relative bg-white rounded-[22px] overflow-hidden border border-gray-100/50 transition-shadow duration-300 hover:shadow-xl"
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
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[11px] font-medium px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
              {category}
            </span>
          </div>

          {/* Discount badge */}
          {hasOffer && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-medium px-2.5 py-1 rounded-full z-10">
              {discount}% off
            </div>
          )}

          {/* Quick actions */}
          <motion.div
            className="absolute top-3 right-3 flex flex-col gap-2 z-10"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              className="bg-white/95 rounded-full p-2 border border-gray-100 hover:bg-white transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
              aria-label="Add to wishlist"
            >
              <Heart
                className={`w-4 h-4 transition-colors duration-200 ${
                  isLiked ? "fill-red-500 text-red-500" : "text-gray-700"
                }`}
              />
            </button>

            <button
              className="bg-white/95 rounded-full p-2 border border-gray-100 hover:bg-white transition-colors duration-200"
              aria-label="Quick view"
              onClick={(e) => {
                e.preventDefault();
                router.push(`/product/${_id}`);
              }}
            >
              <Eye className="w-4 h-4 text-gray-700" />
            </button>
          </motion.div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-2">
          <h3
            className="text-[15px] text-gray-800 line-clamp-2 leading-snug"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {name}
          </h3>

          <div className="flex items-baseline gap-2 pt-1">
            {hasOffer ? (
              <>
                <span
                  className="text-xl text-gray-900"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {offerPrice.toLocaleString("en-GH", {
                    style: "currency",
                    currency: "GHS",
                  })}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {offerPrice.toLocaleString("en-GH", {
                    style: "currency",
                    currency: "GHS",
                  })}
                </span>
              </>
            ) : (
              <span
                className="text-xl text-gray-900"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {price.toLocaleString("en-GH", {
                  style: "currency",
                  currency: "GHS",
                })}
              </span>
            )}
          </div>

          {/* Cart button */}
          <motion.button
            type="button"
            onClick={handleCartClick}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-gray-900 text-white py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center gap-2 mt-2"
          >
            <ShoppingCart className="w-4 h-4" />
            {hasSizes ? "Select Size" : "Add to cart"}
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
}
