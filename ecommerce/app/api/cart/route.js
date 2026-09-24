import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import { getAuthUser } from "@/middleware/auth";
import { Users } from "@/models/User";
import { Product } from "@/models/Product";
import { isValidProductId } from "@/lib/products";
import {
  MAX_QUANTITY_PER_LINE,
  normalizeCart,
  priceCart,
  productQuantityInCart,
} from "@/lib/cart";

export const dynamic = "force-dynamic";

const notAuthenticated = () =>
  NextResponse.json(
    { success: false, message: "Not authenticated" },
    { status: 401 },
  );

// The user's cart, priced from current product data
export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return notAuthenticated();

    await connectMongodb();

    const user = await Users.findById(authUser.id).select("cartData").lean();
    if (!user) return notAuthenticated();

    const cartData = normalizeCart(user.cartData);

    return NextResponse.json({
      success: true,
      cartData,
      cart: await priceCart(cartData),
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return NextResponse.json(
      { success: false, message: "Could not load cart" },
      { status: 500 },
    );
  }
}

/*
  Sets the quantity of one cart line. quantity 0 removes it.
  Body: { itemId, size, quantity }
*/
export async function PATCH(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return notAuthenticated();

    const { itemId, size, quantity: rawQuantity } = await request.json();
    const quantity = Number(rawQuantity);

    if (!itemId || typeof itemId !== "string" || !size || typeof size !== "string") {
      return NextResponse.json(
        { success: false, message: "Item and size are required" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY_PER_LINE) {
      return NextResponse.json(
        { success: false, message: "Quantity must be a whole number from 0 to 99" },
        { status: 400 },
      );
    }

    await connectMongodb();

    const user = await Users.findById(authUser.id);
    if (!user) return notAuthenticated();

    const cartData = normalizeCart(user.cartData);
    const current = cartData[itemId]?.[size] || 0;

    // Increasing needs a stock check; decreasing/removing never does
    if (quantity > current) {
      const product = isValidProductId(itemId)
        ? await Product.findById(itemId).select("stock").lean()
        : null;

      if (!product) {
        return NextResponse.json(
          { success: false, message: "This product is no longer available" },
          { status: 404 },
        );
      }

      const stock = Math.max(0, Number(product.stock) || 0);
      const otherSizes = productQuantityInCart(cartData, itemId) - current;

      if (otherSizes + quantity > stock) {
        return NextResponse.json(
          {
            success: false,
            message:
              stock === 0
                ? "This product is out of stock"
                : `Only ${stock} in stock`,
          },
          { status: 409 },
        );
      }
    }

    if (quantity === 0) {
      if (cartData[itemId]) {
        delete cartData[itemId][size];
        if (Object.keys(cartData[itemId]).length === 0) delete cartData[itemId];
      }
    } else {
      cartData[itemId] ||= {};
      cartData[itemId][size] = quantity;
    }

    user.cartData = cartData;
    user.markModified("cartData");
    await user.save();

    return NextResponse.json({
      success: true,
      message: quantity === 0 ? "Item removed" : "Cart updated",
      cartData,
      cart: await priceCart(cartData),
    });
  } catch (error) {
    console.error("Update cart error:", error);

    return NextResponse.json(
      { success: false, message: "Could not update cart" },
      { status: 500 },
    );
  }
}
