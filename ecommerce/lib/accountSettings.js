import bcrypt from "bcryptjs";
import { Users } from "@/models/User";

/*
  Customer account settings (not the admin settings in lib/settings.js).

  Only the fields listed here can be changed through /api/user/settings.
  Email is read-only: there is no email verification flow yet, so a
  direct change would let a stolen session take over the account.
  Password changes have their own endpoint that checks the current one.
*/

export const NOTIFICATION_KEYS = ["orderUpdates", "paymentUpdates", "marketing"];

const DEFAULT_NOTIFICATIONS = {
  orderUpdates: true,
  paymentUpdates: true,
  marketing: false,
};

export const PASSWORD_MIN = 8;
// bcrypt only uses the first 72 bytes of a password
export const PASSWORD_MAX = 72;

const PHONE_PATTERN = /^\+?[\d\s()-]+$/;

const SETTINGS_FIELDS = {
  fullName: 1,
  email: 1,
  phone: 1,
  image: 1,
  notificationPreferences: 1,
  createdAt: 1,
};

// The non-sensitive view of a user (never includes the password hash)
export function toAccountSettings(user) {
  return {
    profile: {
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      image: user.image || "",
      memberSince: user.createdAt || null,
    },
    notifications: { ...DEFAULT_NOTIFICATIONS, ...(user.notificationPreferences || {}) },
  };
}

export async function getAccountSettings(userId) {
  const user = await Users.findById(userId, SETTINGS_FIELDS).lean();
  return user ? toAccountSettings(user) : null;
}

/*
  Validates a PATCH body shaped like { profile: {...}, notifications: {...} }.
  Unknown keys are ignored, so role/isAdmin/password/email can't be set.
  Returns { update } (a $set object) or { errors: { field: message } }.
*/
export function validateSettingsUpdate(input) {
  const body = input && typeof input === "object" ? input : {};
  const profile = body.profile && typeof body.profile === "object" ? body.profile : {};
  const notifications =
    body.notifications && typeof body.notifications === "object" ? body.notifications : {};

  const update = {};
  const errors = {};

  if ("fullName" in profile) {
    const fullName = typeof profile.fullName === "string" ? profile.fullName.trim() : "";
    if (fullName.length < 2) errors.fullName = "Full name must be at least 2 characters";
    else if (fullName.length > 80) errors.fullName = "Full name must be 80 characters or fewer";
    else update.fullName = fullName;
  }

  if ("phone" in profile) {
    const phone = typeof profile.phone === "string" ? profile.phone.trim() : "";
    if (phone && !PHONE_PATTERN.test(phone)) {
      errors.phone = "Phone number can only contain digits, spaces, +, - and ()";
    } else if (phone && (phone.length < 7 || phone.length > 20)) {
      errors.phone = "Phone number must be between 7 and 20 characters";
    } else {
      update.phone = phone; // empty clears it
    }
  }

  for (const key of NOTIFICATION_KEYS) {
    if (!(key in notifications)) continue;
    if (typeof notifications[key] !== "boolean") {
      errors[key] = "Must be on or off";
      continue;
    }
    update[`notificationPreferences.${key}`] = notifications[key];
  }

  if (Object.keys(errors).length) return { errors };
  if (Object.keys(update).length === 0) return { errors: { form: "Nothing to update" } };
  return { update };
}

// Applies a validated $set and returns the new settings (null if no user)
export async function updateAccountSettings(userId, update) {
  const user = await Users.findByIdAndUpdate(
    userId,
    { $set: update },
    { returnDocument: "after", runValidators: true, projection: SETTINGS_FIELDS },
  ).lean();

  return user ? toAccountSettings(user) : null;
}

export async function setProfileImage(userId, url) {
  return updateAccountSettings(userId, { image: url });
}

/*
  Checks the current password and stores a bcrypt hash of the new one.
  Returns "ok" | "noUser" | "wrongPassword" | "changed" (the password
  changed concurrently, so this request's check is stale).
*/
export async function changePassword(userId, currentPassword, newPassword) {
  const user = await Users.findById(userId, { password: 1 }).lean();
  if (!user) return "noUser";

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) return "wrongPassword";

  const hash = await bcrypt.hash(newPassword, 10);

  // Only replace the hash we verified against
  const result = await Users.updateOne(
    { _id: user._id, password: user.password },
    { $set: { password: hash } },
  );

  return result.modifiedCount === 1 ? "ok" : "changed";
}

// Returns an error message, or null when the new password is acceptable
export function validateNewPassword({ currentPassword, newPassword, confirmPassword }) {
  if (typeof currentPassword !== "string" || !currentPassword) {
    return "Enter your current password";
  }
  if (typeof newPassword !== "string" || newPassword.length < PASSWORD_MIN) {
    return `New password must be at least ${PASSWORD_MIN} characters`;
  }
  if (Buffer.byteLength(newPassword, "utf8") > PASSWORD_MAX) {
    return `New password must be ${PASSWORD_MAX} characters or fewer`;
  }
  if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return "New password must include at least one letter and one number";
  }
  if (newPassword !== confirmPassword) {
    return "New passwords do not match";
  }
  if (newPassword === currentPassword) {
    return "New password must be different from your current password";
  }
  return null;
}
