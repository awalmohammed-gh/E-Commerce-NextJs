import { connectMongodb } from "@/lib/mongodb";
import { Users } from "@/models/User";
import { getAuthUser } from "@/middleware/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
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

    const user = await Users.findById(authUser.id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Authenticated",
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("is-me error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Authentication failed",
      },
      { status: 500 },
    );
  }
}
