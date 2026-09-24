import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import {
  ADMIN_COOKIE,
  getAdminSessionVersion,
  getConfiguredAdminEmail,
} from "@/lib/adminSession";

const SESSION_EXPIRED = "Session expired. Please sign in again.";

/*
  Verifies the admin cookie:
  1. token present and signed with JWT_KEY
  2. role is admin
  3. email is still the configured ADMIN_EMAIL
  4. sessionVersion matches (not revoked by a password change / sign-out)
*/
async function verifyAdminRequest(request) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;

  if (!token) return { status: 401, message: "Unauthorized" };

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    // Expired, tampered, or signed with another key
    return { status: 401, message: SESSION_EXPIRED };
  }

  if (decoded.role !== "admin") return { status: 403, message: "Forbidden" };

  const email = String(decoded.email || "").toLowerCase();
  if (!email || email !== getConfiguredAdminEmail()) {
    return { status: 401, message: SESSION_EXPIRED };
  }

  await connectMongodb();
  const sessionVersion = await getAdminSessionVersion(email);

  if ((decoded.sv ?? 0) !== sessionVersion) {
    return { status: 401, message: SESSION_EXPIRED };
  }

  return { status: 200, admin: { email, role: "admin", sessionVersion } };
}

export async function getAdminAuth(request) {
  try {
    const { admin } = await verifyAdminRequest(request);
    return admin || null;
  } catch (error) {
    return null;
  }
}

/* ------------------------------------------------------------------
   Guard for admin API routes.
   Returns { admin } when the request carries a valid admin token,
   otherwise { error } holding a ready-to-return 401/403/500 response.

   Usage:
     const { admin, error } = await requireAdmin(request);
     if (error) return error;
------------------------------------------------------------------ */
export async function requireAdmin(request) {
  try {
    const { status, admin, message } = await verifyAdminRequest(request);

    if (admin) return { admin };

    return {
      error: NextResponse.json({ success: false, message }, { status }),
    };
  } catch (error) {
    console.error("Admin auth error:", error);

    return {
      error: NextResponse.json(
        { success: false, message: "Could not verify admin session" },
        { status: 500 },
      ),
    };
  }
}
