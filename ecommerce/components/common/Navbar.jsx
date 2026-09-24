"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useSignOut } from "@/lib/useSignOut";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import AccountMenu, { Avatar } from "@/components/common/AccountMenu";
import Logo from "@/components/common/Logo";
import CategoryPanel from "@/components/nav/CategoryPanel";
import SearchPanel from "@/components/nav/SearchPanel";
import MobileMenu from "@/components/nav/MobileMenu";
import Toast from "@/ui/Toast";

// Shown after "Shop" and "Categories"
const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Icon button with an optional count badge (44px touch target)
function IconButton({ label, count, className = "", children, ...props }) {
  const Tag = props.href ? Link : "button";
  return (
    <Tag
      {...(props.href ? {} : { type: "button" })}
      {...props}
      aria-label={count > 0 ? `${label}, ${count}` : label}
      className={`relative flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream ${className}`}
    >
      {children}
      {count > 0 && (
        <span
          className="absolute top-1.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] leading-none font-medium text-cream"
          aria-hidden="true"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Tag>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const signOut = useSignOut();
  const { cart, user, isLoggedIn, wishlistCount } = useEcommerce();

  // Which panel hangs under the bar: null | "categories" | "search" | "account"
  const [panel, setPanel] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const [toast, setToast] = useState({ message: "", success: false, error: false });

  const headerRef = useRef(null);
  const triggerRefs = useRef({});

  // Navigating anywhere closes open panels
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setPanel(null);
    setMobileOpen(false);
  }

  const closePanel = useCallback(() => setPanel(null), []);
  const clearToast = useCallback(
    () => setToast({ message: "", success: false, error: false }),
    [],
  );
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const togglePanel = (name) => setPanel((current) => (current === name ? null : name));

  // Click outside or Escape closes the open panel (focus returns to its button)
  useEffect(() => {
    if (!panel) return;

    const onPointer = (e) => {
      if (!headerRef.current?.contains(e.target)) setPanel(null);
    };
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      triggerRefs.current[panel]?.focus();
      setPanel(null);
    };

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [panel]);

  const handleSignOut = async () => {
    setPanel(null);
    setMobileOpen(false);
    const result = await signOut();
    setToast({ message: result.message, success: result.success, error: !result.success });
  };

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);
  const cartCount = cart.itemCount;
  const firstName = user?.fullName?.trim().split(" ")[0] || "";

  return (
    <header ref={headerRef} className="sticky top-0 z-100 border-b border-line bg-paper">
      <div className="page-x grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:h-18">
        {/* Left: menu (small screens) / main navigation (desktop) */}
        <div className="flex items-center">
          <IconButton label="Open menu" onClick={() => setMobileOpen(true)} className="-ml-2.5 lg:hidden">
            <Menu className="h-5.5 w-5.5" strokeWidth={1.6} />
          </IconButton>

          <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
            <Link
              href="/shop"
              aria-current={pathname === "/shop" ? "page" : undefined}
              className={`relative py-2 text-[13px] font-medium tracking-[0.08em] uppercase transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-ink after:transition-transform ${
                pathname === "/shop" ? "text-ink after:scale-x-100" : "text-ink-soft after:scale-x-0 hover:text-ink hover:after:scale-x-100"
              }`}
            >
              Shop
            </Link>

            <button
              ref={(el) => {
              triggerRefs.current.categories = el;
            }}
              type="button"
              onClick={() => togglePanel("categories")}
              aria-expanded={panel === "categories"}
              aria-controls="nav-categories"
              className={`flex items-center gap-1 py-2 text-[13px] font-medium tracking-[0.08em] uppercase transition-colors ${
                panel === "categories" ? "text-ink" : "text-ink-soft hover:text-ink"
              }`}
            >
              Categories
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${panel === "categories" ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`relative py-2 text-[13px] font-medium tracking-[0.08em] uppercase transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-ink after:transition-transform ${
                  isActive(link.href)
                    ? "text-ink after:scale-x-100"
                    : "text-ink-soft after:scale-x-0 hover:text-ink hover:after:scale-x-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Centre: wordmark */}
        <Logo />

        {/* Right: search, wishlist, account, bag */}
        <div className="-mr-2.5 flex items-center justify-end">
          <IconButton
            ref={(el) => {
              triggerRefs.current.search = el;
            }}
            label="Search"
            onClick={() => togglePanel("search")}
            aria-expanded={panel === "search"}
            aria-controls="nav-search"
          >
            <Search className="h-5 w-5" strokeWidth={1.6} />
          </IconButton>

          <IconButton
            href="/account/wishlist"
            label="Wishlist"
            count={wishlistCount}
            className="hidden sm:flex"
          >
            <Heart className="h-5 w-5" strokeWidth={1.6} />
          </IconButton>

          <div className="relative hidden sm:block">
            <button
              ref={(el) => {
              triggerRefs.current.account = el;
            }}
              type="button"
              onClick={() => togglePanel("account")}
              aria-haspopup="menu"
              aria-expanded={panel === "account"}
              aria-label={isLoggedIn ? `Account menu for ${user?.fullName || "you"}` : "Account menu"}
              className="flex h-11 items-center gap-2 rounded-full px-2.5 text-ink transition-colors hover:bg-cream"
            >
              {isLoggedIn && user ? <Avatar user={user} size="sm" /> : <User className="h-5 w-5" strokeWidth={1.6} />}
              {isLoggedIn && firstName && (
                <span className="hidden max-w-24 truncate text-sm xl:block">{firstName}</span>
              )}
            </button>

            <AnimatePresence>
              {panel === "account" && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 z-50 mt-2"
                >
                  <AccountMenu
                    user={user}
                    isLoggedIn={isLoggedIn}
                    onNavigate={closePanel}
                    onSignOut={handleSignOut}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <IconButton href="/shopping-cart" label="Bag" count={cartCount}>
            <ShoppingBag className="h-5 w-5" strokeWidth={1.6} />
          </IconButton>
        </div>
      </div>

      {/* Full-width panels under the bar */}
      <AnimatePresence>
        {(panel === "categories" || panel === "search") && (
          <motion.div
            key={panel}
            id={panel === "categories" ? "nav-categories" : "nav-search"}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-full border-b border-line bg-paper shadow-[0_16px_32px_rgba(28,26,23,0.08)]"
          >
            {panel === "categories" ? (
              <div className="hidden lg:block">
                <CategoryPanel onNavigate={closePanel} />
              </div>
            ) : (
              <SearchPanel onClose={closePanel} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <MobileMenu
        open={mobileOpen}
        onClose={closeMobile}
        user={user}
        isLoggedIn={isLoggedIn}
        onSignOut={handleSignOut}
      />

      <div className="toast-region">
        <Toast
          success={toast.success}
          error={toast.error}
          message={toast.message}
          onClose={clearToast}
        />
      </div>
    </header>
  );
}
