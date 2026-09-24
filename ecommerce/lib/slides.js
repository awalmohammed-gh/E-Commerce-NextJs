import heroBanner1 from "@/data/images/heroBanner1.png";
import heroBanner2 from "@/data/images/heroBanner2.png";
import heroBanner3 from "@/data/images/heroBanner3.png";
import heroBanner4 from "@/data/images/heroBanner4.png";
import shopStillLife from "@/data/images/shopBanner2.jpg";
import shopRail from "@/data/images/shopBanner4.jpg";
import shopPeach from "@/data/images/shopBanner1.jpg";

/*
  Slides for the homepage hero and the shop banner. Add, remove or
  reorder entries here - components/ui/Slideshow.jsx renders whatever
  is in the list. Text stays real HTML (never baked into the images).

  image:     static import (gives Next.js the size and a blur placeholder)
  focus:     CSS object-position, keeps the subject in frame when cropped
  backgroundColor: (hero only) the slide's backdrop; the transparent
             product cut-outs sit directly on it
  primary / secondary: { label, href } calls to action (secondary optional)
*/
// Shown in this order: heroBanner1 -> 2 -> 3 -> 4, then back to 1
export const HERO_SLIDES = [
  {
    id: "essentials",
    eyebrow: "Eleoka · Accra",
    title: "Everyday essentials, in every shade.",
    text: "Soft, stretchy crop tops that sit smoothly under anything. Chosen in Accra and delivered to your door.",
    image: heroBanner1,
    alt: "Four cropped camisole tops in beige, brown, black and white",
    focus: "50% 50%",
    backgroundColor: "#ece2d6",
    primary: { label: "Shop tops", href: "/shop?category=tops" },
    secondary: { label: "Browse categories", href: "#categories" },
  },
  {
    id: "bags",
    eyebrow: "Bags & accessories",
    title: "One set, every occasion.",
    text: "A roomy tote, a crossbody and a pouch in soft blush and cream, for workdays and weekends alike.",
    image: heroBanner2,
    alt: "A blush and cream handbag set: a tote, a tasselled crossbody bag and a pouch",
    focus: "50% 55%",
    backgroundColor: "#f5e3e1",
    primary: { label: "Shop bags", href: "/shop?category=accessories" },
    secondary: { label: "Shop new in", href: "/shop?sort=newest" },
  },
  {
    id: "shaping",
    eyebrow: "The Eleoka edit",
    title: "Smooth lines, all day long.",
    text: "Supportive shaping tanks that do the quiet work under dresses and sets.",
    image: heroBanner3,
    alt: "Two shaping tank tops with hook fastenings, one nude and one black",
    focus: "50% 45%",
    backgroundColor: "#e8e4de",
    primary: { label: "Shop the collection", href: "/shop" },
    secondary: { label: "Our story", href: "/about" },
  },
  {
    id: "lace",
    eyebrow: "Just arrived",
    title: "Soft lace, in every colour.",
    text: "Lace-trimmed camisoles in cream, charcoal, blue, blush and rose. Pick a favourite, or take them all.",
    image: heroBanner4,
    alt: "Five lace-trimmed camisoles in cream, charcoal, blue, blush and rose",
    focus: "50% 35%",
    backgroundColor: "#e3e9eb",
    primary: { label: "Shop new in", href: "/shop?sort=newest" },
    secondary: { label: "Browse categories", href: "#categories" },
  },
];

export const SHOP_SLIDES = [
  {
    id: "new-in",
    eyebrow: "New in",
    title: "The latest arrivals",
    image: shopStillLife,
    alt: "A neutral still life of a knit top, heeled mules and a leather tote",
    focus: "70% 50%",
    primary: { label: "Shop new in", href: "/shop?sort=newest" },
  },
  {
    id: "sale",
    eyebrow: "On sale",
    title: "Favourites, now for less",
    image: shopRail,
    alt: "A dress form beside a rail of soft-coloured clothes",
    focus: "55% 50%",
    primary: { label: "Shop the sale", href: "/shop?onSale=true" },
  },
  {
    id: "tops",
    eyebrow: "Category",
    title: "Easy tops for every day",
    image: shopPeach,
    alt: "A rail of neutral clothes against a peach wall",
    focus: "80% 50%",
    primary: { label: "Shop tops", href: "/shop?category=tops" },
  },
];
