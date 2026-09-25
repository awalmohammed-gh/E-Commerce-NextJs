"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
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
import Bump from "@/components/motion/Bump";

// Shown after "Shop" and "Categories"
const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Pages that open with the dark hero the bar floats over
const HERO_PAGES = ["/"];

// Scroll position read without effects (false on the server)
function subscribeScroll(callback) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}
const useScrolledPast = (offset) =>
  useSyncExternalStore(subscribeScroll, () => window.scrollY > offset, () => false);

// Icon button with an optional count badge (44px touch target)
function IconButton({ label, count, light, className = "", children, ...props }) {
  const Tag = props.href ? Link : "button";
  return (
    <Tag
      {...(props.href ? {} : { type: "button" })}
      {...props}
      aria-label={count > 0 ? `${label}, ${count}` : label}
      className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 ${
        light ? "text-paper hover:bg-white/12" : "text-ink hover:bg-ink/6"
      } ${className}`}
    >
      {children}
      {count > 0 && (
        // Pulses briefly when the count changes (e.g. something added to the bag)
        <span className="absolute top-1 right-0.5" aria-hidden="true">
          <Bump
            value={count}
            scale={1.2}
            className="h-4.5 min-w-4.5 items-center justify-center rounded-full bg-terracotta-deep px-1 text-[10px] leading-none font-semibold text-white"
          >
            {count > 99 ? "99+" : count}
          </Bump>
        </span>
      )}
    </Tag>
  );
}

// Desktop nav link with a sliding underline
function NavLink({ href, active, light, children }) {
  const tone = light
    ? active
      ? "text-paper"
      : "text-paper/75 hover:text-paper"
    : active
      ? "text-ink"
      : "text-ink-soft hover:text-ink";

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative py-2 text-[12px] font-semibold tracking-[0.14em] uppercase transition-colors duration-300 after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:bg-current after:transition-transform after:duration-300 after:ease-out-soft ${
        active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
      } ${tone}`}
    >
      {children}
    </Link>
  );
}

/*
  Store header. Over the homepage hero it starts transparent with light
  text; once the page scrolls (or a panel opens) it turns into a frosted
  ivory bar with dark text. Every other page gets the frosted bar.
*/
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
  const scrolled = useScrolledPast(24);

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

  // Transparent with light text only while it sits over the hero
  const light = HERO_PAGES.includes(pathname) && !scrolled && !panel;

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-100 border-b transition-[background-color,border-color,box-shadow] duration-500 ease-out-soft ${
          light
            ? "on-dark border-transparent bg-transparent"
            : "border-line/70 bg-paper/82 shadow-bar backdrop-blur-xl backdrop-saturate-150"
        }`}
      >
        <div className="page-x grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:h-18">
          {/* Left: menu (small screens) / main navigation (desktop) */}
          <div className="flex items-center">
            <IconButton label="Open menu" light={light} onClick={() => setMobileOpen(true)} className="-ml-2.5 lg:hidden">
              <Menu className="h-5.5 w-5.5" strokeWidth={1.6} />
            </IconButton>

            <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
              <NavLink href="/shop" active={pathname === "/shop"} light={light}>
                Shop
              </NavLink>

              <button
                ref={(el) => {
                  triggerRefs.current.categories = el;
                }}
                type="button"
                onClick={() => togglePanel("categories")}
                aria-expanded={panel === "categories"}
                aria-controls="nav-categories"
                className={`flex items-center gap-1 py-2 text-[12px] font-semibold tracking-[0.14em] uppercase transition-colors duration-300 ${
                  light ? "text-paper/75 hover:text-paper" : panel === "categories" ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                Categories
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-300 ${panel === "categories" ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {NAV_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} active={isActive(link.href)} light={light}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Centre: wordmark */}
          <Logo tone={light ? "light" : "dark"} />

          {/* Right: search, wishlist, account, bag */}
          <div className="-mr-2.5 flex items-center justify-end">
            <IconButton
              ref={(el) => {
                triggerRefs.current.search = el;
              }}
              label="Search"
              light={light}
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
              light={light}
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
                className={`flex h-11 items-center gap-2 rounded-full px-2.5 transition-colors duration-300 ${
                  light ? "text-paper hover:bg-white/12" : "text-ink hover:bg-ink/6"
                }`}
              >
                {isLoggedIn && user ? <Avatar user={user} size="sm" /> : <User className="h-5 w-5" strokeWidth={1.6} />}
                {isLoggedIn && firstName && (
                  <span className="hidden max-w-24 truncate text-[13px] font-medium xl:block">{firstName}</span>
                )}
              </button>

              <AnimatePresence>
                {panel === "account" && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-full right-0 z-50 mt-2 origin-top-right"
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

            <IconButton href="/shopping-cart" label="Bag" count={cartCount} light={light}>
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
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full border-b border-line bg-paper/96 shadow-[0_24px_48px_-24px_rgba(42,28,21,0.3)] backdrop-blur-xl"
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
      </header>

      {/* Outside the header: its backdrop-filter would trap fixed children */}
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
    </>
  );
}
