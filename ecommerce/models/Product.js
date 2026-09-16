import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    offerPrice: {
      type: Number,
    },

    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
    },

    images: {
      type: [String],
      required: true,
    },

    stock: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);


