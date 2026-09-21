import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: () => ({}) },
    addresses: {
      type: [
        {
          fullName: { type: String, required: true },
          phone: { type: String, required: true },
          address: { type: String, required: true },
          city: { type: String, required: true },
          region: { type: String, default: "" },
          country: { type: String, default: "Ghana" },
          postalCode: { type: String, default: "" },
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