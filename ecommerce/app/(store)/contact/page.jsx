import Link from "next/link";
import { ArrowUpRight, ChevronRight, Mail, MapPin, Phone } from "lucide-react";
import { getStoreInfo } from "@/lib/storeInfo";
import { formatCedis } from "@/lib/formatCurrency";

export const metadata = {
  title: "Contact & help",
  description: "Get in touch with ELEOKA, or find help with an order.",
};

// The boutique's location (used when no address is set in admin settings)
const BOUTIQUE_ADDRESS = "Spintex Road, Flower Pot, near Assemblies of God Church, Accra";
const MAPS_QUERY = "Flower+Pot+Spintex+Road+Assemblies+of+God+Church+Accra";

const HELP_LINKS = [
  { title: "Track an order", text: "See the status and details of every order.", href: "/orders" },
  { title: "Change a delivery address", text: "Add, edit or choose your default address.", href: "/account/addresses" },
  { title: "Update your details", text: "Name, phone number, password and notifications.", href: "/account/settings" },
  { title: "Your saved pieces", text: "Everything you've added to your wishlist.", href: "/account/wishlist" },
];

export default async function ContactPage() {
  const store = await getStoreInfo();
  const address = store.address || BOUTIQUE_ADDRESS;
  const mapsQuery = store.address ? encodeURIComponent(store.address) : MAPS_QUERY;

  const contacts = [
    store.email && { icon: Mail, label: "Email", value: store.email, href: `mailto:${store.email}` },
    store.phone && { icon: Phone, label: "Phone", value: store.phone, href: `tel:${store.phone.replace(/[^\d+]/g, "")}` },
    {
      icon: MapPin,
      label: "Boutique",
      value: address,
      href: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
      external: true,
    },
  ].filter(Boolean);

  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="page-x py-12 sm:py-16 lg:py-20">
          <p className="eyebrow">Contact &amp; help</p>
          <h1 className="heading-display mt-4 max-w-2xl text-[44px] sm:text-6xl">We&rsquo;re here to help.</h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-soft">
            Most answers are already in your account. For anything else, reach us directly or visit the boutique.
          </p>
        </div>
      </section>

      <div className="page-x grid grid-cols-1 gap-14 py-14 sm:py-20 lg:grid-cols-2 lg:gap-20">
        {/* Self-service */}
        <section aria-labelledby="help-title">
          <h2 id="help-title" className="heading-section">
            Help with an order
          </h2>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="group flex min-h-18 items-center gap-4 py-4 transition-colors hover:bg-cream/60 sm:px-3">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] text-ink">{link.title}</span>
                    <span className="block text-[14px] text-muted">{link.text}</span>
                  </span>
                  <ChevronRight className="h-4.5 w-4.5 shrink-0 text-taupe transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          <dl className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="eyebrow">Delivery</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                A flat {formatCedis(store.deliveryFee)} on every order, whatever you buy.
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Payment</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                {store.paymentMethods.length ? `${store.paymentMethods.join(", ")}.` : "Choose how to pay at checkout."}
              </dd>
            </div>
          </dl>
        </section>

        {/* Reach us */}
        <section aria-labelledby="reach-title">
          <h2 id="reach-title" className="heading-section">
            Reach us
          </h2>
          <ul className="mt-6 space-y-5">
            {contacts.map(({ icon: Icon, label, value, href, external }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-start gap-4"
                >
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-taupe" strokeWidth={1.5} aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-[13px] text-muted">{label}</span>
                    <span className="flex items-center gap-1.5 text-[16px] text-ink decoration-ink/30 underline-offset-4 group-hover:underline">
                      {value}
                      {external && <ArrowUpRight className="h-4 w-4 shrink-0" aria-label="(opens Google Maps)" />}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="relative mt-8 aspect-4/3 overflow-hidden rounded-xs border border-line bg-sand">
            <iframe
              title="Map showing the Eleoka boutique"
              src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      </div>
    </>
  );
}
