"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import CategoryList from "@/components/nav/CategoryList";
import AccountMenu from "@/components/common/AccountMenu";
import Logo from "@/components/common/Logo";

const PRIMARY = [
  { label: "Shop all", href: "/shop" },
  { label: "New in", href: "/shop?sort=newest" },
  { label: "On sale", href: "/shop?onSale=true" },
];

const SECONDARY = [
  { label: "About Eleoka", href: "/about" },
  { label: "Contact & help", href: "/contact" },
];

/*
  Phone/tablet navigation drawer. Opens from the left, locks page scroll,
  closes on Escape, backdrop tap or any link. Rows are at least 44px tall.
*/
export default function MobileMenu({ open, onClose, user, isLoggedIn, onSignOut }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("button, a")?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-200 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.nav
            ref={panelRef}
            aria-label="Menu"
            className="fixed inset-y-0 left-0 z-201 flex w-[min(88vw,400px)] flex-col bg-paper"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
              <Logo onClick={onClose} />
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-3 pb-8">
              <ul>
                {PRIMARY.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex min-h-13 items-center font-display text-[26px] leading-none text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="eyebrow mt-7 mb-1">Categories</p>
              <CategoryList onNavigate={onClose} size="lg" />

              <ul className="mt-7 border-t border-line pt-3">
                {SECONDARY.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex min-h-11 items-center text-[15px] text-ink-soft hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                {isLoggedIn ? (
                  <AccountMenu
                    variant="inline"
                    user={user}
                    isLoggedIn={isLoggedIn}
                    onNavigate={onClose}
                    onSignOut={onSignOut}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/login" onClick={onClose} className="btn-secondary">
                      Sign in
                    </Link>
                    <Link href="/signup" onClick={onClose} className="btn-primary">
                      Join
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
