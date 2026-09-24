import mongoose from "mongoose";

/*
  Server-only admin credentials. The admin email still comes from
  ADMIN_EMAIL; until the password is changed from the settings page,
  passwordHash is null and login falls back to ADMIN_PSD.

  sessionVersion is embedded in every admin JWT. Incrementing it
  invalidates all tokens issued before (password change / sign out
  of other sessions).
*/
const adminAccountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, default: null, select: false },
    passwordChangedAt: { type: Date, default: null },
    sessionVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const AdminAccount =
  mongoose.models.AdminAccount ||
  mongoose.model("AdminAccount", adminAccountSchema);
