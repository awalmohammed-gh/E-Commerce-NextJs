import { connectMongodb } from "@/lib/mongodb";
import { Checkout } from "@/models/Checkout";
import { getAuthUser } from "@/middleware/auth";
import { NextResponse } from "next/server";
import { Users } from "@/models/User";
import {
  normalizeCart,
  priceCart,
  releaseStock,
  reserveStock,
} from "@/lib/cart";
import { findUserAddress } from "@/lib/addresses";

const ALLOWED_PAYMENT_METHODS = ["Cash On Delivery", "Mobile Money", "Card"];

/*
  Places an order from the user's saved cart.
  The client sends only { addressId, paymentMethod }: the address must
  be one of the user's saved addresses, items come from the cart in
  MongoDB, and every price, stock level and total is worked out here.
  The delivery address is copied onto the order, so later edits or
  deletes of the saved address never change past orders.
*/
export async function POST(request) {
  try {
    await connectMongodb();

    // 1. Check if user is logged in
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    // 2. Validate address and payment method
    const body = await request.json();
    const { paymentMethod, addressId } = body;

    // Only an address the signed-in user owns can be used
    const savedAddress = await findUserAddress(authUser.id, addressId);

    if (!savedAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "Please choose one of your saved delivery addresses",
        },
        { status: 400 },
      );
    }

    const { _id: _addressId, isDefault: _isDefault, ...address } = savedAddress;

    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid payment method. Allowed: ${ALLOWED_PAYMENT_METHODS.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // 3. Load the cart and price it from the database
    const user = await Users.findById(authUser.id).select("cartData");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const cartData = normalizeCart(user.cartData);
    const cart = await priceCart(cartData);

    if (cart.itemCount === 0) {
      return NextResponse.json(
        { success: false, message: "Your cart is empty" },
        { status: 400 },
      );
    }

    if (cart.issues.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Some items in your cart need attention before checkout",
          issues: cart.issues,
          cart,
        },
        { status: 409 },
      );
    }

    // 4. Take stock atomically (fails if someone else bought it first)
    const quantities = {};
    for (const item of cart.items) {
      quantities[item.productId] = (quantities[item.productId] || 0) + item.quantity;
    }

    const reservation = await reserveStock(quantities);
    if (!reservation.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "An item in your cart just sold out. Please review your cart.",
          cart: await priceCart(cartData),
        },
        { status: 409 },
      );
    }

    // 5. Create the order with server-calculated totals
    let checkout;
    try {
      checkout = await Checkout.create({
        user: authUser.id,
        items: cartData,
        lineItems: cart.items.map((item) => ({
          product: item.productId,
          name: item.name,
          image: item.image,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
        subtotal: cart.subtotal,
        deliveryFee: cart.deliveryFee,
        totalAmount: cart.total,
        address,
        paymentMethod,
        payment: paymentMethod !== "Cash On Delivery",
      });
    } catch (error) {
      await releaseStock(quantities);
      throw error;
    }

    await Users.findByIdAndUpdate(authUser.id, { cartData: {} });

    // 6. Return successful response
    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        orderId: String(checkout._id),
        totalAmount: checkout.totalAmount,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
