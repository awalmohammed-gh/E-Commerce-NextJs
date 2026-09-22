import mongoose from "mongoose";

const checkoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    items: {
      type: Object,
      required: true,
    },

    address: {
      type: Object,
      required: true,
    },

    payment: {
      type: Boolean,
      default: false,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash On Delivery", "Mobile Money", "Card"],
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    orderStatus: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
  },
  { timestamps: true },
);

export const Checkout =
  mongoose.models.Checkout || mongoose.model("Checkout", checkoutSchema);
