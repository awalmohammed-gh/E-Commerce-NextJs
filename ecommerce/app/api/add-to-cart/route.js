import { connectMongodb } from "@/lib/mongodb";
import { getAuthUser } from "@/middleware/auth";
import { Users } from "@/models/User";
import { Product } from "@/models/Product";
import { isValidProductId } from "@/lib/products";
import {
  MAX_QUANTITY_PER_LINE,
  isValidSize,
  normalizeCart,
  priceCart,
  productQuantityInCart,
} from "@/lib/cart";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectMongodb();

    const authUser = getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Please sign in to add items to your cart",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const { itemId, size } = body;
    const quantity = body.quantity === undefined ? 1 : Number(body.quantity);

    if (!itemId || !size || typeof size !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Item and size are required",
        },
        { status: 400 },
      );
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      return NextResponse.json(
        { success: false, message: "Quantity must be a whole number from 1 to 99" },
        { status: 400 },
      );
    }

    // Product, size and stock always come from the database
    const product = isValidProductId(itemId)
      ? await Product.findById(itemId).select("sizes stock").lean()
      : null;

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    if (!isValidSize(product, size)) {
      return NextResponse.json(
        { success: false, message: "Please choose an available size" },
        { status: 400 },
      );
    }

    const user = await Users.findById(authUser.id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    const cartData = normalizeCart(user.cartData);
    const stock = Math.max(0, Number(product.stock) || 0);
    const alreadyInCart = productQuantityInCart(cartData, itemId);

    if (stock === 0) {
      return NextResponse.json(
        { success: false, message: "This product is out of stock" },
        { status: 409 },
      );
    }

    if (alreadyInCart + quantity > stock) {
      const remaining = Math.max(0, stock - alreadyInCart);
      return NextResponse.json(
        {
          success: false,
          message:
            remaining > 0
              ? `Only ${remaining} more can be added (${stock} in stock)`
              : `You already have all ${stock} available in your cart`,
        },
        { status: 409 },
      );
    }

    cartData[itemId] ||= {};
    cartData[itemId][size] = (cartData[itemId][size] || 0) + quantity;

    user.cartData = cartData;
    user.markModified("cartData");
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      cartData,
      cart: await priceCart(cartData),
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
