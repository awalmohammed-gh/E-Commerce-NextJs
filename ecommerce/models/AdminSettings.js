import mongoose from "mongoose";

/*
  One global document (key: "global") holds every store-wide setting.
  Secrets (JWT_KEY, MONGODB_URI, Cloudinary keys) stay in environment
  variables and the admin password hash lives in AdminAccount.
*/
const adminSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true, immutable: true },

    general: {
      systemName: { type: String, default: "Eleoka", trim: true, maxlength: 80 },
      logo: { type: String, default: "" },
      email: { type: String, default: "", trim: true, lowercase: true },
      phone: { type: String, default: "", trim: true, maxlength: 30 },
      address: { type: String, default: "", trim: true, maxlength: 300 },
      description: { type: String, default: "", trim: true, maxlength: 1000 },
      website: { type: String, default: "", trim: true },
    },

    store: {
      currency: { type: String, default: "GHS", uppercase: true, trim: true },
      currencySymbol: { type: String, default: "GH₵", trim: true, maxlength: 5 },
      country: { type: String, default: "Ghana", trim: true, maxlength: 60 },
      taxEnabled: { type: Boolean, default: false },
      taxPercentage: { type: Number, default: 0, min: 0, max: 100 },
      minimumOrderAmount: { type: Number, default: 0, min: 0 },
      // null = no upper limit
      maximumOrderAmount: { type: Number, default: null, min: 0 },
    },

    orders: {
      allowCancellation: { type: Boolean, default: true },
      // Hours after placing an order during which a customer may cancel
      cancellationTimeLimit: { type: Number, default: 24, min: 0, max: 720 },
      autoCompleteOrders: { type: Boolean, default: false },
      // Days after an order ships before it is marked Delivered
      autoCompleteAfterDays: { type: Number, default: 7, min: 1, max: 90 },
      allowOrders: { type: Boolean, default: true },
      requirePhone: { type: Boolean, default: true },
      requireAddress: { type: Boolean, default: true },
    },

    // Mirrors the paymentMethod enum in models/Checkout.js
    payments: {
      cashOnDelivery: { type: Boolean, default: true },
      mobileMoney: { type: Boolean, default: true },
      card: { type: Boolean, default: true },
    },

    notifications: {
      newOrder: { type: Boolean, default: true },
      newUser: { type: Boolean, default: true },
      orderStatus: { type: Boolean, default: true },
      payment: { type: Boolean, default: true },
    },

    security: {
      // Lifetime of the admin login cookie/JWT
      sessionDurationHours: { type: Number, default: 24, min: 1, max: 168 },
    },
  },
  { timestamps: true, minimize: false },
);

export const AdminSettings =
  mongoose.models.AdminSettings ||
  mongoose.model("AdminSettings", adminSettingsSchema);
