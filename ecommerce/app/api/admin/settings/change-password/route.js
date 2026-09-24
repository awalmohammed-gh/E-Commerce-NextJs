import { NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/adminAuth";
import {
  issueAdminSession,
  setAdminPassword,
  verifyAdminPassword,
} from "@/lib/adminSession";

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

const badRequest = (message, field) =>
  NextResponse.json(
    { success: false, message, errors: field ? { [field]: message } : undefined },
    { status: 400 },
  );

export async function POST(request) {
  const { admin, error } = await requireAdmin(request);
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Request body must be valid JSON");
  }

  const { currentPassword, newPassword, confirmPassword } = body || {};

  if (typeof currentPassword !== "string" || !currentPassword) {
    return badRequest("Current password is required", "currentPassword");
  }
  if (typeof newPassword !== "string" || !newPassword) {
    return badRequest("New password is required", "newPassword");
  }
  if (newPassword.length < MIN_LENGTH) {
    return badRequest(
      `New password must be at least ${MIN_LENGTH} characters`,
      "newPassword",
    );
  }
  if (newPassword.length > MAX_LENGTH) {
    return badRequest(
      `New password must be at most ${MAX_LENGTH} characters`,
      "newPassword",
    );
  }
  if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return badRequest(
      "New password must contain at least one letter and one number",
      "newPassword",
    );
  }
  if (newPassword !== confirmPassword) {
    return badRequest("Passwords do not match", "confirmPassword");
  }
  if (newPassword === currentPassword) {
    return badRequest(
      "New password must be different from the current password",
      "newPassword",
    );
  }

  try {
    // 400 rather than 401: the session is valid, only the input is wrong
    if (!(await verifyAdminPassword(admin.email, currentPassword))) {
      return badRequest("Current password is incorrect", "currentPassword");
    }

    const sessionVersion = await setAdminPassword(admin.email, newPassword);

    const response = NextResponse.json(
      {
        success: true,
        message: "Password changed. Other devices have been signed out.",
      },
      { status: 200 },
    );

    // Keep this device signed in with a token for the new session version
    await issueAdminSession(response, { email: admin.email, sessionVersion });

    return response;
  } catch (error) {
    console.error("Change admin password error:", error);

    return NextResponse.json(
      { success: false, message: "Could not change password" },
      { status: 500 },
    );
  }
}
