"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import { Avatar } from "@/components/common/AccountMenu";
import { ACCOUNT_LINKS, HELP_LINK, isActiveLink } from "@/lib/accountLinks";
import { useSignOut } from "@/lib/useSignOut";

// Phones/tablets: the account sections as a swipeable row of tabs
export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account sections" className="-mx-4 border-b border-line sm:-mx-6 lg:hidden">
      <ul className="flex gap-1.5 overflow-x-auto px-4 py-3 no-scrollbar sm:px-6">
        {[...ACCOUNT_LINKS, { ...HELP_LINK, short: "Help" }].map((link) => {
          const active = isActiveLink(pathname, link);
          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-10 items-center rounded-full px-4 text-[14px] whitespace-nowrap transition-colors duration-300 ${
                  active ? "bg-ink font-medium text-paper" : "text-muted hover:bg-cream hover:text-ink"
                }`}
              >
                {link.short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Desktop: the account sections down the left, with the signed-in customer
function AccountSidebar() {
  const pathname = usePathname();
  const { user } = useEcommerce();
  const signOut = useSignOut();

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-28">
        <div className="on-dark bg-espresso-glow flex items-center gap-3 rounded-card p-4 text-paper">
          {user ? <Avatar user={user} /> : <span className="skeleton h-10 w-10 rounded-full opacity-30" />}
          <div className="min-w-0">
            {user ? (
              <>
                <p className="truncate text-[15px] font-semibold">{user.fullName}</p>
                <p className="truncate text-[13px] text-paper/65">{user.email}</p>
              </>
            ) : (
              <div className="space-y-2">
                <div className="skeleton h-3.5 w-28 opacity-30" />
                <div className="skeleton h-3 w-36 opacity-30" />
              </div>
            )}
          </div>
        </div>

        <nav aria-label="Account sections" className="py-4">
          <ul>
            {[...ACCOUNT_LINKS, HELP_LINK].map((link) => {
              const active = isActiveLink(pathname, link);
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-full px-4 text-[15px] transition-colors ${
                      active ? "bg-cream font-medium text-ink" : "text-ink-soft hover:bg-cream/70 hover:text-ink"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-terracotta-deep" : "text-taupe"}`} strokeWidth={1.6} aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          onClick={signOut}
          className="flex min-h-11 w-full items-center gap-3 rounded-full px-4 text-[15px] text-ink-soft transition-colors hover:bg-danger-tint hover:text-danger"
        >
          <LogOut className="h-4 w-4 text-taupe" strokeWidth={1.6} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function AccountPageHeader({ title, description, action }) {
  return (
    <div className="mb-9 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="heading-display text-[42px] sm:text-[56px]">{title}</h1>
        {description && <p className="mt-2 text-[15px] text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/*
  Frame for customer account pages. Signed-out visitors are sent to
  login and brought back afterwards; pages render their own skeletons
  until auth is known, so nothing private or "empty" flashes first.
*/
export default function AccountShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authChecked, isLoggedIn } = useEcommerce();

  useEffect(() => {
    if (authChecked && !isLoggedIn) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [authChecked, isLoggedIn, pathname, router]);

  return (
    <div className="page-x pb-20 lg:pt-12 lg:pb-28">
      <AccountNav />
      <div className="grid grid-cols-1 gap-12 pt-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:pt-0 xl:gap-20">
        <AccountSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
