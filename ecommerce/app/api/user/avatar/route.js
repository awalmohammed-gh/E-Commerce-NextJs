import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import { getAuthUser } from "@/middleware/auth";
import { uploadImageBuffer } from "@/lib/cloudinary";
import { setProfileImage } from "@/lib/accountSettings";

export const dynamic = "force-dynamic";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
// SVG is excluded: it can carry scripts
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const notAuthenticated = () =>
  NextResponse.json(
    { success: false, message: "Please sign in to update your photo" },
    { status: 401 },
  );

// Uploads a profile photo to Cloudinary and saves its URL on the user
export async function POST(request) {
  const authUser = getAuthUser(request);
  if (!authUser) return notAuthenticated();

  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { success: false, message: "Choose an image to upload" },
        { status: 400 },
      );
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Photo must be a PNG, JPG or WebP image" },
        { status: 400 },
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "Photo must be 2 MB or smaller" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImageBuffer(buffer, {
      folder: "eleoka/avatars",
      transformation: [{ width: 256, height: 256, crop: "fill", gravity: "face" }],
    });

    await connectMongodb();
    const settings = await setProfileImage(authUser.id, result.secure_url);
    if (!settings) return notAuthenticated();

    return NextResponse.json({ success: true, message: "Profile photo updated", settings });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { success: false, message: "Could not upload your photo" },
      { status: 500 },
    );
  }
}

// Removes the profile photo (the initial-letter avatar is shown instead)
export async function DELETE(request) {
  const authUser = getAuthUser(request);
  if (!authUser) return notAuthenticated();

  try {
    await connectMongodb();
    const settings = await setProfileImage(authUser.id, "");
    if (!settings) return notAuthenticated();

    return NextResponse.json({ success: true, message: "Profile photo removed", settings });
  } catch (error) {
    console.error("Avatar remove error:", error);
    return NextResponse.json(
      { success: false, message: "Could not remove your photo" },
      { status: 500 },
    );
  }
}
