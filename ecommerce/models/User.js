import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Profile fields editable from /account/settings (lib/accountSettings.js)
    phone: { type: String, default: "" },
    image: { type: String, default: "" },
    cartData: { type: Object, default: () => ({}) },
    // Saved products, newest first. lib/wishlist.js keeps entries unique.
    wishlist: {
      type: [
        {
          _id: false,
          product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
          addedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    // Stored choices only: no email/SMS notifications are sent yet
    notificationPreferences: {
      orderUpdates: { type: Boolean, default: true },
      paymentUpdates: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
    // Saved delivery addresses. Exactly one is isDefault while any exist;
    // lib/addresses.js enforces that with atomic updates.
    addresses: {
      type: [
        {
          label: {
            type: String,
            enum: ["Home", "Office", "Other"],
            default: "Home",
          },
          fullName: { type: String, required: true },
          phone: { type: String, required: true },
          address: { type: String, required: true },
          city: { type: String, required: true },
          region: { type: String, default: "" },
          country: { type: String, default: "Ghana" },
          postalCode: { type: String, default: "" },
          additionalInfo: { type: String, default: "" },
          isDefault: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

export const Users =mongoose.models.Users || mongoose.model("Users", userSchema)