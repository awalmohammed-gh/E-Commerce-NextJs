"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PackagePlus,
  ShoppingBag,
  ListOrdered,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Store,
  Bell,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const navLinks = [
    { name: "Overview", path: "/admin", icon: LayoutDashboard },
    {
      name: "Create Product",
      path: "/admin/add-product",
      icon: PackagePlus,
    },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { name: "Product List", path: "/admin/list", icon: ListOrdered },
    { name: "Customers", path: "/admin/users", icon: Users },
  ];

  const secondaryLinks = [
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  // Active check - match exact for /admin, prefix for the rest
  const isActive = (path) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname === path || pathname?.startsWith(path + "/");
  };

  const handleLogout = () => {
    // TODO: real logout (clear session / cookie)
    router.push("/signin");
  };

  // Sidebar body - shared between desktop and mobile
  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div
        className={`flex items-center h-16 px-5 border-b border-[#1C1A17]/10 ${
          collapsed ? "justify-center px-0" : "justify-between"
        }`}
      >
        <Link
          href="/admin"
          className="text-xl font-bold tracking-tight whitespace-nowrap"
        >
          {collapsed ? (
            <span className="text-[#D98880]">E</span>
          ) : (
            <>
              <span className="text-[#1C1A17]">ELE</span>
              <span className="text-[#D98880]">OKA</span>
            </>
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-[#8A6A52] hover:text-[#1C1A17] hover:bg-[#1C1A17]/5 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="hidden lg:flex mx-auto mt-3 w-9 h-9 items-center justify-center rounded-lg text-[#8A6A52] hover:text-[#1C1A17] hover:bg-[#1C1A17]/5 transition-colors"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {!collapsed && (
          <p className="px-3 pb-2 font-utility text-[10px] font-semibold tracking-widest uppercase text-[#8A6A52]">
            Manage
          </p>
        )}

        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);

          return (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMobileOpen(false)}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-utility text-sm transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-[#1C1A17] text-[#F5F1EA]"
                  : "text-[#4A463F] hover:bg-[#1C1A17]/5 hover:text-[#1C1A17]"
              }`}
              title={collapsed ? link.name : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{link.name}</span>}

              {active && !collapsed && (
                <motion.span
                  layoutId="admin-active-dot"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D98880]"
                />
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-3 border-t border-[#1C1A17]/10" />

        {!collapsed && (
          <p className="px-3 pb-2 font-utility text-[10px] font-semibold tracking-widest uppercase text-[#8A6A52]">
            Account
          </p>
        )}

        {secondaryLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);

          return (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-utility text-sm transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-[#1C1A17] text-[#F5F1EA]"
                  : "text-[#4A463F] hover:bg-[#1C1A17]/5 hover:text-[#1C1A17]"
              }`}
              title={collapsed ? link.name : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{link.name}</span>}
            </Link>
          );
        })}

        {/* Back to store */}
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-utility text-sm text-[#4A463F] hover:bg-[#1C1A17]/5 hover:text-[#1C1A17] transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Back to store" : undefined}
        >
          <Store className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="truncate">Back to store</span>}
        </Link>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[#1C1A17]/10">
        <button
          type="button"
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-utility text-sm text-red-600 hover:bg-red-50 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-white border-b border-[#1C1A17]/10">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#1C1A17]/5 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/admin" className="text-lg font-bold tracking-tight">
          <span className="text-[#1C1A17]">ELE</span>
          <span className="text-[#D98880]">OKA</span>
          <span className="ml-2 font-utility text-[10px] tracking-widest uppercase text-[#8A6A52]">
            Admin
          </span>
        </Link>

        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#1C1A17]/5 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop sidebar - sticky (was fixed) so it participates in the flex layout */}
      <aside
        className={`hidden lg:flex shrink-0 h-screen sticky top-0 bg-white border-r border-[#1C1A17]/10 transition-all duration-300 z-30 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            <motion.aside
              className="lg:hidden fixed top-0 left-0 bottom-0 w-64 max-w-[80%] bg-white z-50 shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
            >
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1C1A17]/5 transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
