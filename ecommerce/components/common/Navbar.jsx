"use client";

import { useEcommerce } from "@/context/EcommerceContextProvider";
import {
  ChevronDown,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  ShoppingBag,
  UserIcon,
  XIcon,
  User,
  Mail,
  Settings,
  HelpCircle,
  LogOut,
  LogIn,
  UserPlus,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [openUser, setOpenUser] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [openCategories, setOpenCategories] = useState(false);

  // Get the cart counter from context
  const { handleCartCount, addItems, user, isLoggedIn } = useEcommerce();

  // Memoize so we only recount when cart contents change
  const cartCount = useMemo(() => handleCartCount(), [addItems]);

  const userRef = useRef(null);
  const categoriesRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setOpenUser(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setOpenCategories(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setOpenUser(false);
        setOpenCategories(false);
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  // Women's fashion categories
  const categories = [
    { name: "Dresses", path: "/shop?category=dresses" },
    { name: "Tops & Blouses", path: "/shop?category=tops" },
    { name: "Skirts", path: "/shop?category=skirts" },
    { name: "Pants & Trousers", path: "/shop?category=pants" },
    { name: "Two-Piece Sets", path: "/shop?category=sets" },
    { name: "Outerwear", path: "/shop?category=outerwear" },
    { name: "Shoes", path: "/shop?category=shoes" },
    { name: "Bags & Accessories", path: "/shop?category=accessories" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) {
      router.push("/shop");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(search)}`);
    setOpenMenu(false);
  };

  // Helper to get user's first name
  const firstName = user?.fullName?.split(" ")[0] || "";

  return (
    <header className="bg-white/90 backdrop-blur-md text-[#0F172A] sticky top-0 left-0 right-0 w-full shadow-sm border-b border-gray-100 z-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* LEFT — Logo + desktop nav */}
          <div className="flex items-center gap-8 lg:gap-20">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
            >
              <span className="text-[#0F172A]">ELE</span>
              <span className="text-pink-500">OKA</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className="relative text-[#0F172A] hover:text-gray-600 transition-colors duration-200 text-sm lg:text-base font-medium group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0F172A] group-hover:w-full transition-all duration-300" />
                </Link>
              ))}

              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={() => setOpenCategories((v) => !v)}
                  className="flex items-center gap-1 text-[#0F172A] hover:text-gray-600 transition-colors duration-200 text-sm lg:text-base font-medium"
                >
                  Categories
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openCategories ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {openCategories && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 mt-3 w-60 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 overflow-hidden"
                    >
                      {categories.map((cat) => (
                        <Link
                          key={cat.path}
                          href={cat.path}
                          className="block px-4 py-2 text-sm text-[#0F172A] hover:bg-gray-50 transition-colors"
                          onClick={() => setOpenCategories(false)}
                        >
                          {cat.name}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 my-1" />
                      <Link
                        href="/shop?sort=newest"
                        className="block px-4 py-2 text-sm text-[#0F172A] hover:bg-gray-50 transition-colors"
                        onClick={() => setOpenCategories(false)}
                      >
                        New Arrivals
                      </Link>
                      <Link
                        href="/deals"
                        className="block px-4 py-2 text-sm text-[#0F172A] hover:bg-gray-50 transition-colors"
                        onClick={() => setOpenCategories(false)}
                      >
                        Deals
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>
          </div>

          {/* RIGHT — Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop Search */}
            <form
              onSubmit={handleSearch}
              className="hidden sm:flex items-center border border-gray-200 hover:border-gray-300 focus-within:border-[#0F172A] rounded-full px-3 py-1.5 bg-white transition-colors"
            >
              <SearchIcon className="w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search items..."
                className="ml-2 text-sm outline-none bg-transparent text-[#0F172A] placeholder:text-gray-400 w-28 lg:w-40"
              />
            </form>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Wishlist"
            >
              <HeartIcon className="w-5 h-5 sm:w-5.5 sm:h-[22px] text-[#0F172A]" />
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-red-600 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Cart */}
            <Link
              href="/shopping-cart"
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-[#0F172A]" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-[#0F172A] text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User dropdown */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setOpenUser((v) => !v)}
                className="flex items-center gap-1.5 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Account menu"
                aria-expanded={openUser}
              >
                {isLoggedIn && user?.fullName ? (
                  <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-semibold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <UserIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#0F172A]" />
                )}
                {isLoggedIn && firstName && (
                  <span className="hidden sm:block text-sm font-medium text-[#0F172A] max-w-[100px] truncate">
                    {firstName}
                  </span>
                )}
                <ChevronDown
                  className={`hidden sm:block w-4 h-4 transition-transform duration-200 ${
                    openUser ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {openUser && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 overflow-hidden"
                  >
                    {isLoggedIn ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {user?.fullName}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                            <Mail className="w-3 h-3" />
                            {user?.email}
                          </p>
                        </div>

                        {[
                          { icon: User, label: "My Account", href: "/account" },
                          {
                            icon: LayoutGrid,
                            label: "My Orders",
                            href: "/orders",
                          },
                          {
                            icon: HeartIcon,
                            label: "Wishlist",
                            href: "/wishlist",
                          },
                          {
                            icon: Settings,
                            label: "Settings",
                            href: "/settings",
                          },
                        ].map(({ icon: Icon, label, href }) => (
                          <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-gray-50 transition-colors"
                            onClick={() => setOpenUser(false)}
                          >
                            <Icon className="w-4 h-4" />
                            {label}
                          </Link>
                        ))}

                        <div className="border-t border-gray-100 my-1" />

                        <Link
                          href="/help"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-gray-50 transition-colors"
                          onClick={() => setOpenUser(false)}
                        >
                          <HelpCircle className="w-4 h-4" />
                          Help & Support
                        </Link>
                        <button
                          className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => {
                            setOpenUser(false);
                            // TODO: logout
                          }}
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2">
                          <p className="text-sm font-semibold text-[#0F172A]">
                            Account
                          </p>
                        </div>
                        <div className="border-t border-gray-100" />
                        <Link
                          href="/login"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-gray-50 transition-colors"
                          onClick={() => setOpenUser(false)}
                        >
                          <LogIn className="w-4 h-4" />
                          Sign In
                        </Link>
                        <Link
                          href="/signup"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-gray-50 transition-colors"
                          onClick={() => setOpenUser(false)}
                        >
                          <UserPlus className="w-4 h-4" />
                          Create Account
                        </Link>
                        <div className="border-t border-gray-100 my-1" />
                        <Link
                          href="/help"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-gray-50 transition-colors"
                          onClick={() => setOpenUser(false)}
                        >
                          <HelpCircle className="w-4 h-4" />
                          Help & Support
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setOpenMenu((v) => !v)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={openMenu}
            >
              {openMenu ? (
                <XIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {openMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 border-t border-gray-100">
                {/* Mobile user greeting */}
                {isLoggedIn && user?.fullName && (
                  <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}

                <form
                  onSubmit={handleSearch}
                  className="flex items-center border border-gray-200 rounded-full px-3 py-2 mb-4 bg-white focus-within:border-[#0F172A] transition-colors"
                >
                  <SearchIcon className="w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text"
                    placeholder="Search items..."
                    className="ml-2 text-sm outline-none bg-transparent text-[#0F172A] placeholder:text-gray-400 w-full"
                  />
                </form>

                <div className="flex flex-col space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      className="text-[#0F172A] hover:text-gray-600 hover:bg-gray-50 rounded-lg px-3 py-2.5 transition-colors"
                      onClick={() => setOpenMenu(false)}
                    >
                      {link.name}
                    </Link>
                  ))}

                  <div className="pt-3 mt-2 border-t border-gray-100">
                    <p className="text-[#0F172A] font-semibold mb-2 px-3 text-sm uppercase tracking-wide">
                      Categories
                    </p>
                    {categories.map((cat) => (
                      <Link
                        key={cat.path}
                        href={cat.path}
                        className="block text-[#0F172A] hover:text-gray-600 hover:bg-gray-50 rounded-lg px-3 py-2 text-sm transition-colors"
                        onClick={() => setOpenMenu(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <Link
                      href="/shop?sort=newest"
                      className="block text-[#0F172A] hover:text-gray-600 hover:bg-gray-50 rounded-lg px-3 py-2 text-sm transition-colors"
                      onClick={() => setOpenMenu(false)}
                    >
                      New Arrivals
                    </Link>
                    <Link
                      href="/deals"
                      className="block text-[#0F172A] hover:text-gray-600 hover:bg-gray-50 rounded-lg px-3 py-2 text-sm transition-colors"
                      onClick={() => setOpenMenu(false)}
                    >
                      Deals
                    </Link>
                  </div>

                  {/* Mobile auth buttons */}
                  <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col space-y-2 px-1">
                    {isLoggedIn ? (
                      <>
                        <Link
                          href="/account"
                          className="text-center text-[#0F172A] border border-gray-200 hover:bg-gray-50 rounded-full py-2.5 text-sm font-medium transition-colors"
                          onClick={() => setOpenMenu(false)}
                        >
                          My Account
                        </Link>
                        <Link
                          href="/orders"
                          className="text-center text-[#0F172A] border border-gray-200 hover:bg-gray-50 rounded-full py-2.5 text-sm font-medium transition-colors"
                          onClick={() => setOpenMenu(false)}
                        >
                          My Orders
                        </Link>
                        <button
                          className="bg-red-600 text-white text-center px-4 py-2.5 rounded-full text-sm font-medium hover:bg-red-700 transition-colors"
                          onClick={() => {
                            setOpenMenu(false);
                            // TODO: logout
                          }}
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="text-center text-[#0F172A] border border-gray-200 hover:bg-gray-50 rounded-full py-2.5 text-sm font-medium transition-colors"
                          onClick={() => setOpenMenu(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/signup"
                          className="bg-[#0F172A] text-white text-center px-4 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                          onClick={() => setOpenMenu(false)}
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
