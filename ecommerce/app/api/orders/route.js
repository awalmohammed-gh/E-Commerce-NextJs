import { connectMongodb } from "@/lib/mongodb";
import { getAuthUser } from "@/middleware/auth";
import { Checkout } from "@/models/Checkout";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectMongodb();

    const authUser = getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const orders = await Checkout.find({ user: authUser.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return NextResponse.json(
      { success: false, message: "Could not get orders" },
      { status: 500 },
    );
  }
}
