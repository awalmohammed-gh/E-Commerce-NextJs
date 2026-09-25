import HomeHero from "@/components/home/HomeHero";
import CampaignTiles from "@/components/home/CampaignTiles";
import CategoryIndex from "@/components/home/CategoryIndex";
import EditorialBand from "@/components/home/EditorialBand";
import StoreFacts from "@/components/home/StoreFacts";
import JoinBand from "@/components/home/JoinBand";
import ProductRail from "@/components/card/ProductRail";
import { getStoreInfo } from "@/lib/storeInfo";

/*
  Homepage, paced like a lookbook: the campaign (hero), what's new,
  the current offers as image tiles, the category index, reduced pieces,
  a brand moment, bestsellers, the practical facts and a way to stay in
  touch. Product rows are live from MongoDB; empty rows hide themselves.
*/
export default async function Home() {
  const store = await getStoreInfo();

  return (
    <>
      <HomeHero />

      <div className="space-y-16 py-14 sm:space-y-24 sm:py-24">
        <ProductRail
          eyebrow="Just arrived"
          title="New in"
          query={{ sort: "newest", limit: 4 }}
          viewAllHref="/shop?sort=newest"
        />
        <CampaignTiles />
        <CategoryIndex />
        <ProductRail
          eyebrow="Reduced"
          title="On sale"
          query={{ onSale: true, inStock: true, sort: "newest", limit: 4 }}
          viewAllHref="/shop?onSale=true"
        />
      </div>

      <EditorialBand />

      <div className="space-y-16 py-14 sm:space-y-24 sm:py-24">
        <ProductRail
          eyebrow="Customer favourites"
          title="Bestsellers"
          query={{ bestseller: true, limit: 4 }}
          viewAllHref="/shop?bestseller=true"
        />
        <StoreFacts deliveryFee={store.deliveryFee} paymentMethods={store.paymentMethods} />
        <JoinBand />
      </div>
    </>
  );
}
