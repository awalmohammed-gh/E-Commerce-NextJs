import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import { listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

// Public storefront listing: filtering, search, sorting and pagination run in MongoDB
export async function GET(request) {
  try {
    await connectMongodb();

    const { products, pagination, sort } = await listProducts(
      request.nextUrl.searchParams,
    );

    return NextResponse.json(
      { success: true, products, pagination, sort },
      { status: 200 },
    );
  } catch (error) {
    console.error("List products error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load products" },
      { status: 500 },
    );
  }
}
