import mongoose from "mongoose";
import { Product } from "@/models/Product";
import { DEFAULT_SIZE, DELIVERY_FEE, getUnitPrice } from "@/lib/pricing";

/*
  The cart is stored on the user as { [productId]: { [size]: quantity } }.
  Everything else (name, image, price, stock) is looked up from MongoDB
  here, so the client never supplies prices or totals.
*/

export const MAX_QUANTITY_PER_LINE = 99;

const isObjectId = (id) => /^[a-f\d]{24}$/i.test(id);

// Removes empty sizes/products and non-positive quantities
export function normalizeCart(cartData) {
  const clean = {};

  for (const [productId, sizes] of Object.entries(cartData || {})) {
    if (!sizes || typeof sizes !== "object") continue;

    for (const [size, qty] of Object.entries(sizes)) {
      const quantity = Math.floor(Number(qty));
      if (quantity > 0) {
        clean[productId] ||= {};
        clean[productId][size] = quantity;
      }
    }
  }

  return clean;
}

// Total quantity of one product across all its sizes
export const productQuantityInCart = (cartData, productId) =>
  Object.values(cartData?.[productId] || {}).reduce(
    (sum, qty) => sum + (Number(qty) || 0),
    0,
  );

export async function findCartProducts(productIds) {
  const ids = productIds.filter(isObjectId);
  if (ids.length === 0) return new Map();

  const products = await Product.find({ _id: { $in: ids } })
    .select("name category images sizes stock price offerPrice")
    .lean();

  return new Map(products.map((p) => [String(p._id), p]));
}

// Whether `size` is a valid choice for `product`
export function isValidSize(product, size) {
  const sizes = (product.sizes || []).filter(Boolean);
  return sizes.length === 0 ? size === DEFAULT_SIZE : sizes.includes(size);
}

/*
  Prices every cart line from the current product data and flags
  anything that would block checkout (removed product, bad size,
  not enough stock).
*/
export async function priceCart(cartData) {
  const cart = normalizeCart(cartData);
  const products = await findCartProducts(Object.keys(cart));

  const items = [];
  const issues = [];

  for (const [productId, sizes] of Object.entries(cart)) {
    const product = products.get(productId);
    const requestedTotal = productQuantityInCart(cart, productId);

    for (const [size, quantity] of Object.entries(sizes)) {
      if (!product) {
        const message = "This product is no longer available";
        items.push({ productId, size, quantity, available: false, issue: message });
        issues.push({ productId, size, message });
        continue;
      }

      const unitPrice = getUnitPrice(product);
      const stock = Math.max(0, Number(product.stock) || 0);

      let issue = null;
      if (!isValidSize(product, size)) {
        issue = "This size is no longer offered";
      } else if (stock === 0) {
        issue = "Out of stock";
      } else if (requestedTotal > stock) {
        issue = `Only ${stock} left in stock`;
      }

      items.push({
        productId,
        size,
        quantity,
        name: product.name,
        category: product.category,
        image: product.images?.[0] || null,
        unitPrice,
        lineTotal: unitPrice * quantity,
        stock,
        available: !issue,
        issue,
      });

      if (issue) issues.push({ productId, size, message: issue });
    }
  }

  const subtotal = items.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = itemCount > 0 ? DELIVERY_FEE : 0;

  return {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    issues,
  };
}

/*
  Atomically takes stock for every product in the order. Each decrement
  only succeeds if enough stock remains at that moment; if any fails,
  the ones already taken are put back.
*/
export async function reserveStock(quantitiesByProduct) {
  const taken = [];

  for (const [productId, quantity] of Object.entries(quantitiesByProduct)) {
    const result = await Product.updateOne(
      { _id: new mongoose.Types.ObjectId(productId), stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
    );

    if (result.modifiedCount !== 1) {
      await releaseStock(Object.fromEntries(taken));
      return { ok: false, productId };
    }

    taken.push([productId, quantity]);
  }

  return { ok: true };
}

export async function releaseStock(quantitiesByProduct) {
  await Promise.all(
    Object.entries(quantitiesByProduct).map(([productId, quantity]) =>
      Product.updateOne(
        { _id: new mongoose.Types.ObjectId(productId) },
        { $inc: { stock: quantity } },
      ),
    ),
  );
}
