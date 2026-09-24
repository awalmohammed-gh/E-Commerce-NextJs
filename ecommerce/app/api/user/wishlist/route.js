import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import { getAuthUser } from "@/middleware/auth";
import { isValidProductId } from "@/lib/products";
import { MAX_WISHLIST, addToWishlist, listWishlist } from "@/lib/wishlist";

export const dynamic = "force-dynamic";

const notAuthenticated = () =>
  NextResponse.json(
    { success: false, message: "Please sign in to use your wishlist" },
    { status: 401 },
  );

// The signed-in customer's saved products, joined with current product data
export async function GET(request) {
  const authUser = getAuthUser(request);
  if (!authUser) return notAuthenticated();

  try {
    await connectMongodb();

    const items = await listWishlist(authUser.id);
    if (!items) return notAuthenticated();

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("List wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Could not load your wishlist" },
      { status: 500 },
    );
  }
}

// Saves a product for the signed-in customer. Body: { productId }
export async function POST(request) {
  const authUser = getAuthUser(request);
  if (!authUser) return notAuthenticated();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request" },
      { status: 400 },
    );
  }

  const productId = body?.productId;
  if (!isValidProductId(productId)) {
    return NextResponse.json(
      { success: false, message: "Invalid product" },
      { status: 400 },
    );
  }

  try {
    await connectMongodb();

    const result = await addToWishlist(authUser.id, productId);

    if (result === "noUser") return notAuthenticated();
    if (result === "notFound") {
      return NextResponse.json(
        { success: false, message: "This product is no longer available" },
        { status: 404 },
      );
    }
    if (result === "full") {
      return NextResponse.json(
        {
          success: false,
          message: `Your wishlist can hold up to ${MAX_WISHLIST} products. Remove one to save another.`,
        },
        { status: 409 },
      );
    }

    const items = await listWishlist(authUser.id);

    return NextResponse.json(
      {
        success: true,
        message: result === "added" ? "Saved to your wishlist" : "Already in your wishlist",
        items,
      },
      { status: result === "added" ? 201 : 200 },
    );
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Could not save this product" },
      { status: 500 },
    );
  }
}
