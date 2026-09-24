import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AdminAccount } from "@/models/AdminAccount";
import { getSettings } from "@/lib/settings";

export const ADMIN_COOKIE = "adminToken";

const DEFAULT_SESSION_HOURS = 24;

export const getConfiguredAdminEmail = () =>
  (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

// Constant-time comparison so response timing doesn't leak the password
function safeEqual(a, b) {
  const hash = (value) => crypto.createHash("sha256").update(String(value)).digest();
  return crypto.timingSafeEqual(hash(a), hash(b));
}

/*
  Checks a password against the stored bcrypt hash, or against
  ADMIN_PSD when the password has never been changed from the app.
*/
export async function verifyAdminPassword(email, password) {
  if (typeof password !== "string" || !password) return false;

  const account = await AdminAccount.findOne({ email }).select("+passwordHash");

  if (account?.passwordHash) {
    return bcrypt.compare(password, account.passwordHash);
  }

  const envPassword = process.env.ADMIN_PSD;
  return Boolean(envPassword) && safeEqual(password, envPassword);
}

export async function getAdminSessionVersion(email) {
  const account = await AdminAccount.findOne({ email })
    .select("sessionVersion")
    .lean();
  return account?.sessionVersion ?? 0;
}

// Public info for the Security tab - never includes the hash
export async function getAdminSecurityInfo(email) {
  const account = await AdminAccount.findOne({ email })
    .select("+passwordHash passwordChangedAt")
    .lean();

  return {
    email,
    passwordSource: account?.passwordHash ? "database" : "environment",
    passwordChangedAt: account?.passwordChangedAt || null,
  };
}

export async function setAdminPassword(email, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Bumping sessionVersion signs out every other device
  const account = await AdminAccount.findOneAndUpdate(
    { email },
    {
      $set: { passwordHash, passwordChangedAt: new Date() },
      $inc: { sessionVersion: 1 },
    },
    { returnDocument: "after", upsert: true },
  );

  return account.sessionVersion;
}

export async function revokeAdminSessions(email) {
  const account = await AdminAccount.findOneAndUpdate(
    { email },
    { $inc: { sessionVersion: 1 } },
    { returnDocument: "after", upsert: true },
  );

  return account.sessionVersion;
}

// Signs the admin JWT and sets it as an httpOnly cookie on the response
export async function issueAdminSession(response, { email, sessionVersion }) {
  const { security } = await getSettings();
  const maxAge =
    (security?.sessionDurationHours || DEFAULT_SESSION_HOURS) * 60 * 60;

  const token = jwt.sign(
    { email, role: "admin", sv: sessionVersion },
    process.env.JWT_KEY,
    { expiresIn: maxAge },
  );

  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });

  return response;
}
