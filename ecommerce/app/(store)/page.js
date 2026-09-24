import HomeHero from "@/components/home/HomeHero";
import CategoryIndex from "@/components/home/CategoryIndex";
import EditorialBand from "@/components/home/EditorialBand";
import StoreFacts from "@/components/home/StoreFacts";
import ProductRail from "@/components/card/ProductRail";
import { getStoreInfo } from "@/lib/storeInfo";

/*
  Homepage: who Eleoka is (hero), where to start (categories), what's
  in the store now (live product rows from MongoDB - empty rows hide
  themselves) and the practical facts about buying.
*/
export default async function Home() {
  const store = await getStoreInfo();

  return (
    <>
      <HomeHero />

      <div className="space-y-16 py-16 sm:space-y-24 sm:py-24">
        <ProductRail
          eyebrow="Just arrived"
          title="New in"
          query={{ sort: "newest", limit: 4 }}
          viewAllHref="/shop?sort=newest"
        />
        <CategoryIndex />
      </div>

      <EditorialBand />

      <div className="space-y-16 py-16 sm:space-y-24 sm:py-24">
        <ProductRail
          eyebrow="Reduced"
          title="On sale"
          query={{ onSale: true, inStock: true, sort: "newest", limit: 4 }}
          viewAllHref="/shop?onSale=true"
        />
        <ProductRail
          eyebrow="Customer favourites"
          title="Bestsellers"
          query={{ bestseller: true, limit: 4 }}
          viewAllHref="/shop?bestseller=true"
        />
        <StoreFacts deliveryFee={store.deliveryFee} paymentMethods={store.paymentMethods} />
      </div>
    </>
  );
}
