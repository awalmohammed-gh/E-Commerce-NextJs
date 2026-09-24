// Server-only: imported by server components and /api/store-info
import { unstable_cache } from "next/cache";
import { connectMongodb } from "@/lib/mongodb";
import { getSettings, STORE_SETTINGS_TAG } from "@/lib/settings";

const PAYMENT_LABELS = {
  cashOnDelivery: "Cash on delivery",
  mobileMoney: "Mobile Money",
  card: "Card",
};

/*
  Public store details for the storefront (announcement bar, footer,
  contact page, product page), taken from the admin settings. Blank
  fields are left blank - the UI hides them rather than showing
  placeholder details.

  Cached for five minutes, and tagged so saving settings in the admin
  clears it at once (app/api/admin/settings). The delivery fee shown here
  is display only; cart and checkout read it fresh with getDeliveryFee().
*/
const loadStoreInfo = unstable_cache(
  async () => {
    await connectMongodb();
    const { general, store, payments } = await getSettings();

    return {
      name: general.systemName || "Eleoka",
      email: general.email || "",
      phone: general.phone || "",
      address: general.address || "",
      description: general.description || "",
      deliveryFee: Number(store?.deliveryFee),
      paymentMethods: Object.entries(PAYMENT_LABELS)
        .filter(([key]) => payments?.[key])
        .map(([, label]) => label),
    };
  },
  ["store-info"],
  { revalidate: 300, tags: [STORE_SETTINGS_TAG] },
);

// deliveryFee is null when it can't be read, and the UI then leaves it out
const FALLBACK = {
  name: "Eleoka",
  email: "",
  phone: "",
  address: "",
  description: "",
  deliveryFee: null,
  paymentMethods: [],
};

export async function getStoreInfo() {
  try {
    const info = await loadStoreInfo();
    return { ...info, deliveryFee: Number.isFinite(info.deliveryFee) ? info.deliveryFee : null };
  } catch (error) {
    // The page still renders without store details if the DB is unreachable
    console.error("Store info error:", error);
    return FALLBACK;
  }
}
