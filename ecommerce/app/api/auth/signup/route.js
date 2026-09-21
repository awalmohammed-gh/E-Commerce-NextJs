import { connectMongodb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import validator from "validator";
import bcrypt from "bcryptjs";
import { Users } from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    await connectMongodb();

    const formData = await request.formData();

    const fullName = formData.get("fullName");
    const email = formData.get("email");
    const password = formData.get("password");

    // Check required fields
    if (!fullName || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    // Check email
    if (!validator.isEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Type a valid email",
        },
        { status: 400 }
      );
    }

    // Check password length
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const user = await Users.findOne({ email });

    if (user) {
      return NextResponse.json(
        {
          success: false,
          message: "User already has an account",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await Users.create({
      fullName,
      email,
      password: hashPassword,
      cartData:{}
    });

    // Create JWT token
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "1d",
      }
    );

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          cartData: newUser.cartData,
        },
      },
      { status: 201 },
    );

    // Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
