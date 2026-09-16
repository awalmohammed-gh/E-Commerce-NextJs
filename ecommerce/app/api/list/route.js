import { connectMongodb } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongodb();

    const list = await Product.find({});

    if (list.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No products found",
        },
        { status: 404 },
      );
    }

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