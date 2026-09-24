import Link from "next/link";
import Logo from "@/components/common/Logo";
import { STORE_CATEGORIES, shopCategoryHref } from "@/lib/categories";
import { formatCedis } from "@/lib/formatCurrency";
import { getStoreInfo } from "@/lib/storeInfo";

const HELP_LINKS = [
  { label: "Contact & help", href: "/contact" },
  { label: "My orders", href: "/orders" },
  { label: "Delivery addresses", href: "/account/addresses" },
  { label: "About Eleoka", href: "/about" },
];

const ACCOUNT_LINKS = [
  { label: "My account", href: "/account" },
  { label: "Wishlist", href: "/account/wishlist" },
  { label: "Settings", href: "/account/settings" },
  { label: "Bag", href: "/shopping-cart" },
];

function Column({ title, children }) {
  return (
    <div>
      <h2 className="eyebrow mb-4 text-cream/55">{title}</h2>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-flex min-h-9 items-center text-[15px] text-cream/80 decoration-cream/40 underline-offset-4 transition-colors hover:text-cream hover:underline"
      >
        {children}
      </Link>
    </li>
  );
}

/*
  Store footer. Contact details and payment methods come from the admin
  settings; anything the admin hasn't filled in is simply not shown.
  No social links are listed because none are configured.
*/
export default async function Footer() {
  const store = await getStoreInfo();
  const year = new Date().getFullYear();
  const hasContact = Boolean(store.email || store.phone || store.address);

  return (
    <footer className="bg-ink text-cream">
      <div className="page-x grid grid-cols-2 gap-x-6 gap-y-12 py-14 md:grid-cols-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-x-12 lg:py-20">
        {/* Brand */}
        <div className="col-span-2 md:col-span-4 lg:col-span-1">
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-cream/70">
            {store.description ||
              "A women's fashion boutique from Accra. Pieces chosen to be worn often and kept for years."}
          </p>

          {hasContact && (
            <ul className="mt-6 space-y-1.5 text-[15px] text-cream/80">
              {store.email && (
                <li>
                  <a href={`mailto:${store.email}`} className="hover:text-cream hover:underline underline-offset-4">
                    {store.email}
                  </a>
                </li>
              )}
              {store.phone && (
                <li>
                  <a href={`tel:${store.phone.replace(/[^\d+]/g, "")}`} className="hover:text-cream hover:underline underline-offset-4">
                    {store.phone}
                  </a>
                </li>
              )}
              {store.address && <li className="text-cream/65">{store.address}</li>}
            </ul>
          )}
        </div>

        <Column title="Shop">
          <FooterLink href="/shop">Shop all</FooterLink>
          {STORE_CATEGORIES.slice(0, 5).map((c) => (
            <FooterLink key={c.slug} href={shopCategoryHref(c.slug)}>
              {c.label}
            </FooterLink>
          ))}
        </Column>

        <Column title="More">
          {STORE_CATEGORIES.slice(5).map((c) => (
            <FooterLink key={c.slug} href={shopCategoryHref(c.slug)}>
              {c.label}
            </FooterLink>
          ))}
          <FooterLink href="/shop?onSale=true">On sale</FooterLink>
          <FooterLink href="/shop?sort=newest">New in</FooterLink>
        </Column>

        <div className="col-span-2 grid grid-cols-2 gap-x-6 gap-y-12 md:col-span-2 lg:col-span-1 lg:grid-cols-1">
          <Column title="Help">
            {HELP_LINKS.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </Column>
          <Column title="Account">
            {ACCOUNT_LINKS.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </Column>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="page-x flex flex-col gap-3 py-6 text-[13px] text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {store.name}. All rights reserved.
          </p>
          <p>
            {[
              store.deliveryFee != null &&
                (store.deliveryFee > 0 ? `Delivery ${formatCedis(store.deliveryFee)} per order` : "Free delivery"),
              store.paymentMethods.length > 0 && store.paymentMethods.join(", "),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>
    </footer>
  );
}
