import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import { requireAdmin } from "@/middleware/adminAuth";
import { uploadImageBuffer } from "@/lib/cloudinary";
import { updateSettings } from "@/lib/settings";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
// SVG is excluded: it can carry scripts
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

// Uploads a new logo to Cloudinary and saves its URL to settings
export async function POST(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("logo");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { success: false, message: "Choose an image to upload" },
        { status: 400 },
      );
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Logo must be a PNG, JPG or WebP image" },
        { status: 400 },
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "Logo must be 2 MB or smaller" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImageBuffer(buffer, { folder: "eleoka/branding" });

    await connectMongodb();
    const settings = await updateSettings({
      general: { logo: result.secure_url },
    });

    return NextResponse.json(
      { success: true, message: "Logo updated", data: { settings } },
      { status: 200 },
    );
  } catch (error) {
    console.error("Logo upload error:", error);

    return NextResponse.json(
      { success: false, message: "Could not upload logo" },
      { status: 500 },
    );
  }
}
