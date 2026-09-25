import { PackageCheck, Truck, Wallet } from "lucide-react";
import { formatCedis } from "@/lib/formatCurrency";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

/*
  Three practical facts, each true of the current checkout:
  flat delivery fee, the enabled payment methods, and order tracking.
*/
export default function StoreFacts({ deliveryFee, paymentMethods = [] }) {
  const facts = [
    {
      icon: Truck,
      // deliveryFee is null when settings couldn't be read
      title:
        deliveryFee == null ? "Flat-rate delivery" : deliveryFee > 0 ? `${formatCedis(deliveryFee)} delivery` : "Free delivery",
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
      <RevealGroup as="ul" className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
        {facts.map(({ icon: Icon, title, text }) => (
          <RevealItem as="li" key={title} className="flex items-start gap-4 rounded-card bg-cream px-5 py-6 sm:flex-col sm:gap-5 sm:p-7">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper text-terracotta-deep">
              <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-[24px] leading-tight text-ink">{title}</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{text}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
