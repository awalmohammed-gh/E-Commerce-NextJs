import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, default: "" },
    price: { type: Number, required: true },
    offerPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    bestseller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);


