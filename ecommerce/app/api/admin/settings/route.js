import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectMongodb } from "@/lib/mongodb";
import { requireAdmin } from "@/middleware/adminAuth";
import {
  getSettings,
  updateSettings,
  SettingsValidationError,
  STORE_SETTINGS_TAG,
} from "@/lib/settings";
import { getAdminSecurityInfo } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

// Current settings + non-secret admin account info
export async function GET(request) {
  const { admin, error } = await requireAdmin(request);
  if (error) return error;

  try {
    await connectMongodb();

    const [settings, adminInfo] = await Promise.all([
      getSettings(),
      getAdminSecurityInfo(admin.email),
    ]);

    return NextResponse.json(
      { success: true, data: { settings, admin: adminInfo } },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get settings error:", error);

    return NextResponse.json(
      { success: false, message: "Could not load settings" },
      { status: 500 },
    );
  }
}

// Partial update: body is { [section]: { [field]: value } }
export async function PUT(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  try {
    await connectMongodb();

    const settings = await updateSettings(body);

    // Storefront pages show settings (delivery fee, contact details, payment
    // methods) from a cache; expire it now so customers see the change at once
    revalidateTag(STORE_SETTINGS_TAG, { expire: 0 });

    return NextResponse.json(
      {
        success: true,
        message: "Settings updated successfully",
        data: { settings },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof SettingsValidationError) {
      return NextResponse.json(
        { success: false, message: error.message, errors: error.errors },
        { status: 400 },
      );
    }

    console.error("Update settings error:", error);

    return NextResponse.json(
      { success: false, message: "Could not update settings" },
      { status: 500 },
    );
  }
}

export { PUT as PATCH };
