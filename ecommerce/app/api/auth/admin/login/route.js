import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getAdminAuth } from "@/middleware/adminAuth";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 },
      );
    }

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PSD
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    // Create JWT
    const token = jwt.sign(
      {
        email,
        role: "admin",
      },
      process.env.JWT_KEY,
      {
        expiresIn: "1d",
      },
    );

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Admin login successful",
      },
      { status: 200 },
    );

    // Set cookie
    response.cookies.set("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}


export async function GET(request) {
  try {
    const admin = await getAdminAuth(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // Admin is authenticated
    return NextResponse.json({
      success: true,
      message: "Admin authenticated",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}