import { connectMongodb } from "@/lib/mongodb";
import { Checkout } from "@/models/Checkout";
import { requireAdmin } from "@/middleware/adminAuth";
import { NextResponse } from "next/server";

// Admin only: every customer's orders. Customers use /api/my-orders.
export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    await connectMongodb();

    const orders = await Checkout.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return NextResponse.json(
      { success: false, message: "Could not get orders" },
      { status: 500 },
    );
  }
}

//delete order
export async function DELETE(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    await connectMongodb();

    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 },
      );
    }

    const order = await Checkout.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);

    return NextResponse.json(
      { success: false, message: "Could not delete order" },
      { status: 500 },
    );
  }
}

// change order status

export async function PATCH(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    await connectMongodb();

    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { orderStatus, payment } = body;

    const allowedStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

    // Validate order status if provided
    if (orderStatus && !allowedStatuses.includes(orderStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order status",
        },
        { status: 400 },
      );
    }

    // Validate payment if provided
    if (payment !== undefined && typeof payment !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "Payment status must be true or false",
        },
        { status: 400 },
      );
    }

    const updates = {};

    if (orderStatus !== undefined) {
      updates.orderStatus = orderStatus;
    }

    if (payment !== undefined) {
      updates.payment = payment;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Nothing to update",
        },
        { status: 400 },
      );
    }

    const order = await Checkout.findByIdAndUpdate(id, updates, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order error:", error);

    return NextResponse.json(
      { success: false, message: "Could not update order" },
      { status: 500 },
    );
  }
}