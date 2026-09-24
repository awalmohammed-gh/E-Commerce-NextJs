import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import { getAuthUser } from "@/middleware/auth";
import { listAddresses, setDefaultAddress } from "@/lib/addresses";

export const dynamic = "force-dynamic";

// Makes one of the signed-in customer's addresses their default
export async function PATCH(request, { params }) {
  const authUser = getAuthUser(request);
  if (!authUser) {
    return NextResponse.json(
      { success: false, message: "Please sign in to manage your addresses" },
      { status: 401 },
    );
  }

  const { id } = await params;

  try {
    await connectMongodb();

    const updated = await setDefaultAddress(authUser.id, id);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Default address updated",
      addresses: await listAddresses(authUser.id),
    });
  } catch (error) {
    console.error("Set default address error:", error);
    return NextResponse.json(
      { success: false, message: "Could not update default address" },
      { status: 500 },
    );
  }
}
