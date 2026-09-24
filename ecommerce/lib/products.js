import mongoose from "mongoose";
import { Product } from "@/models/Product";

/* ------------------------------------------------------------------
   Public product queries for the storefront.
   Only the fields customers need ever leave the server.
------------------------------------------------------------------ */

const CARD_FIELDS = {
  name: 1,
  category: 1,
  subCategory: 1,
  price: 1,
  offerPrice: 1,
  effectivePrice: 1,
  images: 1,
  sizes: 1,
  stock: 1,
  inStock: 1,
  bestseller: 1,
  newArrival: 1,
  createdAt: 1,
};

const DETAIL_FIELDS = { ...CARD_FIELDS, description: 1 };

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

// Offer price counts only when it is a real discount (mirrors lib/pricing.js)
const EFFECTIVE_PRICE = {
  $cond: [
    {
      $and: [
        { $gt: [{ $ifNull: ["$offerPrice", 0] }, 0] },
        { $lt: ["$offerPrice", "$price"] },
      ],
    },
    "$offerPrice",
    "$price",
  ],
};

const DERIVED_FIELDS = {
  $addFields: {
    effectivePrice: EFFECTIVE_PRICE,
    inStock: { $gt: [{ $ifNull: ["$stock", 0] }, 0] },
    // Older documents may miss these array/flag fields
    sizes: { $ifNull: ["$sizes", []] },
    images: { $ifNull: ["$images", []] },
    bestseller: { $ifNull: ["$bestseller", false] },
    newArrival: { $ifNull: ["$newArrival", false] },
  },
};

export const SORT_OPTIONS = {
  newest: { createdAt: -1, _id: -1 },
  "price-low": { effectivePrice: 1, _id: 1 },
  "price-high": { effectivePrice: -1, _id: 1 },
  "name-asc": { name: 1, _id: 1 },
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Case-insensitive exact match, so /shop?category=tops finds "Tops"
const exactMatch = (value) => new RegExp(`^${escapeRegex(value)}$`, "i");

const isTrue = (value) => value === "true" || value === "1";

const toPositiveInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const toPrice = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export const isValidProductId = (id) =>
  typeof id === "string" && mongoose.isValidObjectId(id) && /^[a-f\d]{24}$/i.test(id);

/*
  Translates query-string params into a MongoDB pipeline.
  Supported: page, limit, category, subCategory, search, sort,
  minPrice, maxPrice, bestseller, newArrival, onSale, inStock, exclude
*/
function buildListPipeline(params) {
  const match = {};

  const category = params.get("category")?.trim();
  if (category) match.category = exactMatch(category);

  const subCategory = params.get("subCategory")?.trim();
  if (subCategory) match.subCategory = exactMatch(subCategory);

  const search = params.get("search")?.trim().slice(0, 100);
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    match.$or = [
      { name: pattern },
      { description: pattern },
      { category: pattern },
      { subCategory: pattern },
    ];
  }

  if (isTrue(params.get("bestseller"))) match.bestseller = true;
  if (isTrue(params.get("newArrival"))) match.newArrival = true;
  if (isTrue(params.get("inStock"))) match.stock = { $gt: 0 };

  const exclude = params.get("exclude");
  if (exclude && isValidProductId(exclude)) {
    match._id = { $ne: new mongoose.Types.ObjectId(exclude) };
  }

  // Filters on the computed price run after $addFields
  const priceMatch = {};
  const minPrice = toPrice(params.get("minPrice"));
  const maxPrice = toPrice(params.get("maxPrice"));
  if (minPrice !== null || maxPrice !== null) {
    priceMatch.effectivePrice = {};
    if (minPrice !== null) priceMatch.effectivePrice.$gte = minPrice;
    if (maxPrice !== null) priceMatch.effectivePrice.$lte = maxPrice;
  }
  if (isTrue(params.get("onSale"))) {
    priceMatch.$expr = { $lt: ["$effectivePrice", "$price"] };
  }

  const sortKey = Object.hasOwn(SORT_OPTIONS, params.get("sort"))
    ? params.get("sort")
    : "newest";
  const limit = Math.min(toPositiveInt(params.get("limit"), DEFAULT_LIMIT), MAX_LIMIT);
  const page = toPositiveInt(params.get("page"), 1);

  const pipeline = [{ $match: match }, DERIVED_FIELDS];
  if (Object.keys(priceMatch).length) pipeline.push({ $match: priceMatch });

  pipeline.push({
    $facet: {
      products: [
        { $sort: SORT_OPTIONS[sortKey] },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        { $project: CARD_FIELDS },
      ],
      total: [{ $count: "count" }],
    },
  });

  return { pipeline, page, limit, sort: sortKey };
}

export async function listProducts(params) {
  const { pipeline, page, limit, sort } = buildListPipeline(params);
  const [result] = await Product.aggregate(pipeline);

  const totalProducts = result.total[0]?.count || 0;

  return {
    products: result.products,
    pagination: {
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
    },
    sort,
  };
}

export async function getPublicProduct(id) {
  if (!isValidProductId(id)) return null;

  const [product] = await Product.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    DERIVED_FIELDS,
    { $project: DETAIL_FIELDS },
  ]);

  return product || null;
}

// Card data for a set of product ids (missing/deleted ids are simply absent)
export async function getPublicProductsByIds(ids) {
  if (ids.length === 0) return [];

  return Product.aggregate([
    { $match: { _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(String(id))) } } },
    DERIVED_FIELDS,
    { $project: CARD_FIELDS },
  ]);
}

// Categories with their subcategories and product counts, for filters
export async function listCategories() {
  const rows = await Product.aggregate([
    {
      $group: {
        _id: { category: "$category", subCategory: "$subCategory" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.category": 1, "_id.subCategory": 1 } },
  ]);

  const byCategory = new Map();

  for (const { _id, count } of rows) {
    const name = _id.category?.trim();
    if (!name) continue;

    const entry = byCategory.get(name) || { name, count: 0, subCategories: [] };
    entry.count += count;

    const sub = _id.subCategory?.trim();
    if (sub) entry.subCategories.push({ name: sub, count });

    byCategory.set(name, entry);
  }

  return [...byCategory.values()];
}
