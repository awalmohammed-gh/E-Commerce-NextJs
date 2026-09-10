"use client";

import { products } from "@/data/images/data";
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
  const { _id } = useParams();
  const router = useRouter();

  const [productData, setProductData] = useState(null);
  const [thumbnails, setThumbnails] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  const {
    addItems,
    handleAddToCart,
    handleRemoveFromCart,
    updateItemQuantity, 
  } = useEcommerce();

  useEffect(() => {
    const product = products.find((p) => p._id === _id);

    if (product) {
      setProductData(product);
      setThumbnails(product.images[0]);

      if (product.sizes?.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [_id]);


  const productId = productData?._id;
  const productSizes = productData?.sizes ?? [];
  const hasSizes = productSizes.length > 0;
  const sizeKey = hasSizes ? selectedSize : "default";

  useEffect(() => {
    if (!productData) return;

    const inCart = addItems?.[productId]?.[sizeKey] ?? 0;
    setQuantity(inCart > 0 ? inCart : 1);
  }, [productData, productId, sizeKey, addItems]);

  const cartQuantity = useMemo(() => {
    return addItems?.[productId]?.[sizeKey] ?? 0;
  }, [addItems, productId, sizeKey]);

  if (!productData) return <LoadingSpinner />;

  const {
    name,
    price,
    offerPrice,
    category,
    images,
    description,
    rating = 4.5,
    reviews = 120,
  } = productData;

  const hasOffer = offerPrice && offerPrice < price;
  const discount = hasOffer
    ? Math.round(((price - offerPrice) / price) * 100)
    : 0;


  const handleAddToCartClick = () => {
    if (hasSizes && !selectedSize) {
      alert("Please select a size");
      return;
    }
    // Add the currently selected quantity to the cart
    // (if quantity was changed locally without pressing +/-)
    const diff = quantity - cartQuantity;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) handleAddToCart(productId, sizeKey);
    } else if (diff < 0) {
      for (let i = 0; i < Math.abs(diff); i++)
        handleRemoveFromCart(productId, sizeKey);
    } else if (cartQuantity === 0) {
      handleAddToCart(productId, sizeKey);
    }
  };

  const handleBuyNow = () => {
    if (hasSizes && !selectedSize) {
      alert("Please select a size");
      return;
    }
    if (cartQuantity === 0) {
      handleAddToCart(productId, sizeKey);
    }
    router.push("/shopping-cart");
  };

  const handleRemoveFromCartClick = () => {
    if (!cartQuantity) return;
    handleRemoveFromCart(productId, sizeKey);
  };

  const handleDecreaseQuantity = () => {
    const newQuantity = Math.max(1, quantity - 1);
    setQuantity(newQuantity);
    updateItemQuantity(productId, sizeKey, newQuantity); 
  };

  const handleIncreaseQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    updateItemQuantity(productId, sizeKey, newQuantity);
  };

  const handleShare = async () => {
    if (navigator?.share) {
      try {
        await navigator.share({
          title: name,
          text: `Check out ${name}`,
          url: window.location.href,
        });
      } catch (err) {
        // user dismissed — ignore
      }
    } else {
      // fallback
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard");
    }
  };


  return (
    <>
      <section className="bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm mb-6 flex-wrap">
            <Link
              href="/"
              className="text-gray-400 hover:text-[#0F172A] transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <Link
              href="/shop"
              className="text-gray-400 hover:text-[#0F172A] transition-colors"
            >
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
            {/* Left — Images */}
            <div className="lg:w-1/2">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Thumbnails */}
                <div className="flex sm:flex-col gap-3 order-2 sm:order-1">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setThumbnails(image)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all duration-200 ${
                        thumbnails === image
                          ? "border-[#0F172A]"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>

                {/* Main Image */}
                <motion.div
                  className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 order-1 sm:order-2"
                  key={thumbnails}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={thumbnails}
                    alt={name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {hasOffer && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full">
                      {discount}% OFF
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Right — Details */}
            <div className="lg:w-1/2 space-y-5">
              {/* Category */}
              <p className="text-sm text-gray-400 uppercase tracking-wider">
                {category}
              </p>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] leading-snug">
                {name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {rating}
                  </span>
                </div>
                <span className="text-sm text-gray-400">·</span>
                <span className="text-sm text-gray-400">{reviews} reviews</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-2 flex-wrap">
                {hasOffer ? (
                  <>
                    <span className="text-3xl font-bold text-[#0F172A]">
                      {offerPrice.toLocaleString("en-GH", {
                        style: "currency",
                        currency: "GHS",
                      })}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      {price.toLocaleString("en-GH", {
                        style: "currency",
                        currency: "GHS",
                      })}
                    </span>
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Save{" "}
                      {(price - offerPrice).toLocaleString("en-GH", {
                        style: "currency",
                        currency: "GHS",
                      })}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-[#0F172A]">
                    {price.toLocaleString("en-GH", {
                      style: "currency",
                      currency: "GHS",
                    })}
                  </span>
                )}
              </div>

              {/* Size Selection */}
              {hasSizes && (
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-[#0F172A]">
                      Select Size <span className="text-red-500">*</span>
                    </p>
                    <p className="text-xs text-gray-400">Size Guide</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {productSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          selectedSize === size
                            ? "bg-[#0F172A] text-white ring-2 ring-[#0F172A] ring-offset-2"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  {selectedSize && (
                    <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Size selected: {selectedSize}
                    </p>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-[#0F172A] mb-1">
                  About Product
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {description || "No description available for this product."}
                </p>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 pt-2 flex-wrap">
                <span className="text-sm font-medium text-[#0F172A]">
                  Quantity:
                </span>

                <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                  <button
                    onClick={handleDecreaseQuantity}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncreaseQuantity}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {cartQuantity > 0 && (
                  <span className="text-sm text-gray-500">
                    ({cartQuantity} in cart)
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCartClick}
                  className="flex-1 bg-[#0F172A] text-white py-3.5 rounded-full font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartQuantity > 0 ? "Update Cart" : "Add to Cart"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyNow}
                  className="flex-1 bg-indigo-500 text-white py-3.5 rounded-full font-medium hover:bg-indigo-600 transition-colors duration-200"
                >
                  Buy Now
                </motion.button>
              </div>

              {/* Wishlist & Share */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0F172A] transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isLiked ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                  />
                  Wishlist
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0F172A] transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-[#0F172A]" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-[#0F172A]" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <RefreshCw className="w-5 h-5 text-[#0F172A]" />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Items */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
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
