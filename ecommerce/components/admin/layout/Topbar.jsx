"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import { currentNavLink } from "@/components/admin/AdminSidebar";
import { dropdownVariants } from "@/lib/adminMotion";

const iconButton =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-white/80 hover:text-ink";

/*
  Admin profile menu. The admin account has no name or photo in the
  data, so it shows the same "Administrator" identity the sidebar
  always has; the items are existing destinations and sign-out.
*/
function ProfileMenu({ onSignOut, signingOut }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);

  // Navigating closes the menu
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector('[role="menuitem"]')?.focus();

    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Arrow keys move between items
  const onMenuKeyDown = (e) => {
    const items = [...(menuRef.current?.querySelectorAll('[role="menuitem"]') || [])];
    const index = items.indexOf(document.activeElement);
    let next = null;
    if (e.key === "ArrowDown") next = items[(index + 1) % items.length];
    else if (e.key === "ArrowUp") next = items[(index - 1 + items.length) % items.length];
    else if (e.key === "Home") next = items[0];
    else if (e.key === "End") next = items[items.length - 1];
    if (next) {
      e.preventDefault();
      next.focus();
    }
  };

  const item =
    "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-ink-soft outline-none transition-colors hover:bg-ink/5 hover:text-ink focus-visible:bg-ink/5 focus-visible:text-ink";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-10 items-center gap-2 rounded-xl pr-2 pl-1 transition-colors hover:bg-white/80"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper"
          aria-hidden="true"
        >
          A
        </span>
        <span className="hidden text-[13px] font-semibold text-ink md:block">Administrator</span>
        <ChevronDown
          className={`h-4 w-4 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            role="menu"
            aria-label="Account"
            onKeyDown={onMenuKeyDown}
            variants={dropdownVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="admin-glass-dense absolute top-full right-0 z-40 mt-2 w-60 origin-top-right p-1.5"
          >
            <div className="px-3 pt-2 pb-2.5">
              <p className="text-sm font-semibold text-ink">Administrator</p>
              <p className="text-xs text-muted">Signed in to Eleoka Admin</p>
            </div>
            <div className="my-1 h-px bg-ink/8" role="separator" />
            <Link href="/admin/settings" role="menuitem" className={item}>
              <Settings className="h-4 w-4 text-taupe" aria-hidden="true" />
              Settings
            </Link>
            <Link href="/" target="_blank" rel="noopener noreferrer" role="menuitem" className={item}>
              <ArrowUpRight className="h-4 w-4 text-taupe" aria-hidden="true" />
              View storefront
              <span className="sr-only">(opens in a new tab)</span>
            </Link>
            <div className="my-1 h-px bg-ink/8" role="separator" />
            <button
              type="button"
              role="menuitem"
              onClick={onSignOut}
              disabled={signingOut}
              className={`${item} hover:bg-danger-tint hover:text-danger disabled:opacity-50`}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/*
  Sticky glass bar above every admin page: sidebar toggle (collapse on
  desktop, drawer below lg), section breadcrumb and page title, and the
  account menu. The page's own <h1> stays in its PageHeader, so the title
  here is plain text.
*/
export default function Topbar({ collapsed, onToggleCollapsed, onOpenMobile, mobileOpen, onSignOut, signingOut }) {
  const pathname = usePathname();
  const current = currentNavLink(pathname);
  const editing = pathname?.startsWith("/admin/edit-product");

  return (
    <header className="admin-glass flex h-14 items-center gap-2 px-2 sm:gap-3 sm:px-3">
      <button
        type="button"
        onClick={onOpenMobile}
        className={`${iconButton} lg:hidden`}
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onToggleCollapsed}
        className={`${iconButton} hidden lg:flex`}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
        ) : (
          <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      <span className="h-6 w-px shrink-0 bg-ink/10" aria-hidden="true" />

      <div className="min-w-0 flex-1">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
            <li>
              <Link href="/admin" className="rounded transition-colors hover:text-ink">
                Admin
              </Link>
            </li>
            {current && (
              <li className="flex min-w-0 items-center gap-1">
                <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{current.section}</span>
              </li>
            )}
          </ol>
        </nav>
        <p className="truncate text-[15px] font-semibold text-ink sm:text-base">
          {editing ? "Edit product" : current?.name || "Admin"}
        </p>
      </div>

      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className={`${iconButton} hidden sm:flex`}
        aria-label="View storefront (opens in a new tab)"
        title="View storefront"
      >
        <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
      </Link>

      <ProfileMenu onSignOut={onSignOut} signingOut={signingOut} />
    </header>
  );
}
