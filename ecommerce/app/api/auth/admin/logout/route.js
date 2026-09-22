import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: "Admin logged out successfully",
      },
      { status: 200 },
    );

    response.cookies.set("adminToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
      },
      { status: 500 },
    );
  }
}
