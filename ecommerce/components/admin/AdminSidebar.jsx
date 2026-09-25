"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  Package,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { DURATION, EASE_OUT, SIDEBAR_WIDTH } from "@/lib/adminMotion";

/*
  Navigation for every admin page. Grouped by job; the same list drives
  the desktop sidebar, the mobile drawer and the top bar's page title.
*/
export const NAV_SECTIONS = [
  {
    label: "Store",
    links: [
      { name: "Overview", path: "/admin", icon: LayoutDashboard },
      { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
      { name: "Customers", path: "/admin/users", icon: Users },
    ],
  },
  {
    label: "Catalog",
    links: [
      // Editing a product still counts as being in Products
      { name: "Products", path: "/admin/list", icon: Package, also: ["/admin/edit-product"] },
      { name: "Add product", path: "/admin/add-product", icon: PackagePlus },
    ],
  },
  {
    label: "Account",
    links: [{ name: "Settings", path: "/admin/settings", icon: Settings }],
  },
];

const ALL_LINKS = NAV_SECTIONS.flatMap((section) =>
  section.links.map((link) => ({ ...link, section: section.label })),
);

// Exact match for /admin, prefix match for everything else
const matchesPath = (pathname, path) =>
  path === "/admin" ? pathname === "/admin" : pathname === path || pathname?.startsWith(`${path}/`);

const isActiveLink = (pathname, link) =>
  [link.path, ...(link.also || [])].some((path) => matchesPath(pathname, path));

export const currentNavLink = (pathname) =>
  ALL_LINKS.find((link) => isActiveLink(pathname, link));

// Labels fade as the sidebar narrows; they stay in the DOM for screen readers
const fade = { duration: DURATION.fast, ease: EASE_OUT };

function Label({ collapsed, className = "", children }) {
  return (
    <motion.span
      initial={false}
      animate={{ opacity: collapsed ? 0 : 1 }}
      transition={fade}
      className={`min-w-0 truncate ${className}`}
    >
      {children}
    </motion.span>
  );
}

// "Eleoka Admin" wordmark next to the monogram (the wordmark fades when collapsed)
export function Brand({ collapsed = false }) {
  return (
    <Link href="/admin" className="flex items-center gap-2.5 rounded-lg" aria-label="Eleoka Admin, overview">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-[15px] font-bold text-paper"
        aria-hidden="true"
      >
        E
      </span>
      <motion.span
        initial={false}
        animate={{ opacity: collapsed ? 0 : 1 }}
        transition={fade}
        className="flex items-baseline gap-1.5 whitespace-nowrap"
        aria-hidden="true"
      >
        <span className="text-[15px] font-bold tracking-[0.16em]">
          <span className="text-ink">ELE</span>
          <span className="text-terracotta">OKA</span>
        </span>
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Admin</span>
      </motion.span>
    </Link>
  );
}

/*
  One row: icon + label. Geometry is the same collapsed or not
  (12px nav padding + 12px row padding + 18px icon), so at the
  collapsed width of 66px the icon is already centred and nothing
  jumps - only the label fades and the panel narrows.
*/
const ROW =
  "relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm whitespace-nowrap transition-[background-color,color,box-shadow] duration-200";

export function NavList({ pathname, onNavigate, collapsed = false }) {
  return (
    <nav aria-label="Admin" className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-2.5">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="mb-3 last:mb-0">
          {/* Section name, swapped for a short rule while collapsed */}
          <div className="relative h-6">
            <Label
              collapsed={collapsed}
              className="block px-3 text-[10.5px] font-semibold tracking-[0.16em] text-muted uppercase"
            >
              {section.label}
            </Label>
            <motion.span
              initial={false}
              animate={{ opacity: collapsed ? 1 : 0 }}
              transition={fade}
              className="absolute top-2 left-3 h-px w-[18px] bg-ink/15"
              aria-hidden="true"
            />
          </div>
          <ul className="space-y-0.5">
            {section.links.map((link) => {
              const { name, path, icon: Icon } = link;
              const active = isActiveLink(pathname, link);

              return (
                <li key={path}>
                  <Link
                    href={path}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? name : undefined}
                    className={`${ROW} ${
                      active
                        ? "bg-terracotta-deep font-semibold text-white shadow-accent-glow"
                        : "text-ink-soft hover:bg-white/70 hover:text-ink"
                    }`}
                  >
                    <Icon
                      className={`h-[18px] w-[18px] shrink-0 ${active ? "text-white" : "text-taupe"}`}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    <Label collapsed={collapsed}>{name}</Label>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AccountFooter({ onSignOut, signingOut, collapsed = false }) {
  return (
    <div className="space-y-0.5 border-t border-ink/8 p-3">
      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        title={collapsed ? "View storefront" : undefined}
        className={`${ROW} text-ink-soft hover:bg-white/70 hover:text-ink`}
      >
        <ArrowUpRight className="h-[18px] w-[18px] shrink-0 text-taupe" strokeWidth={1.8} aria-hidden="true" />
        <Label collapsed={collapsed}>View storefront</Label>
        <span className="sr-only">(opens in a new tab)</span>
      </Link>

      <button
        type="button"
        onClick={onSignOut}
        disabled={signingOut}
        title={collapsed ? "Sign out" : undefined}
        className={`${ROW} w-full text-ink-soft hover:bg-danger-tint hover:text-danger disabled:opacity-50`}
      >
        <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
        <Label collapsed={collapsed}>{signingOut ? "Signing out..." : "Sign out"}</Label>
      </button>
    </div>
  );
}

/*
  Desktop sidebar (lg and up): a floating glass panel pinned to the
  viewport. Its width animates between SIDEBAR_WIDTH.expanded and
  .collapsed; AdminShell offsets the content by the same values.
  Below lg the same NavList opens in a drawer.
*/
export default function AdminSidebar({ collapsed, onSignOut, signingOut }) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded }}
      transition={{ duration: DURATION.slow, ease: EASE_OUT }}
      style={{ width: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded }}
      className="admin-glass fixed top-3 bottom-3 left-3 z-20 hidden flex-col overflow-hidden lg:flex"
      aria-label="Sidebar"
    >
      <div className="flex h-14 shrink-0 items-center border-b border-ink/8 px-[15px]">
        <Brand collapsed={collapsed} />
      </div>
      <NavList pathname={pathname} collapsed={collapsed} />
      <AccountFooter onSignOut={onSignOut} signingOut={signingOut} collapsed={collapsed} />
    </motion.aside>
  );
}
