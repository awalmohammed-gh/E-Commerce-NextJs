import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import { getAuthUser } from "@/middleware/auth";
import { Checkout } from "@/models/Checkout";
import { findCartProducts, normalizeCart } from "@/lib/cart";

export const dynamic = "force-dynamic";

// Line items for orders placed before lineItems snapshots existed
function legacyLines(order, products) {
  return Object.entries(normalizeCart(order.items)).flatMap(([productId, sizes]) =>
    Object.entries(sizes).map(([size, quantity]) => {
      const product = products.get(productId);
      return {
        productId,
        name: product?.name || "Product no longer available",
        image: product?.images?.[0] || null,
        size,
        quantity,
        // The price paid wasn't recorded for these orders
        unitPrice: null,
        lineTotal: null,
      };
    }),
  );
}

// The signed-in customer's own orders only
export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    await connectMongodb();

    const orders = await Checkout.find({ user: authUser.id })
      .sort({ createdAt: -1 })
      .select("-user")
      .lean();

    const legacyIds = orders
      .filter((o) => !o.lineItems?.length)
      .flatMap((o) => Object.keys(o.items || {}));
    const products = await findCartProducts([...new Set(legacyIds)]);

    const result = orders.map((order) => ({
      _id: String(order._id),
      createdAt: order.createdAt,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod,
      payment: order.payment,
      address: order.address,
      subtotal: order.subtotal ?? null,
      deliveryFee: order.deliveryFee ?? null,
      totalAmount: order.totalAmount,
      lines: order.lineItems?.length
        ? order.lineItems.map((line) => ({
            ...line,
            productId: String(line.product),
            product: undefined,
          }))
        : legacyLines(order, products),
    }));

    return NextResponse.json({ success: true, orders: result });
  } catch (error) {
    console.error("Get my orders error:", error);

    return NextResponse.json(
      { success: false, message: "Could not load your orders" },
      { status: 500 },
    );
  }
}
