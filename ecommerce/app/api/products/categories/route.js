import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import { listCategories } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongodb();

    const categories = await listCategories();

    return NextResponse.json({ success: true, categories }, { status: 200 });
  } catch (error) {
    console.error("List categories error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load categories" },
      { status: 500 },
    );
  }
}
