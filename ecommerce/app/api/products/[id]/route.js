import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import { getPublicProduct, isValidProductId } from "@/lib/products";

export const dynamic = "force-dynamic";

const notFound = () =>
  NextResponse.json(
    { success: false, message: "Product not found" },
    { status: 404 },
  );

export async function GET(request, { params }) {
  const { id } = await params;

  // Malformed IDs can never match a product
  if (!isValidProductId(id)) return notFound();

  try {
    await connectMongodb();

    const product = await getPublicProduct(id);
    if (!product) return notFound();

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error("Get product error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load product" },
      { status: 500 },
    );
  }
}
