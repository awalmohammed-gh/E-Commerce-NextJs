import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import { requireAdmin } from "@/middleware/adminAuth";
import { getRevenueSeries, REVENUE_PERIODS } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const period = request.nextUrl.searchParams.get("period") || "7d";

  if (!Object.hasOwn(REVENUE_PERIODS, period)) {
    return NextResponse.json(
      {
        success: false,
        message: `Invalid period. Use one of: ${Object.keys(REVENUE_PERIODS).join(", ")}`,
      },
      { status: 400 },
    );
  }

  try {
    await connectMongodb();

    const data = await getRevenueSeries(period);

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Dashboard revenue error:", error);

    return NextResponse.json(
      { success: false, message: "Could not load revenue data" },
      { status: 500 },
    );
  }
}
