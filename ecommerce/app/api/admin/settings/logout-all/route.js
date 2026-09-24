import { NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/adminAuth";
import { issueAdminSession, revokeAdminSessions } from "@/lib/adminSession";

// Invalidates every admin token except a fresh one issued to this device
export async function POST(request) {
  const { admin, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const sessionVersion = await revokeAdminSessions(admin.email);

    const response = NextResponse.json(
      { success: true, message: "Signed out of all other sessions" },
      { status: 200 },
    );

    await issueAdminSession(response, { email: admin.email, sessionVersion });

    return response;
  } catch (error) {
    console.error("Revoke admin sessions error:", error);

    return NextResponse.json(
      { success: false, message: "Could not sign out other sessions" },
      { status: 500 },
    );
  }
}
