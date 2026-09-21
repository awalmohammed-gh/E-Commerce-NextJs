import { connectMongodb } from "@/lib/mongodb";
import { getAuthUser } from "@/middleware/auth";
import { Users } from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectMongodb();

    const authUser = getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await Users.findById(authUser.id);
    console.log(user);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      cartData: user.cartData || {},
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}