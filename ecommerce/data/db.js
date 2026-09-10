import heroBanner1 from "./images/heroBanner1.png"
import heroBanner2 from "./images/heroBanner2.png"
import heroBanner3 from "./images/heroBanner3.png"
import heroBanner4 from "./images/heroBanner4.png"

import cat1 from "./images/cat1.jpg"
import cat2 from "./images/cat2.jpg"
import cat3 from "./images/cat3.jpg"
import cat4 from "./images/cat4.jpg"
import cat5 from "./images/cat5.jpg"
import cat6 from "./images/cat6.jpg"

import heroCardAd1 from "./images/heroCardAd1.jpg"
import heroCardAd2 from "./images/heroCardAd2.jpg"



import shop1 from "./images/shopBanner1.jpg"
import shop2 from "./images/shopBanner2.jpg"
import shop3 from "./images/shopBanner3.jpg"
import shop4 from "./images/shopBanner4.jpg"

export const adverts = [
  {
    id: "advert-1",
    brand: "INTIMATES COLLECTION",
    title: "Seamless Wireless Bras",
    price: "GHS 120",
    oldPrice: "GHS 180",
    description: "Ultra-soft scalloped edge comfort bras • Limited stock",
    buttonText: "Shop Now",
    buttonLink: "/shop?category=lingerie",
    image: heroCardAd1,
  },
  {
    id: "advert-2",
    brand: "STREETWEAR BASICS",
    title: "Oversized Graphic Tees",
    price: "GHS 150",
    oldPrice: "GHS 220",
    description: "Relaxed fit drop-shoulder tees • Special offer",
    buttonText: "Shop Now",
    buttonLink: "/shop?category=tops",
    image: heroCardAd2,
  },
];

export const heroProducts = [
  {
    id: 1,
    category: "Shapewear",
    title: "Lace Trim Cami Shaper",
    description:
      "Smooth and contour your silhouette with comfortable lace-detailed compression camisoles for daily support.",
    image: heroBanner4,
    bgColor: "bg-rose-50",
  },
  {
    id: 2,
    category: "Corset Tops",
    title: "Waist Trainer Corset Tank",
    description:
      "Achieve targeted waist control with adjustable hook-and-eye closure shaper tops.",
    image: heroBanner3,
    bgColor: "bg-amber-50",
  },
  {
    id: 3,
    category: "Bags & Purses",
    title: "3-Piece Handbag Set",
    description:
      "Complete your outfit with a matching tote bag, crossbody purse, and zip pouch bundle.",
    image: heroBanner2,
    bgColor: "bg-pink-50",
  },
  {
    id: 4,
    category: "Basics & Crop Tops",
    title: "Seamless Camisole Tops",
    description:
      "Essential padded cropped camisoles in versatile neutral tones for easy layering.",
    image: heroBanner1,
    bgColor: "bg-stone-50",
  },
];


export const categories = [
  {
    id: 1,
    title: "Shapewear & Shorts",
    description: "High-waist smoothing body shapers and mid-thigh shorts.",
    image: cat1,
  },
  {
    id: 2,
    title: "Bags & Totes",
    description:
      "Stylish patterned shoulder bags and designer tote collections.",
    image: cat2,
  },
  {
    id: 3,
    title: "Seamless Tops & Bralettes",
    description:
      "Ultra-soft cropped camisoles and wireless everyday bralettes.",
    image: cat3,
  },
  {
    id: 4,
    title: "Panties & Seamless Briefs",
    description:
      "No-show laser-cut briefs and everyday full-coverage underwear.",
    image: cat4,
  },
  {
    id: 5,
    title: "Casual Tops & Tees",
    description: "Graphic printed t-shirts and modern relaxed everyday wear.",
    image: cat5,
  },
  {
    id: 6,
    title: "Sports Bras & Activewear",
    description:
      "Front-zip high-impact sports bras and breathable support tops.",
    image: cat6,
  },
];

export const shopBanner = [
  {
    id: 1,
    image: shop1,
    category: "Intimates & Lingerie",
    title: "Delicate Everyday Comfort",
    description:
      "Soft lace bralettes, seamless strapless bras, and essential briefs.",
  },
  {
    id: 2,
    image: shop2,
    category: "Women's Apparel",
    title: "Minimalist Modern Wardrobe",
    description:
      "Elegant draped dresses, linen basics, and neutral tone outfits.",
  },
  {
    id: 3,
    image: shop3,
    category: "Accessories & Footwear",
    title: "Neutral Tone Essentials",
    description:
      "Leather tote bags, block heels, ribbed tops, and skincare staples.",
  },
  {
    id: 4,
    image: shop4,
    category: "Monochrome Collection",
    title: "Warm Earthy Aesthetics",
    description: "Cozy knitwear, flowing dresses, and soft terracotta tones.",
  },
];

