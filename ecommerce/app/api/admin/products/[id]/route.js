import { NextResponse } from "next/server";
import { connectMongodb } from "@/lib/mongodb";
import { uploadImageBuffer } from "@/lib/cloudinary";
import { isValidProductId } from "@/lib/products";
import { requireAdmin } from "@/middleware/adminAuth";
import { Product } from "@/models/Product";

export const dynamic = "force-dynamic";

const MAX_IMAGES = 6;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const notFound = () =>
  NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });

const badRequest = (message, errors) =>
  NextResponse.json({ success: false, message, errors }, { status: 400 });

// Admin view of one product, every field (the storefront uses /api/products/[id])
export async function GET(request, { params }) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  if (!isValidProductId(id)) return notFound();

  try {
    await connectMongodb();
    const product = await Product.findById(id).lean();
    if (!product) return notFound();

    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error("Admin get product error:", err);
    return NextResponse.json({ success: false, message: "Could not load product" }, { status: 500 });
  }
}

const parseJsonList = (value) => {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/*
  Updates a product. Multipart form, same fields as /api/add-product, plus:
    imageOrder: JSON list giving the final image order. Each entry is
                either a URL the product already has, or "new:<n>" for
                the n-th uploaded file in `images`.
    images:     new image files (only those referenced in imageOrder)
  Existing URLs not listed are dropped from the product.
*/
export async function PATCH(request, { params }) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  if (!isValidProductId(id)) return notFound();

  try {
    await connectMongodb();

    const product = await Product.findById(id);
    if (!product) return notFound();

    const formData = await request.formData();
    const text = (key) => String(formData.get(key) ?? "").trim();

    const name = text("name");
    const description = text("description");
    const category = text("category");
    const subCategory = text("subCategory");
    const price = Number(formData.get("price"));
    const offerPrice = Number(formData.get("offerPrice") || 0);
    const stock = Number(formData.get("stock") || 0);

    // Field checks mirror the admin form, so errors map back to fields
    const errors = {};
    if (!name) errors.name = "Enter a product name.";
    if (!description) errors.description = "Add a short description.";
    if (!category) errors.category = "Choose or type a category.";
    if (!(price > 0)) errors.price = "Enter a price greater than 0.";
    if (!Number.isFinite(offerPrice) || offerPrice < 0) errors.offerPrice = "Offer price can't be negative.";
    else if (offerPrice > 0 && offerPrice >= price) errors.offerPrice = "Offer price must be lower than the regular price.";
    if (!Number.isInteger(stock) || stock < 0) errors.stock = "Stock must be a whole number, 0 or more.";

    const sizesList = parseJsonList(formData.get("sizes"));
    if (!sizesList) errors.sizes = "Sizes must be a valid list.";
    const sizes = [...new Set((sizesList || []).map((s) => String(s).trim()).filter(Boolean))];

    // Images: only the product's own URLs or files sent with this request
    const order = parseJsonList(formData.get("imageOrder"));
    const files = formData.getAll("images").filter((f) => typeof f === "object" && f.size > 0);
    const currentImages = new Set(product.images);

    if (!order) {
      errors.images = "Image order is missing.";
    } else if (order.length === 0) {
      errors.images = "Add at least one image.";
    } else if (order.length > MAX_IMAGES) {
      errors.images = `Use at most ${MAX_IMAGES} images.`;
    } else {
      for (const entry of order) {
        const match = /^new:(\d+)$/.exec(entry);
        if (match ? !files[Number(match[1])] : !currentImages.has(entry)) {
          errors.images = "One of the images couldn't be found. Reload the page and try again.";
          break;
        }
      }
    }

    for (const file of files) {
      if (!file.type?.startsWith("image/")) errors.images = "Only image files can be uploaded.";
      else if (file.size > MAX_IMAGE_BYTES) errors.images = "Each image must be 5 MB or smaller.";
    }

    if (Object.keys(errors).length) {
      return badRequest("Some details need fixing", errors);
    }

    // Upload only the new files that are actually used
    const uploaded = new Map();
    for (const entry of order) {
      const match = /^new:(\d+)$/.exec(entry);
      if (!match || uploaded.has(entry)) continue;
      const buffer = Buffer.from(await files[Number(match[1])].arrayBuffer());
      const result = await uploadImageBuffer(buffer, { folder: "eleoka/products" });
      uploaded.set(entry, result.secure_url);
    }

    product.set({
      name,
      description,
      category,
      subCategory,
      price,
      offerPrice,
      stock,
      sizes,
      bestseller: formData.get("bestseller") === "true",
      newArrival: formData.get("newArrival") === "true",
      images: order.map((entry) => uploaded.get(entry) || entry),
    });
    await product.save();

    return NextResponse.json({ success: true, message: "Product updated", product });
  } catch (err) {
    console.error("Update product error:", err);
    return NextResponse.json({ success: false, message: "Could not update product" }, { status: 500 });
  }
}
