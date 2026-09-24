import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import { getAuthUser } from "@/middleware/auth";
import {
  getAccountSettings,
  updateAccountSettings,
  validateSettingsUpdate,
} from "@/lib/accountSettings";

export const dynamic = "force-dynamic";

const notAuthenticated = () =>
  NextResponse.json(
    { success: false, message: "Please sign in to manage your settings" },
    { status: 401 },
  );

// The signed-in customer's profile and preferences (no sensitive fields)
export async function GET(request) {
  const authUser = getAuthUser(request);
  if (!authUser) return notAuthenticated();

  try {
    await connectMongodb();

    const settings = await getAccountSettings(authUser.id);
    if (!settings) return notAuthenticated();

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Get account settings error:", error);
    return NextResponse.json(
      { success: false, message: "Could not load your settings" },
      { status: 500 },
    );
  }
}

// Updates allowed fields only: profile.fullName, profile.phone, notifications.*
export async function PATCH(request) {
  const authUser = getAuthUser(request);
  if (!authUser) return notAuthenticated();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request" },
      { status: 400 },
    );
  }

  const { update, errors } = validateSettingsUpdate(body);
  if (errors) {
    return NextResponse.json(
      { success: false, message: Object.values(errors)[0], errors },
      { status: 400 },
    );
  }

  try {
    await connectMongodb();

    const settings = await updateAccountSettings(authUser.id, update);
    if (!settings) return notAuthenticated();

    return NextResponse.json({ success: true, message: "Settings saved", settings });
  } catch (error) {
    console.error("Update account settings error:", error);
    return NextResponse.json(
      { success: false, message: "Could not save your settings" },
      { status: 500 },
    );
  }
}
