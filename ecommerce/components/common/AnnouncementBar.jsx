import { formatCedis } from "@/lib/formatCurrency";
import { getStoreInfo } from "@/lib/storeInfo";

// One quiet line of store facts. Only claims the checkout actually honours.
export default async function AnnouncementBar() {
  const { deliveryFee } = await getStoreInfo();

  return (
    <div className="bg-espresso-deep text-paper/85">
      <p className="page-x flex min-h-9 items-center justify-center py-2 text-center text-[11.5px] font-medium tracking-[0.12em] uppercase">
        {deliveryFee != null && (
          <>
            {deliveryFee > 0 ? `Flat ${formatCedis(deliveryFee)} delivery` : "Free delivery"} on every order
            <span className="hidden sm:inline">
              <span className="mx-3 inline-block h-1 w-1 translate-y-[-2px] rounded-full bg-terracotta-light" aria-hidden="true" />
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
