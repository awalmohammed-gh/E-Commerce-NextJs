import { connectCloudinary } from "@/lib/cloudinary";
import { connectMongodb } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { requireAdmin } from "@/middleware/adminAuth";
import {v2 as cloudinary} from "cloudinary"
import { NextResponse } from "next/server";

const uploadImage = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "eleoka/products",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      ).end(buffer);
  });
};

export async function POST(request) {
     const { error } = await requireAdmin(request);
     if (error) return error;

     try {
       await connectMongodb()
       connectCloudinary();

       const formData = await request.formData();

       const name = formData.get("name");
       const description = formData.get("description");
       const subCategory = formData.get("subCategory");
       const offerPrice = formData.get("offerPrice");
       const price = formData.get("price");
       const category = formData.get("category");
       const stock = formData.get("stock");
       const sizesValue = formData.get("sizes");
       // Checkbox flags arrive as the strings "true" / "false"
       const bestseller = formData.get("bestseller") === "true";
       const newArrival = formData.get("newArrival") === "true";
       let sizes = [];

       try {
         const parsedSizes = JSON.parse(sizesValue || "[]");
         if (!Array.isArray(parsedSizes)) throw new Error("Invalid sizes");
         sizes = [...new Set(parsedSizes.map((size) => String(size).trim()).filter(Boolean))];
       } catch {
         return NextResponse.json(
           { message: "Sizes must be a valid list" },
           { status: 400 },
         );
       }

       const images = formData.getAll("images");

       if (
         !name ||
         !description ||
         !price ||
         !category ||
         images.length === 0
       ) {
         return NextResponse.json(
           { message: "Required fields are missing" },
           { status: 400 },
         );
       }

       const imageUrls = [];
       // Upload every image to Cloudinary
       for (const image of images) {
         const buffer = Buffer.from(await image.arrayBuffer());
         const result = await uploadImage(buffer);
         imageUrls.push(result.secure_url);
       }

       const product = await Product.create({
         name,
         description,
         offerPrice:Number(offerPrice),
         price: Number(price),
         category,
         subCategory,
         sizes,
         stock: Number(stock) || 0,
         images: imageUrls,
         bestseller,
         newArrival,
       });

       return NextResponse.json(
         {
           message: "Product added successfully",
           product,
         },
         { status: 201 },
       );
     } catch (error) {
       console.log("Add product error:", error);

       return NextResponse.json(
         { message: "Failed to add product" },
         { status: 500 },
       );
     }
}
