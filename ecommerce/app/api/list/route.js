import { connectMongodb } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { requireAdmin } from "@/middleware/adminAuth";
import { NextResponse } from "next/server";

// Admin product list (all fields). The storefront uses /api/products.
export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    await connectMongodb();

    const list = await Product.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        list,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 },
    );
  }
}

//function to delete a product
export async function DELETE(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    await connectMongodb();

    const { id } = await request.json();

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product",
      },
      { status: 500 },
    );
  }
}
