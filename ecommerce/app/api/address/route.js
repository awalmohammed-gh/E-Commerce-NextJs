import { connectMongodb } from "@/lib/mongodb";
import { getAuthUser } from "@/middleware/auth";
import { Users } from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectMongodb();

    const authUser = getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const {
      fullName,
      phone,
      address,
      city,
      region,
      country,
      postalCode,
      isDefault,
    } = await request.json();

    if (!fullName || !phone || !address || !city) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name, phone, address, and city are required",
        },
        { status: 400 },
      );
    }

    const user = await Users.findById(authUser.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // A user can have only one default address.
    if (isDefault) {
      user.addresses.forEach((item) => {
        item.isDefault = false;
      });
    }

    const newAddress = {
      fullName,
      phone,
      address,
      city,
      region: region || "",
      country: country || "Ghana",
      postalCode: postalCode || "",
      isDefault: Boolean(isDefault) || user.addresses.length === 0,
    };

    user.addresses.push(newAddress);

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Address added successfully",
        address: user.addresses[user.addresses.length - 1],
        addresses: user.addresses,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Add address error:", error);

    return NextResponse.json(
      { success: false, message: "Could not add address" },
      { status: 500 },
    );
  }
}


/* ---------------- UPDATE ---------------- */
export async function PUT(request, { params }) {
  try {
    await connectMongodb();

    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const {
      fullName,
      phone,
      address,
      city,
      region,
      country,
      postalCode,
      isDefault,
    } = await request.json();

    if (!fullName || !phone || !address || !city) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name, phone, address, and city are required",
        },
        { status: 400 },
      );
    }

    const user = await Users.findById(authUser.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const target = user.addresses.id(id);
    if (!target) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 },
      );
    }

    // If making this the default, unset the others first
    if (isDefault) {
      user.addresses.forEach((item) => {
        if (item._id.toString() !== id) item.isDefault = false;
      });
    }

    target.fullName = fullName;
    target.phone = phone;
    target.address = address;
    target.city = city;
    target.region = region || "";
    target.country = country || "Ghana";
    target.postalCode = postalCode || "";
    target.isDefault = Boolean(isDefault) || target.isDefault;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      address: target,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json(
      { success: false, message: "Could not update address" },
      { status: 500 },
    );
  }
}

/* ---------------- DELETE ---------------- */
export async function DELETE(request, { params }) {
  try {
    await connectMongodb();

    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const user = await Users.findById(authUser.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const target = user.addresses.id(id);
    if (!target) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 },
      );
    }

    const wasDefault = target.isDefault;
    target.deleteOne();

    // If we deleted the default, promote the first remaining address
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json(
      { success: false, message: "Could not delete address" },
      { status: 500 },
    );
  }
}
