import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import { getAuthUser } from "@/middleware/auth";
import {
  deleteAddress,
  listAddresses,
  updateAddress,
  validateAddress,
} from "@/lib/addresses";

export const dynamic = "force-dynamic";

const notAuthenticated = () =>
  NextResponse.json(
    { success: false, message: "Please sign in to manage your addresses" },
    { status: 401 },
  );

// Same response whether the address doesn't exist or belongs to someone else
const notFound = () =>
  NextResponse.json(
    { success: false, message: "Address not found" },
    { status: 404 },
  );

// Updates one of the signed-in customer's addresses
export async function PUT(request, { params }) {
  const authUser = getAuthUser(request);
  if (!authUser) return notAuthenticated();

  const { id } = await params;

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

    const updated = await updateAddress(authUser.id, id, value, body.isDefault === true);
    if (!updated) return notFound();

    const addresses = await listAddresses(authUser.id);

    return NextResponse.json({
      success: true,
      message: "Address updated",
      address: addresses.find((a) => a._id === id),
      addresses,
    });
  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json(
      { success: false, message: "Could not update address" },
      { status: 500 },
    );
  }
}

// Deletes one of the signed-in customer's addresses; reassigns the default if needed
export async function DELETE(request, { params }) {
  const authUser = getAuthUser(request);
  if (!authUser) return notAuthenticated();

  const { id } = await params;

  try {
    await connectMongodb();

    const deleted = await deleteAddress(authUser.id, id);
    if (!deleted) return notFound();

    return NextResponse.json({
      success: true,
      message: "Address removed",
      addresses: await listAddresses(authUser.id),
    });
  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json(
      { success: false, message: "Could not delete address" },
      { status: 500 },
    );
  }
}
