"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import AdminSidebar, { AccountFooter, Brand, NavList } from "@/components/admin/AdminSidebar";
import BackgroundMesh from "@/components/admin/layout/BackgroundMesh";
import Topbar from "@/components/admin/layout/Topbar";
import { Drawer } from "@/components/admin/ui/Dialog";
import { useToast } from "@/components/admin/ui/Toast";
import { pageVariants } from "@/lib/adminMotion";

/*
  Collapsed-sidebar preference, remembered per browser. Read through
  useSyncExternalStore so the server render (expanded) and the first
  client render agree; storage failures just fall back to expanded.
*/
const COLLAPSE_KEY = "eleoka-admin-sidebar-collapsed";
const listeners = new Set();

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeCollapsed(value) {
  try {
    localStorage.setItem(COLLAPSE_KEY, value ? "1" : "0");
  } catch {
    // Private mode or blocked storage: the toggle still works for this page view
  }
  listeners.forEach((listener) => listener());
}

function subscribeCollapsed(listener) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/*
  Frame for every admin page:
    BackgroundMesh - fixed, quiet colour behind the glass
    AdminSidebar   - desktop (lg+), collapsible
    Topbar         - sticky, with the sidebar/drawer toggle and account menu
    Drawer         - the same navigation below lg
*/
export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  const storedCollapsed = useSyncExternalStore(subscribeCollapsed, readCollapsed, () => false);
  // Fallback for this view when storage is unavailable
  const [localCollapsed, setLocalCollapsed] = useState(null);
  const collapsed = localCollapsed ?? storedCollapsed;

  const [mobileOpen, setMobileOpen] = useState(false);

  // The entrance plays on in-app navigation only. On the first,
  // server-rendered load it would hide the page until JavaScript runs.
  const [navigated, setNavigated] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setNavigated(true);
  }
  const [signingOut, setSigningOut] = useState(false);

  const toggleCollapsed = () => {
    setLocalCollapsed(!collapsed);
    writeCollapsed(!collapsed);
  };

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

  return (
    <div className="admin relative isolate min-h-dvh">
      <BackgroundMesh />

      <AdminSidebar collapsed={collapsed} onSignOut={handleSignOut} signingOut={signingOut} />

      {/* Offset by the floating sidebar: 12px gap + its width (SIDEBAR_WIDTH) + 12px */}
      <div
        className={`min-w-0 transition-[padding] duration-300 ease-out-soft ${
          collapsed ? "lg:pl-[90px]" : "lg:pl-[272px]"
        }`}
      >
        {/* Topbar and page share one width and gutter, so their edges line up.
            Phones keep px-4: pages bleed scroll strips with -mx-4. */}
        <div className="mx-auto w-full max-w-336 px-4 sm:px-5 lg:px-3">
          <div className="sticky top-0 z-30 pt-3">
            <Topbar
            collapsed={collapsed}
            onToggleCollapsed={toggleCollapsed}
            onOpenMobile={() => setMobileOpen(true)}
            mobileOpen={mobileOpen}
            onSignOut={handleSignOut}
              signingOut={signingOut}
            />
          </div>

          <main id="admin-main" className="min-w-0">
            <motion.div
              key={pathname}
              className="pt-5 pb-8"
              variants={pageVariants}
              initial={navigated ? "hidden" : false}
              animate="show"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        labelledBy="admin-mobile-nav-title"
      >
        <div className="flex h-full flex-col bg-linear-to-b from-paper to-cream">
          <div className="flex h-14 shrink-0 items-center border-b border-ink/8 px-4">
            <h2 id="admin-mobile-nav-title" className="sr-only">
              Navigation
            </h2>
            <Brand />
          </div>
          <NavList pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          <AccountFooter onSignOut={handleSignOut} signingOut={signingOut} />
        </div>
      </Drawer>
    </div>
  );
}
