import { formatCedis } from "@/lib/formatCurrency";
import { DELIVERY_FEE } from "@/lib/pricing";

// One quiet line of store facts. Only claims the checkout actually honours.
export default function AnnouncementBar() {
  return (
    <div className="bg-ink text-cream">
      <p className="page-x py-2 text-center text-[12px] tracking-[0.04em]">
        Flat {formatCedis(DELIVERY_FEE)} delivery on every order
        <span className="hidden sm:inline">
          <span className="mx-2 text-cream/40" aria-hidden="true">
            /
          </span>
          Pay by card, Mobile Money or cash on delivery
        </span>
      </p>
    </div>
  );
}
