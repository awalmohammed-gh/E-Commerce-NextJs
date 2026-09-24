import { NextResponse } from "next/server";
import { getAdminAuth } from "@/middleware/adminAuth";
import { connectMongodb } from "@/lib/mongodb";
import {
  getAdminSessionVersion,
  getConfiguredAdminEmail,
  issueAdminSession,
  verifyAdminPassword,
} from "@/lib/adminSession";

export async function POST(request) {
  try {
  const formData = await request.formData();

  const email = String(formData.get("email") || "").trim().toLowerCase();
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

  const adminEmail = getConfiguredAdminEmail();

  if (!adminEmail || !process.env.JWT_KEY) {
    console.error("Admin login error: ADMIN_EMAIL or JWT_KEY is not set");
    return NextResponse.json(
      { success: false, message: "Admin login is not configured" },
      { status: 500 },
    );
  }

  await connectMongodb();

  // Password is checked against the MongoDB hash once it has been
  // changed from Settings, otherwise against ADMIN_PSD
  if (email !== adminEmail || !(await verifyAdminPassword(email, password))) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid email or password",
      },
      { status: 401 },
    );
  }

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Admin login successful",
      },
      { status: 200 },
    );

    // Sign JWT and set the adminToken cookie
    await issueAdminSession(response, {
      email,
      sessionVersion: await getAdminSessionVersion(email),
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