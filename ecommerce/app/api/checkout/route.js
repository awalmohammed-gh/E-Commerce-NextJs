import { connectMongodb } from "@/lib/mongodb";
import { Checkout } from "@/models/Checkout";
import { getAuthUser } from "@/middleware/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectMongodb();

    // 1. Check if user is logged in
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

    // 2. Get checkout data from request
    const body = await request.json();

    const { items, address, paymentMethod } = body;

    // 3. Validate required fields
    if (!items || !address || !paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          message: "Items, address and payment method are required",
        },
        { status: 400 },
      );
    }

    // 4. Create checkout/order
    const checkout = await Checkout.create({
      user: authUser.id,
      items,
      address,
      paymentMethod:"Cash On Delivery",
      payment:false
    });

    // 5. Return successful response
    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        checkout,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Checkout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
