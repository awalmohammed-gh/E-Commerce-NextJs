import { CircleHelp, Heart, LayoutGrid, MapPin, Settings, User } from "lucide-react";

/*
  Customer account sections, shared by the navbar account menu and the
  in-page account navigation. `exact` routes are only active on their own
  path (so /account isn't highlighted on /account/addresses).
*/
export const ACCOUNT_LINKS = [
  { label: "My Account", short: "Overview", href: "/account", icon: User, exact: true },
  { label: "My Orders", short: "Orders", href: "/orders", icon: LayoutGrid },
  { label: "My Address", short: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Wishlist", short: "Wishlist", href: "/account/wishlist", icon: Heart },
  { label: "Settings", short: "Settings", href: "/account/settings", icon: Settings },
];

export const HELP_LINK = { label: "Help & Support", href: "/contact", icon: CircleHelp };

export const isActiveLink = (pathname, link) =>
  pathname === link.href || (!link.exact && Boolean(pathname?.startsWith(`${link.href}/`)));
