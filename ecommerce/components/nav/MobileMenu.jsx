"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
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

const EASE = [0.22, 1, 0.36, 1];

/*
  Phone/tablet navigation. A full-height panel from the left (the whole
  screen on phones), locks page scroll, closes on Escape, backdrop tap or
  any link. Rows are at least 44px tall.
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
            className="fixed inset-0 z-200 bg-espresso-deep/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.nav
            ref={panelRef}
            aria-label="Menu"
            className="fixed inset-y-0 left-0 z-201 flex w-full flex-col bg-paper sm:w-[440px] sm:shadow-lift"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
              <Logo onClick={onClose} />
              <button
                type="button"
                onClick={onClose}
                className="-mr-1 flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" strokeWidth={1.6} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-6 pb-8 sm:px-6">
              <ul className="border-b border-line pb-6">
                {PRIMARY.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: EASE, delay: 0.12 + i * 0.06 }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="group flex min-h-15 items-baseline gap-4 font-display text-[40px] leading-none text-ink transition-colors hover:text-terracotta-deep"
                    >
                      <span className="font-sans text-[11px] font-semibold tracking-[0.2em] text-taupe">0{i + 1}</span>
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <p className="eyebrow mt-7 mb-1">Categories</p>
                <CategoryList onNavigate={onClose} size="lg" />

                <ul className="mt-7 grid grid-cols-2 gap-2">
                  {SECONDARY.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex min-h-12 items-center justify-between gap-2 rounded-field bg-cream px-4 text-[14px] text-ink-soft transition-colors hover:bg-sand hover:text-ink"
                      >
                        {item.label}
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-taupe" aria-hidden="true" />
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
                    <div className="rounded-card bg-espresso-glow p-5 text-paper on-dark">
                      <p className="font-display text-2xl leading-tight">Your Eleoka account</p>
                      <p className="mt-1 text-[14px] text-paper/70">Orders, saved pieces and addresses in one place.</p>
                      <div className="mt-4 grid grid-cols-2 gap-2.5">
                        <Link href="/login" onClick={onClose} className="btn-glass btn-sm">
                          Sign in
                        </Link>
                        <Link href="/signup" onClick={onClose} className="btn-light btn-sm">
                          Join
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
