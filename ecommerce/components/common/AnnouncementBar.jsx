import { formatCedis } from "@/lib/formatCurrency";
import { getStoreInfo } from "@/lib/storeInfo";

// One quiet line of store facts. Only claims the checkout actually honours.
export default async function AnnouncementBar() {
  const { deliveryFee } = await getStoreInfo();

  return (
    <div className="bg-ink text-cream">
      <p className="page-x py-2 text-center text-[12px] tracking-[0.04em]">
        {deliveryFee != null && (
          <>
            {deliveryFee > 0 ? `Flat ${formatCedis(deliveryFee)} delivery` : "Free delivery"} on every order
            <span className="hidden sm:inline">
              <span className="mx-2 text-cream/40" aria-hidden="true">
                /
              </span>
            </span>
          </>
        )}
        <span className={deliveryFee != null ? "hidden sm:inline" : ""}>
          Pay by card, Mobile Money or cash on delivery
        </span>
      </p>
    </div>
  );
}
