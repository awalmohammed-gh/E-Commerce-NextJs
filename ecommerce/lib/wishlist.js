import mongoose from "mongoose";
import { Users } from "@/models/User";
import { Product } from "@/models/Product";
import { getPublicProductsByIds, isValidProductId } from "@/lib/products";

/*
  The wishlist lives on the user document: users.wishlist is a list of
  { product, addedAt }, newest first. Every query is scoped to the
  authenticated user's _id, and each write is one atomic update, so a
  product can never be saved twice.

  Products are joined at read time, so the page always shows current
  prices and stock. Entries whose product was deleted come back with
  product: null instead of disappearing or breaking the page.
*/

export const MAX_WISHLIST = 200;

const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

// Returns the list of items, or null when the user doesn't exist
export async function listWishlist(userId) {
  const user = await Users.findById(userId, { wishlist: 1 }).lean();
  if (!user) return null;

  const entries = user.wishlist || [];
  const products = await getPublicProductsByIds(entries.map((e) => e.product));
  const byId = new Map(products.map((p) => [String(p._id), p]));

  return entries.map((entry) => {
    const product = byId.get(String(entry.product)) || null;
    return {
      productId: String(entry.product),
      addedAt: entry.addedAt,
      product,
      // Deleted or out-of-stock products can't be added to the cart
      available: Boolean(product?.inStock),
    };
  });
}

/*
  Saves a product. Adding one that is already saved is a no-op success.
  Returns "added" | "exists" | "notFound" (product) | "full" | "noUser".
*/
export async function addToWishlist(userId, productId) {
  if (!isValidProductId(productId)) return "notFound";

  const productExists = await Product.exists({ _id: toObjectId(productId) });
  if (!productExists) return "notFound";

  const result = await Users.updateOne(
    {
      _id: toObjectId(userId),
      "wishlist.product": { $ne: toObjectId(productId) },
      $expr: { $lt: [{ $size: { $ifNull: ["$wishlist", []] } }, MAX_WISHLIST] },
    },
    {
      $push: {
        wishlist: {
          $each: [{ product: toObjectId(productId), addedAt: new Date() }],
          $position: 0,
        },
      },
    },
  );

  if (result.modifiedCount === 1) return "added";

  // Nothing changed: find out why
  const user = await Users.findById(userId, { wishlist: 1 }).lean();
  if (!user) return "noUser";

  const saved = (user.wishlist || []).some((e) => String(e.product) === productId);
  return saved ? "exists" : "full";
}

// Removes a product (also works for products that were since deleted)
export async function removeFromWishlist(userId, productId) {
  const result = await Users.updateOne(
    { _id: toObjectId(userId) },
    { $pull: { wishlist: { product: toObjectId(productId) } } },
  );
  return result.matchedCount === 1;
}
