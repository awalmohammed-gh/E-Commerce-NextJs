import FirstLandingAdvert from "@/components/advert/FirstLandingAdvert";
import ThirdLandingAdvert from "@/components/advert/ThirdLandingAdvert";
import TopDealAdvert from "@/components/advert/TopDealAdvert";
import Newsletter from "@/components/common/NewsLetter";
import Services from "@/components/common/Services";
import DealsOff from "@/components/landing/DealsOff";
import Hero from "@/components/landing/Hero";
import LandingCategories from "@/components/advert/LandingCategories";
import TopSelling from "@/components/landing/TopSelling";
import NewArrival from "@/components/landing/NewArrival";

export default function Home() {
  return (
    <>
      <Hero />
      <LandingCategories />
      <TopSelling />
      <ThirdLandingAdvert/>
      <NewArrival/>
      <FirstLandingAdvert />
      <DealsOff />
      <TopDealAdvert/>
      <Services/>
      <Newsletter/>
    </>
  );
}
