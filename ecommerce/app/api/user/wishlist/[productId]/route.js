import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import { getAuthUser } from "@/middleware/auth";
import { isValidProductId } from "@/lib/products";
import { listWishlist, removeFromWishlist } from "@/lib/wishlist";

export const dynamic = "force-dynamic";

const notAuthenticated = () =>
  NextResponse.json(
    { success: false, message: "Please sign in to use your wishlist" },
    { status: 401 },
  );

// Removes a product from the signed-in customer's wishlist
export async function DELETE(request, { params }) {
  const authUser = getAuthUser(request);
  if (!authUser) return notAuthenticated();

  const { productId } = await params;
  if (!isValidProductId(productId)) {
    return NextResponse.json(
      { success: false, message: "Invalid product" },
      { status: 400 },
    );
  }

  try {
    await connectMongodb();

    const found = await removeFromWishlist(authUser.id, productId);
    if (!found) return notAuthenticated();

    const items = await listWishlist(authUser.id);

    return NextResponse.json({
      success: true,
      message: "Removed from your wishlist",
      items,
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Could not remove this product" },
      { status: 500 },
    );
  }
}
