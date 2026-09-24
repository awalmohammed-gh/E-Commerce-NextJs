import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import { requireAdmin } from "@/middleware/adminAuth";
import { getDashboardOverview } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    await connectMongodb();

    const data = await getDashboardOverview();

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Dashboard overview error:", error);

    return NextResponse.json(
      { success: false, message: "Could not load dashboard data" },
      { status: 500 },
    );
  }
}
