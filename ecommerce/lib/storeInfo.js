// Server-only: imported by server components (footer, contact page)
import { unstable_cache } from "next/cache";
import { connectMongodb } from "@/lib/mongodb";
import { getSettings } from "@/lib/settings";
import { DELIVERY_FEE } from "@/lib/pricing";

const PAYMENT_LABELS = {
  cashOnDelivery: "Cash on delivery",
  mobileMoney: "Mobile Money",
  card: "Card",
};

/*
  Public store details for the footer and contact page, taken from the
  admin settings. Blank fields are left blank - the UI hides them rather
  than showing placeholder contact details. Cached for five minutes.
*/
const loadStoreInfo = unstable_cache(
  async () => {
    await connectMongodb();
    const { general, payments } = await getSettings();

    return {
      name: general.systemName || "Eleoka",
      email: general.email || "",
      phone: general.phone || "",
      address: general.address || "",
      description: general.description || "",
      paymentMethods: Object.entries(PAYMENT_LABELS)
        .filter(([key]) => payments?.[key])
        .map(([, label]) => label),
    };
  },
  ["store-info"],
  { revalidate: 300 },
);

const FALLBACK = {
  name: "Eleoka",
  email: "",
  phone: "",
  address: "",
  description: "",
  paymentMethods: [],
};

export async function getStoreInfo() {
  try {
    return { ...(await loadStoreInfo()), deliveryFee: DELIVERY_FEE };
  } catch (error) {
    // The page still renders without contact details if the DB is unreachable
    console.error("Store info error:", error);
    return { ...FALLBACK, deliveryFee: DELIVERY_FEE };
  }
}
