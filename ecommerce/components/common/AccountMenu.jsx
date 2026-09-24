"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, User, UserPlus } from "lucide-react";
import { ACCOUNT_LINKS, HELP_LINK, isActiveLink } from "@/lib/accountLinks";

const GUEST_LINKS = [
  { label: "Sign in", href: "/login", icon: LogIn },
  { label: "Create account", href: "/signup", icon: UserPlus },
];

export function Avatar({ user, size = "md" }) {
  const box = size === "sm" ? "h-7 w-7 text-[11px]" : "h-10 w-10 text-sm";
  const initial = user?.fullName?.trim().charAt(0).toUpperCase();

  if (user?.image) {
    return (
      // Plain <img>: avatar hosts aren't known in advance for next/image
      // eslint-disable-next-line @next/next/no-img-element
      <img src={user.image} alt="" className={`${box} shrink-0 rounded-full bg-sand object-cover`} />
    );
  }

  return (
    <span
      className={`${box} flex shrink-0 items-center justify-center rounded-full bg-ink font-medium text-cream`}
      aria-hidden="true"
    >
      {initial || <User className="h-4 w-4" strokeWidth={1.75} />}
    </span>
  );
}

function MenuLink({ item, active, onNavigate }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      role="menuitem"
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={`flex min-h-11 items-center gap-3 px-4 text-sm transition-colors outline-none focus-visible:bg-cream ${
        active ? "bg-cream font-medium text-ink" : "text-ink-soft hover:bg-cream hover:text-ink"
      }`}
    >
      <Icon
        className={`h-4 w-4 shrink-0 ${active ? "text-ink" : "text-taupe"}`}
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

/*
  Customer account menu. The user comes from the auth context
  (/api/auth/is-me); nothing here is hardcoded.

  variant="dropdown": popover under the navbar account button
    (focuses the first item on open, arrow keys move between items)
  variant="inline":   the same items inside the mobile menu
*/
export default function AccountMenu({
  user,
  isLoggedIn,
  onNavigate,
  onSignOut,
  variant = "dropdown",
}) {
  const pathname = usePathname();
  const menuRef = useRef(null);
  const isDropdown = variant === "dropdown";

  // Move focus into the menu when the dropdown opens
  useEffect(() => {
    if (!isDropdown) return;
    menuRef.current?.querySelector('[role="menuitem"]')?.focus();
  }, [isDropdown]);

  // Arrow/Home/End keyboard navigation between items
  const handleKeyDown = (e) => {
    const items = [...(menuRef.current?.querySelectorAll('[role="menuitem"]') || [])];
    if (items.length === 0) return;

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

  const showUser = isLoggedIn && user;
  const links = showUser ? ACCOUNT_LINKS : GUEST_LINKS;

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Account"
      onKeyDown={handleKeyDown}
      className={
        isDropdown
          ? "w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-sm border border-line bg-white py-1 shadow-[0_12px_32px_rgba(28,26,23,0.12)]"
          : "overflow-hidden rounded-sm border border-line bg-white py-1"
      }
    >
      {/* Profile header (signed-in only - no private data for guests) */}
      {showUser ? (
        <div className="flex items-center gap-3 px-4 py-4">
          <Avatar user={user} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{user.fullName}</p>
            <p className="truncate text-[13px] text-muted" title={user.email}>
              {user.email}
            </p>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4">
          <p className="text-sm font-medium text-ink">Your account</p>
          <p className="text-[13px] text-muted">Sign in to see orders and saved pieces.</p>
        </div>
      )}

      <div className="border-t border-line" role="separator" />

      <div className="py-1">
        {links.map((item) => (
          <MenuLink
            key={item.href}
            item={item}
            active={isActiveLink(pathname, item)}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <div className="border-t border-line" role="separator" />

      <div className="py-1">
        <MenuLink item={HELP_LINK} active={isActiveLink(pathname, HELP_LINK)} onNavigate={onNavigate} />

        {showUser && onSignOut && (
          <button
            type="button"
            role="menuitem"
            onClick={onSignOut}
            className="flex min-h-11 w-full items-center gap-3 px-4 text-sm text-ink-soft transition-colors outline-none hover:bg-cream hover:text-danger focus-visible:bg-cream"
          >
            <LogOut className="h-4 w-4 shrink-0 text-taupe" strokeWidth={1.75} aria-hidden="true" />
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}
