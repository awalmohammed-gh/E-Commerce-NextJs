import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import { getAuthUser } from "@/middleware/auth";
import { changePassword, validateNewPassword } from "@/lib/accountSettings";

export const dynamic = "force-dynamic";

// Body: { currentPassword, newPassword, confirmPassword }
export async function POST(request) {
  const authUser = getAuthUser(request);
  if (!authUser) {
    return NextResponse.json(
      { success: false, message: "Please sign in to change your password" },
      { status: 401 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request" },
      { status: 400 },
    );
  }

  const invalid = validateNewPassword(body || {});
  if (invalid) {
    return NextResponse.json({ success: false, message: invalid }, { status: 400 });
  }

  try {
    await connectMongodb();

    const result = await changePassword(authUser.id, body.currentPassword, body.newPassword);

    if (result === "noUser") {
      return NextResponse.json(
        { success: false, message: "Please sign in to change your password" },
        { status: 401 },
      );
    }
    if (result === "wrongPassword") {
      return NextResponse.json(
        {
          success: false,
          message: "Your current password is incorrect",
          errors: { currentPassword: "Your current password is incorrect" },
        },
        { status: 400 },
      );
    }
    if (result === "changed") {
      return NextResponse.json(
        { success: false, message: "Your password was just changed. Please try again." },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true, message: "Password updated" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, message: "Could not change your password" },
      { status: 500 },
    );
  }
}
