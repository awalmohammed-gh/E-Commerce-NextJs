"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Heart,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RefreshCw,
  Minus,
  Plus,
  Share2,
  Check,
} from "lucide-react";

import Newsletter from "@/components/common/NewsLetter";
import LoadingSpinner from "@/ui/LoadingSpinner";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import RelatedItems from "@/components/card/RelatedItems";

export default function MyProductDetails() {
  const params = useParams();
  const router = useRouter();
  const productRouteId = Array.isArray(params._id) ? params._id[0] : params._id;

  const [productData, setProductData] = useState(null);
  const [thumbnail, setThumbnail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  const { addItems, handleAddToCart, products } = useEcommerce();

  useEffect(() => {
    if (!productRouteId || !Array.isArray(products)) return;

    const product = products.find(
      (item) => String(item._id) === String(productRouteId),
    );

    if (!product) return;

    setProductData(product);
    setThumbnail(product.images?.[0] || "");

    // No automatic selection. Shirts require the user to select a size.
    setSelectedSize("");
  }, [productRouteId, products]);

  const productId = productData?._id;

  const productSizes = Array.isArray(productData?.sizes)
    ? productData.sizes.filter(Boolean)
    : [];

  const hasSizes = productSizes.length > 0;

  // Products without sizes use "default" automatically.
  const sizeKey = hasSizes ? selectedSize : "default";

  const cartQuantity = useMemo(() => {
    return addItems?.[productId]?.[sizeKey] || 0;
  }, [addItems, productId, sizeKey]);

  useEffect(() => {
    if (!productData) return;
    setQuantity(cartQuantity > 0 ? cartQuantity : 1);
  }, [productData, sizeKey, cartQuantity]);

  if (!productData) {
    return <LoadingSpinner />;
  }

  const {
    name,
    price,
    offerPrice,
    category,
    images = [],
    description,
    rating = 4.5,
    reviews = 120,
  } = productData;

  const hasOffer = offerPrice && offerPrice < price;

  const discount = hasOffer
    ? Math.round(((price - offerPrice) / price) * 100)
    : 0;

  const handleAddToCartClick = async () => {
    if (hasSizes && !selectedSize) {
      alert("Please select a size");
      return;
    }

    const quantityToAdd = quantity - cartQuantity;

    if (quantityToAdd <= 0) return;

    for (let index = 0; index < quantityToAdd; index += 1) {
      await handleAddToCart(productId, sizeKey);
    }
  };

  const handleBuyNow = async () => {
    if (hasSizes && !selectedSize) {
      alert("Please select a size");
      return;
    }

    const quantityToAdd = quantity - cartQuantity;

    for (let index = 0; index < quantityToAdd; index += 1) {
      await handleAddToCart(productId, sizeKey);
    }

    router.push("/shopping-cart");
  };

  const handleDecreaseQuantity = () => {
    const minimumQuantity = cartQuantity > 0 ? cartQuantity : 1;
    setQuantity((current) => Math.max(minimumQuantity, current - 1));
  };

  const handleIncreaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: `Check out ${name}`,
          url: window.location.href,
        });
      } catch {
        // Share dialog was closed.
      }
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard");
  };

  return (
    <>
      <section className="bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 text-sm mb-6 flex-wrap">
            <Link href="/" className="text-gray-400 hover:text-[#0F172A]">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />

            <Link href="/shop" className="text-gray-400 hover:text-[#0F172A]">
              Shop
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />

            <span className="text-gray-400">{category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />

            <span className="text-[#0F172A] font-medium line-clamp-1">
              {name}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="lg:w-1/2">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex sm:flex-col gap-3 order-2 sm:order-1">
                  {images.map((image, index) => (
                    <button
                      key={image}
                      onClick={() => setThumbnail(image)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 ${
                        thumbnail === image
                          ? "border-[#0F172A]"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${name} thumbnail ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>

                <motion.div
                  key={thumbnail}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 order-1 sm:order-2"
                >
                  {thumbnail && (
                    <Image
                      src={thumbnail}
                      alt={name}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}

                  {hasOffer && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                      {discount}% OFF
                    </span>
                  )}
                </motion.div>
              </div>
            </div>

            <div className="lg:w-1/2 space-y-5">
              <p className="text-sm text-gray-400 uppercase tracking-wider">
                {category}
              </p>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                {name}
              </h1>

              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold">{rating}</span>
                <span className="text-gray-400">·</span>
                <span className="text-sm text-gray-400">{reviews} reviews</span>
              </div>

              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-[#0F172A]">
                  {(hasOffer ? offerPrice : price).toLocaleString("en-GH", {
                    style: "currency",
                    currency: "GHS",
                  })}
                </span>

                {hasOffer && (
                  <span className="text-lg text-gray-400 line-through">
                    {price.toLocaleString("en-GH", {
                      style: "currency",
                      currency: "GHS",
                    })}
                  </span>
                )}
              </div>

              {hasSizes && (
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-[#0F172A]">
                      Select Size <span className="text-red-500">*</span>
                    </p>

                    {selectedSize && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Selected: {selectedSize}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {productSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-12 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedSize === size
                            ? "bg-[#0F172A] text-white ring-2 ring-[#0F172A] ring-offset-2"
                            : "bg-gray-100 text-[#0F172A] hover:bg-gray-200"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-[#0F172A] mb-1">
                  About Product
                </p>
                <p className="text-gray-600 text-sm">
                  {description || "No description available for this product."}
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <span className="text-sm font-medium">Quantity:</span>

                <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                  <button
                    onClick={handleDecreaseQuantity}
                    className="px-3 py-2 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="w-10 text-center text-sm font-medium">
                    {quantity}
                  </span>

                  <button
                    onClick={handleIncreaseQuantity}
                    className="px-3 py-2 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {cartQuantity > 0 && (
                  <span className="text-sm text-gray-500">
                    ({cartQuantity} saved in cart)
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCartClick}
                  className="flex-1 bg-[#0F172A] text-white py-3.5 rounded-full font-medium flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyNow}
                  className="flex-1 bg-indigo-500 text-white py-3.5 rounded-full font-medium"
                >
                  Buy Now
                </motion.button>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => setIsLiked((current) => !current)}
                  className="flex items-center gap-2 text-sm text-gray-500"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isLiked ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                  />
                  Wishlist
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-sm text-gray-500"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 border-t border-gray-100">
                <div className="flex gap-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5" /> Free Delivery
                </div>
                <div className="flex gap-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5" /> Secure Payment
                </div>
                <div className="flex gap-3 text-sm text-gray-600">
                  <RefreshCw className="w-5 h-5" /> Easy Returns
                </div>
              </div>
            </div>
          </div>

          <RelatedItems
            category={productData.category}
            currentProductId={productData._id}
          />
        </div>
      </section>

      <Newsletter />
    </>
  );
}
