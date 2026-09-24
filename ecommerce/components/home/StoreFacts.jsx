import { PackageCheck, Truck, Wallet } from "lucide-react";
import { formatCedis } from "@/lib/formatCurrency";

/*
  Three practical facts, each true of the current checkout:
  flat delivery fee, the enabled payment methods, and order tracking.
*/
export default function StoreFacts({ deliveryFee, paymentMethods = [] }) {
  const facts = [
    {
      icon: Truck,
      title: `${formatCedis(deliveryFee)} delivery`,
      text: "One flat fee per order, whatever you buy.",
    },
    {
      icon: Wallet,
      title: "Pay your way",
      text: paymentMethods.length
        ? `${paymentMethods.join(", ")}.`
        : "Choose how to pay at checkout.",
    },
    {
      icon: PackageCheck,
      title: "Follow every order",
      text: "See each order's status in your account.",
    },
  ];

  return (
    <section className="page-x" aria-label="Shopping with Eleoka">
      <ul className="grid grid-cols-1 divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {facts.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-4 py-6 sm:px-6 sm:py-8 sm:first:pl-0 sm:last:pr-0">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-taupe" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p className="text-[15px] font-medium text-ink">{title}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
