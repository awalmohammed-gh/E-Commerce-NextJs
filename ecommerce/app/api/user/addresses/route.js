import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import { getAuthUser } from "@/middleware/auth";
import {
  MAX_ADDRESSES,
  createAddress,
  listAddresses,
  validateAddress,
} from "@/lib/addresses";

export const dynamic = "force-dynamic";

const notAuthenticated = () =>
  NextResponse.json(
    { success: false, message: "Please sign in to manage your addresses" },
    { status: 401 },
  );

// The signed-in customer's saved addresses (default first)
export async function GET(request) {
  const authUser = getAuthUser(request);
  if (!authUser) return notAuthenticated();

  try {
    await connectMongodb();

    const addresses = await listAddresses(authUser.id);
    if (!addresses) return notAuthenticated();

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("List addresses error:", error);
    return NextResponse.json(
      { success: false, message: "Could not load your addresses" },
      { status: 500 },
    );
  }
}

// Adds an address for the signed-in customer (owner comes from the session)
export async function POST(request) {
  const authUser = getAuthUser(request);
  if (!authUser) return notAuthenticated();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request" },
      { status: 400 },
    );
  }

  const { value, errors } = validateAddress(body);
  if (errors) {
    return NextResponse.json(
      { success: false, message: Object.values(errors)[0], errors },
      { status: 400 },
    );
  }

  try {
    await connectMongodb();

    const addressId = await createAddress(authUser.id, value, body.isDefault === true);

    if (!addressId) {
      return NextResponse.json(
        {
          success: false,
          message: `You can save up to ${MAX_ADDRESSES} addresses. Remove one to add another.`,
        },
        { status: 409 },
      );
    }

    const addresses = await listAddresses(authUser.id);

    return NextResponse.json(
      {
        success: true,
        message: "Address added",
        address: addresses.find((a) => a._id === addressId),
        addresses,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create address error:", error);
    return NextResponse.json(
      { success: false, message: "Could not save address" },
      { status: 500 },
    );
  }
}
