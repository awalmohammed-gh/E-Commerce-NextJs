import { connectMongodb } from "@/lib/mongodb";
import { Checkout } from "@/models/Checkout";
import { getAuthUser } from "@/middleware/auth";
import { NextResponse } from "next/server";
import { Users } from "@/models/User";

const ALLOWED_PAYMENT_METHODS = ["Cash On Delivery", "Mobile Money", "Card"];

export async function POST(request) {
  try {
    await connectMongodb();

    // 1. Check if user is logged in
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    // 2. Get checkout data from request
    const body = await request.json();
    const { items, address, paymentMethod,totalAmount } = body;

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

    // 4. Validate payment method against enum
    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid payment method. Allowed: ${ALLOWED_PAYMENT_METHODS.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // 5. Create checkout/order
    const checkout = await Checkout.create({
      user: authUser.id,
      items,
      address,
      paymentMethod, // from client, validated
      payment: paymentMethod !== "Cash On Delivery",
      totalAmount
      
    });

    await Users.findByIdAndUpdate(authUser.id, { cartData: {} });

    // 6. Return successful response
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
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
