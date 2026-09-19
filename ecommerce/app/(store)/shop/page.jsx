"use client";

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
import { useEcommerce } from "@/context/EcommerceContextProvider";

export default function MyShop() {
  const { products } = useEcommerce();

  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category))],
    [products],
  );

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [grid, setGrid] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
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
  }, [selectedCategory, products]);

  /* ---------------------------------------------------------
     Filtered products (no price filtering)
  --------------------------------------------------------- */
  const filteredProduct = useMemo(() => {
    const q = search.trim().toLowerCase();

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
      );
  }, [search, selectedCategory, selectedSubCategory, products]);

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
     Shared filter panel (desktop sidebar + mobile drawer)
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
            className="relative w-full h-50 sm:h-62.5 lg:h-75"
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
            <div className="absolute inset-0 bg-linear-to-t from-[#0F172A] via-[#0F172A]/50 to-[#0F172A]/10" />

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
                  grid
                }
                className={`grid ${
                  grid === "grid"
                    ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5"
                    : "grid-cols-1 gap-3 sm:gap-4"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product, index) => (
                    <ProductCard
                      key={product._id || index}
                      product={product}
                      variant={grid === "list" ? "list" : "grid"}
                    />
                  ))
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
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
            />

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
