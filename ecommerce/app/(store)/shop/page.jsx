"use client";

import { products } from "@/data/images/data";
import {
  ChevronRight,
  SearchIcon,
  CheckCircle,
  Grid3x3,
  LayoutList,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/card/ProductCard";
import Image from "next/image";
import Newsletter from "@/components/common/NewsLetter";
import { shopBanner } from "@/data/db";

/* ---------------------------------------------------------
   Compute absolute min / max from the full product catalog.
   These become the bounds of the slider.
--------------------------------------------------------- */
const effectivePrice = (p) =>
  p.offerPrice && p.offerPrice < p.price ? p.offerPrice : p.price;

const ABS_MIN = Math.floor(Math.min(...products.map((p) => effectivePrice(p))));
const ABS_MAX = Math.ceil(Math.max(...products.map((p) => effectivePrice(p))));

export default function MyShop() {
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [grid, setGrid] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([ABS_MIN, ABS_MAX]);
  const productPerPage = 10;

  /* ---------------------------------------------------------
     Subcategories scoped to the selected category
  --------------------------------------------------------- */
  const subCategories = useMemo(() => {
    const pool =
      selectedCategory === "All"
        ? products
        : products.filter((p) => p.category === selectedCategory);

    const unique = [
      ...new Set(
        pool.map((p) => p.subCategory).filter((s) => s && s.trim().length > 0),
      ),
    ];

    return ["All", ...unique];
  }, [selectedCategory]);

  /* ---------------------------------------------------------
     Filtered products
  --------------------------------------------------------- */
  const filteredProduct = useMemo(() => {
    const q = search.trim().toLowerCase();
    const [minPrice, maxPrice] = priceRange;

    return products
      .filter((product) => {
        if (!q) return true;
        return (
          product.name?.toLowerCase().includes(q) ||
          product.category?.toLowerCase().includes(q) ||
          product.subCategory?.toLowerCase().includes(q)
        );
      })
      .filter(
        (product) =>
          selectedCategory === "All" || product.category === selectedCategory,
      )
      .filter(
        (product) =>
          selectedSubCategory === "All" ||
          product.subCategory === selectedSubCategory,
      )
      .filter((product) => {
        const price = effectivePrice(product);
        return price >= minPrice && price <= maxPrice;
      });
  }, [search, selectedCategory, selectedSubCategory, priceRange]);

  const startIndex = (currentPage - 1) * productPerPage;
  const paginatedProducts = filteredProduct.slice(
    startIndex,
    startIndex + productPerPage,
  );
  const totalPages = Math.ceil(filteredProduct.length / productPerPage);

  /* ---------------------------------------------------------
     Handlers
  --------------------------------------------------------- */
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory("All");
    setCurrentPage(1);
  };

  const handleSubCategoryChange = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setCurrentPage(1);
  };

  const handleMinPrice = (value) => {
    const next = Math.min(Number(value), priceRange[1]);
    setPriceRange([next, priceRange[1]]);
    setCurrentPage(1);
  };

  const handleMaxPrice = (value) => {
    const next = Math.max(Number(value), priceRange[0]);
    setPriceRange([priceRange[0], next]);
    setCurrentPage(1);
  };

  const clearPriceRange = () => {
    setPriceRange([ABS_MIN, ABS_MAX]);
    setCurrentPage(1);
  };

  const isPriceFiltered =
    priceRange[0] !== ABS_MIN || priceRange[1] !== ABS_MAX;

  /* ---------------------------------------------------------
     Banner slider
  --------------------------------------------------------- */
  const slideImageIndex = shopBanner[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % shopBanner.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + shopBanner.length) % shopBanner.length,
    );
  };

  useEffect(() => {
    const nextInter = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(nextInter);
  }, []);

  /* ---------------------------------------------------------
     Progress-bar percentages for the slider track
  --------------------------------------------------------- */
  const minPercent =
    ((priceRange[0] - ABS_MIN) / (ABS_MAX - ABS_MIN || 1)) * 100;
  const maxPercent =
    ((priceRange[1] - ABS_MIN) / (ABS_MAX - ABS_MIN || 1)) * 100;

  /* ---------------------------------------------------------
     Shared filter panel (used for both desktop sidebar and mobile drawer)
  --------------------------------------------------------- */
  const FilterPanel = (
    <div className="rounded-2xl p-5 border border-gray-100 space-y-6 bg-white">
      {/* Categories */}
      <div>
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Categories
        </p>
        <div className="space-y-1">
          {categories.map((cat, index) => (
            <button
              key={index}
              onClick={() => {
                handleCategoryChange(cat);
                scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                selectedCategory === cat
                  ? "bg-[#0F172A] text-white"
                  : "hover:bg-gray-50 text-[#0F172A]"
              }`}
            >
              <span className="text-sm font-medium capitalize">{cat}</span>
              {selectedCategory === cat && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckCircle className="w-4 h-4" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategories */}
      {subCategories.length > 1 && (
        <div className="pt-5 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Subcategories
          </p>
          <div className="flex flex-wrap gap-2">
            {subCategories.map((sub, index) => (
              <button
                key={index}
                onClick={() => {
                  handleSubCategoryChange(sub);
                  scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors duration-200 border ${
                  selectedSubCategory === sub
                    ? "bg-[#0F172A] text-white border-[#0F172A]"
                    : "bg-white text-[#0F172A] border-gray-200 hover:border-[#0F172A]"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="pt-5 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Price Range
          </p>
          {isPriceFiltered && (
            <button
              onClick={clearPriceRange}
              className="text-xs text-gray-400 hover:text-[#0F172A] underline underline-offset-2 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Current range display */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-[#0F172A]">
            GH₵{priceRange[0].toLocaleString()}
          </span>
          <span className="text-xs text-gray-400">—</span>
          <span className="text-sm font-semibold text-[#0F172A]">
            GH₵{priceRange[1].toLocaleString()}
          </span>
        </div>

        {/* Dual slider */}
        <div className="relative h-6 flex items-center">
          {/* Track background */}
          <div className="absolute left-0 right-0 h-1 bg-gray-200 rounded-full" />

          {/* Active track */}
          <div
            className="absolute h-1 bg-[#0F172A] rounded-full"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />

          {/* Min thumb */}
          <input
            type="range"
            min={ABS_MIN}
            max={ABS_MAX}
            value={priceRange[0]}
            onChange={(e) => handleMinPrice(e.target.value)}
            className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0F172A] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#0F172A] [&::-moz-range-thumb]:cursor-pointer"
            aria-label="Minimum price"
          />

          {/* Max thumb */}
          <input
            type="range"
            min={ABS_MIN}
            max={ABS_MAX}
            value={priceRange[1]}
            onChange={(e) => handleMaxPrice(e.target.value)}
            className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0F172A] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#0F172A] [&::-moz-range-thumb]:cursor-pointer"
            aria-label="Maximum price"
          />
        </div>

        {/* Manual input boxes */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div>
            <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">
              Min
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg px-2 py-1.5 focus-within:border-[#0F172A] transition-colors">
              <span className="text-xs text-gray-400 mr-1">GH₵</span>
              <input
                type="number"
                min={ABS_MIN}
                max={priceRange[1]}
                value={priceRange[0]}
                onChange={(e) => handleMinPrice(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-[#0F172A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">
              Max
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg px-2 py-1.5 focus-within:border-[#0F172A] transition-colors">
              <span className="text-xs text-gray-400 mr-1">GH₵</span>
              <input
                type="number"
                min={priceRange[0]}
                max={ABS_MAX}
                value={priceRange[1]}
                onChange={(e) => handleMaxPrice(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-[#0F172A]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Count */}
      <div className="pt-5 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-[#0F172A]">
            {filteredProduct.length}
          </span>{" "}
          products
        </p>
      </div>
    </div>
  );

  return (
    <section className="bg-white text-[#0F172A]">
      {/* Shop Banner Slider */}
      <div className="relative w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="relative w-full h-[200px] sm:h-[250px] lg:h-[300px]"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={slideImageIndex.image}
              alt={slideImageIndex.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/50 to-[#0F172A]/10" />

            <div className="absolute -top-10 right-10 w-56 h-56 rounded-full bg-orange-400/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />

            <div className="relative h-full flex flex-col justify-end px-4 sm:px-6 lg:px-8 pb-7">
              <div className="container mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                >
                  <p className="text-orange-400 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-2">
                    {slideImageIndex.category}
                  </p>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-[1.05] max-w-lg">
                    {slideImageIndex.title}
                  </h1>
                  <p className="text-white/70 text-sm sm:text-base mt-2 max-w-md">
                    {slideImageIndex.description}
                  </p>
                  <div className="flex items-center gap-2 text-white/60 text-sm mt-3">
                    <Link
                      href={"/"}
                      className="hover:text-white transition-colors"
                    >
                      Home
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-white/90">Shop</span>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {shopBanner.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-6 bg-white"
                      : "w-1.5 bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 z-10"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search + Mobile Filter Button */}
        <div className="flex items-center justify-between gap-3 py-5">
          <button
            onClick={() => setShowFilters(true)}
            className="lg:hidden flex items-center gap-2 border border-gray-200 rounded-full py-2.5 px-4 bg-gray-50 text-sm font-medium text-[#0F172A] hover:bg-white hover:border-[#0F172A] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {isPriceFiltered && (
              <span className="w-2 h-2 rounded-full bg-[#0F172A]" />
            )}
          </button>

          <div className="flex items-center gap-2 border border-gray-200 rounded-full py-2.5 px-4 w-full sm:w-72 bg-gray-50 focus-within:bg-white focus-within:border-[#0F172A] transition-colors duration-200 ml-auto">
            <SearchIcon className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              className="bg-transparent outline-none w-full text-sm text-[#0F172A] placeholder:text-gray-400"
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Left Sidebar */}
          <motion.div
            className="hidden lg:block lg:w-1/4 w-full"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="lg:sticky lg:top-10">{FilterPanel}</div>
          </motion.div>

          {/* Right Side - Main Content */}
          <div className="lg:w-3/4 w-full">
            <div className="flex items-center justify-between mb-5">
              <motion.h2
                className="text-lg font-semibold text-[#0F172A] capitalize"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {selectedCategory === "All"
                  ? selectedSubCategory === "All"
                    ? "All Products"
                    : selectedSubCategory
                  : selectedSubCategory === "All"
                    ? selectedCategory
                    : `${selectedCategory} — ${selectedSubCategory}`}
              </motion.h2>
              <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setGrid("grid")}
                  className={`p-1.5 rounded-md transition-colors duration-200 ${
                    grid === "grid"
                      ? "bg-[#0F172A] text-white"
                      : "text-gray-400 hover:text-[#0F172A]"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGrid("list")}
                  className={`p-1.5 rounded-md transition-colors duration-200 ${
                    grid === "list"
                      ? "bg-[#0F172A] text-white"
                      : "text-gray-400 hover:text-[#0F172A]"
                  }`}
                  aria-label="List view"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={
                  selectedCategory +
                  selectedSubCategory +
                  search +
                  currentPage +
                  grid +
                  priceRange.join("-")
                }
                className={`grid ${
                  grid === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                } gap-5`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {paginatedProducts.length > 0 ? (
                  grid === "grid" ? (
                    paginatedProducts.map((product, index) => (
                      <ProductCard product={product} key={index} />
                    ))
                  ) : (
                    paginatedProducts.map((product, index) => (
                      <motion.div
                        key={index}
                        className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-colors duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Link
                          href={`/product/${product._id}`}
                          className="flex flex-col sm:flex-row"
                        >
                          <div className="relative w-full sm:w-44 h-44 sm:h-auto aspect-square sm:aspect-auto flex-shrink-0 overflow-hidden bg-gray-50">
                            <Image
                              src={
                                product.images?.[0] || "/placeholder-image.jpg"
                              }
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 640px) 100vw, 176px"
                            />
                            {product.offerPrice &&
                              product.offerPrice < product.price && (
                                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  -
                                  {Math.round(
                                    ((product.price - product.offerPrice) /
                                      product.price) *
                                      100,
                                  )}
                                  %
                                </div>
                              )}
                          </div>

                          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-3">
                            <div>
                              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-gray-400 mb-1">
                                <span className="capitalize">
                                  {product.category}
                                </span>
                                {product.subCategory && (
                                  <>
                                    <span className="text-gray-300">·</span>
                                    <span className="capitalize">
                                      {product.subCategory}
                                    </span>
                                  </>
                                )}
                              </div>

                              <h3 className="text-base font-semibold text-[#0F172A] line-clamp-2 mb-1.5 group-hover:text-[#0F172A]/80 transition-colors">
                                {product.name}
                              </h3>

                              {product.description && (
                                <p className="text-sm text-gray-500 line-clamp-2">
                                  {product.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-baseline gap-2">
                                {product.offerPrice &&
                                product.offerPrice < product.price ? (
                                  <>
                                    <span className="text-lg font-bold text-[#0F172A]">
                                      GH₵
                                      {product.offerPrice.toLocaleString(
                                        "en-GH",
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        },
                                      )}
                                    </span>
                                    <span className="text-sm text-gray-400 line-through">
                                      GH₵
                                      {product.price.toLocaleString("en-GH", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-lg font-bold text-[#0F172A]">
                                    GH₵
                                    {product.price.toLocaleString("en-GH", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                )}
                              </div>

                              <button
                                className="bg-[#0F172A] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors duration-200 flex-shrink-0"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log("Added to cart:", product._id);
                                }}
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  )
                ) : (
                  <motion.div
                    className="col-span-full text-center py-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-gray-500 text-lg">No products found</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Try adjusting your search or filter
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {totalPages > 1 && (
              <motion.div
                className="flex items-center justify-center gap-1 mt-10 pt-6 border-t border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-200 ${
                    currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-[#0F172A] hover:bg-gray-100"
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      Math.abs(pageNumber - currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`w-9 h-9 rounded-full text-sm font-medium transition-colors duration-200 ${
                            currentPage === pageNumber
                              ? "bg-[#0F172A] text-white"
                              : "text-gray-400 hover:bg-gray-100"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    if (
                      (pageNumber === 2 && currentPage > 3) ||
                      (pageNumber === totalPages - 1 &&
                        currentPage < totalPages - 2)
                    ) {
                      return (
                        <span
                          key={index}
                          className="w-9 h-9 flex items-center justify-center text-gray-300"
                        >
                          ···
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-200 ${
                    currentPage === totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-[#0F172A] hover:bg-gray-100"
                  }`}
                  aria-label="Next page"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
            />

            {/* Drawer */}
            <motion.div
              className="lg:hidden fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 shadow-2xl overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <p className="font-semibold text-[#0F172A]">Filters</p>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4">{FilterPanel}</div>

              <div className="p-4 border-t border-gray-100 sticky bottom-0 bg-white">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-[#0F172A] text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Show {filteredProduct.length} products
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Newsletter */}
      <div className="mt-16">
        <Newsletter />
      </div>
    </section>
  );
}
