/*
  Storefront categories. The slug is what goes in the URL
  (/shop?category=tops) and is matched case-insensitively against the
  product's category in MongoDB; the label is what customers read.
  Used by the navbar, shop banner, homepage and footer.
*/
export const STORE_CATEGORIES = [
  { slug: "dresses", label: "Dresses", blurb: "Day to evening, cut to move with you." },
  { slug: "tops", label: "Tops & Blouses", blurb: "Easy tees, soft knits and polished blouses." },
  { slug: "skirts", label: "Skirts", blurb: "Minis, midis and everything between." },
  { slug: "pants", label: "Pants & Trousers", blurb: "Tailored and relaxed shapes for every day." },
  { slug: "sets", label: "Two-Piece Sets", blurb: "Matching pieces that do the styling for you." },
  { slug: "outerwear", label: "Outerwear", blurb: "Light layers for cool evenings." },
  { slug: "shoes", label: "Shoes", blurb: "Heels, flats and sandals to finish the look." },
  { slug: "accessories", label: "Bags & Accessories", blurb: "Bags and small things that make an outfit." },
];

export const shopCategoryHref = (slug) => `/shop?category=${encodeURIComponent(slug)}`;

const same = (a, b) => String(a || "").toLowerCase() === String(b || "").toLowerCase();

// Store category for a URL slug or a product's category name ("Tops" -> Tops & Blouses)
export function findStoreCategory(value) {
  if (!value) return null;
  return STORE_CATEGORIES.find((c) => same(c.slug, value) || same(c.label, value)) || null;
}

// What to call a category on screen, falling back to the raw value
export function categoryLabel(value) {
  return findStoreCategory(value)?.label || value || "";
}
