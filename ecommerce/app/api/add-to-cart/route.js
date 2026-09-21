import { connectMongodb } from "@/lib/mongodb";
import { getAuthUser } from "@/middleware/auth";
import { Users } from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectMongodb();

    const authUser = getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const { itemId, size} = body;

    if (!itemId || !size) {
      return NextResponse.json(
        {
          success: false,
          message: "Item and size are required",
        },
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

    const cartData = user.cartData || {};

    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }

    cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;

    user.cartData = cartData;
    user.markModified("cartData");
    await user.save();
   console.log("Saved cart:", user.toObject().cartData);

    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      cartData: user.cartData,
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
