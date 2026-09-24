"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  Menu,
  PackagePlus,
  Package,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Drawer } from "@/components/admin/ui/Dialog";
import { useToast } from "@/components/admin/ui/Toast";

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

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2 rounded-sm">
      <span className="text-[17px] font-semibold tracking-[0.14em]">
        <span className="text-ink">ELE</span>
        <span className="text-rose">OKA</span>
      </span>
      <span className="rounded border border-line px-1.5 py-px text-[10px] font-medium tracking-[0.08em] text-muted uppercase">
        Admin
      </span>
    </Link>
  );
}

function NavList({ pathname, onNavigate }) {
  return (
    <nav aria-label="Admin" className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="mb-5 last:mb-0">
          <p className="px-2.5 pb-1.5 text-[11px] font-medium tracking-[0.08em] text-muted uppercase">
            {section.label}
          </p>
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
                    className={`relative flex h-10 items-center gap-3 rounded-md px-2.5 text-sm transition-colors sm:h-9 ${
                      active
                        ? "bg-ink/6 font-medium text-ink"
                        : "text-ink-soft hover:bg-ink/4 hover:text-ink"
                    }`}
                  >
                    {/* Active marker: a short rose bar on the left edge */}
                    {active && (
                      <span className="absolute top-2 bottom-2 -left-3 w-0.75 rounded-r bg-rose" aria-hidden="true" />
                    )}
                    <Icon
                      className={`h-4 w-4 shrink-0 ${active ? "text-ink" : "text-muted"}`}
                      aria-hidden="true"
                    />
                    {name}
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

function AccountFooter({ onSignOut, signingOut }) {
  return (
    <div className="border-t border-line p-3">
      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-1 flex h-10 items-center gap-3 rounded-md px-2.5 text-sm text-ink-soft transition-colors hover:bg-ink/4 hover:text-ink sm:h-9"
      >
        <ArrowUpRight className="h-4 w-4 text-muted" aria-hidden="true" />
        View storefront
        <span className="sr-only">(opens in a new tab)</span>
      </Link>

      <div className="mt-2 border-t border-line pt-3">
        <div className="flex items-center gap-3 px-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white"
            aria-hidden="true"
          >
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">Administrator</p>
            <p className="truncate text-xs text-muted">Signed in</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="mt-2 flex h-10 w-full items-center gap-3 rounded-md px-2.5 text-sm text-ink-soft transition-colors hover:bg-danger-tint hover:text-danger disabled:opacity-50 sm:h-9"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );
}

/*
  Desktop: fixed-width sidebar pinned to the viewport; the layout
  offsets the main content by its width (lg:pl-60).
  Below lg: a top bar with a menu button that opens the same
  navigation in a drawer.
*/
export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const current = currentNavLink(pathname);

  // Clears the httpOnly adminToken cookie on the server, then leaves
  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await axios.post("/api/auth/admin/logout");
      setMobileOpen(false);
      router.replace("/admin/admin-login");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Couldn't sign you out. Please try again.");
      setSigningOut(false);
    }
  };

  const panel = (onNavigate) => (
    <>
      <NavList pathname={pathname} onNavigate={onNavigate} />
      <AccountFooter onSignOut={handleSignOut} signingOut={signingOut} />
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-14 items-center border-b border-line px-5">
          <Brand />
        </div>
        {panel()}
      </aside>

      {/* Top bar below lg */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white/95 px-2 backdrop-blur-sm sm:px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-ink/5"
          aria-label="Open navigation"
          aria-expanded={mobileOpen}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <Brand />
        {current && (
          <p className="ml-auto truncate pr-2 text-[13px] text-muted">
            {current.name}
          </p>
        )}
      </header>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        side="left"
        width="max-w-[85vw] sm:max-w-[280px]"
        hideHeader
        labelledBy="admin-mobile-nav-title"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b border-line px-5">
            <h2 id="admin-mobile-nav-title" className="sr-only">
              Navigation
            </h2>
            <Brand />
          </div>
          {panel(() => setMobileOpen(false))}
        </div>
      </Drawer>
    </>
  );
}
