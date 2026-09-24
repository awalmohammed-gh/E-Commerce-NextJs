import validator from "validator";
import { AdminSettings } from "@/models/AdminSettings";

const SETTINGS_KEY = "global";

export const SETTINGS_SECTIONS = [
  "general",
  "store",
  "orders",
  "payments",
  "notifications",
  "security",
];

/* ------------------------------------------------------------------
   Field rules
   Each rule takes the raw incoming value and returns { value } or
   { error }. Only fields listed here can ever be written to MongoDB.
------------------------------------------------------------------ */
const text =
  ({ label, max, required = false, pattern, patternMessage }) =>
  (raw) => {
    if (typeof raw !== "string") return { error: `${label} must be text` };
    const value = raw.trim();
    if (required && !value) return { error: `${label} is required` };
    if (value.length > max) {
      return { error: `${label} must be at most ${max} characters` };
    }
    if (value && pattern && !pattern.test(value)) {
      return { error: patternMessage || `${label} is invalid` };
    }
    return { value };
  };

const email =
  ({ label }) =>
  (raw) => {
    const result = text({ label, max: 254 })(raw);
    if (result.error) return result;
    if (result.value && !validator.isEmail(result.value)) {
      return { error: `${label} must be a valid email address` };
    }
    return { value: result.value.toLowerCase() };
  };

const url =
  ({ label }) =>
  (raw) => {
    const result = text({ label, max: 500 })(raw);
    if (result.error) return result;
    if (
      result.value &&
      !validator.isURL(result.value, {
        protocols: ["http", "https"],
        require_protocol: true,
      })
    ) {
      return { error: `${label} must be a full URL, e.g. https://eleoka.com` };
    }
    return result;
  };

// Logos may only point at this project's Cloudinary account
const logoUrl = () => (raw) => {
  if (raw === "") return { value: "" };
  const prefix = `https://res.cloudinary.com/${process.env.CLOUD_NAME}/`;
  if (typeof raw !== "string" || !raw.startsWith(prefix)) {
    return { error: "Logo must be uploaded through the settings page" };
  }
  return { value: raw };
};

const bool =
  ({ label }) =>
  (raw) =>
    typeof raw === "boolean"
      ? { value: raw }
      : { error: `${label} must be on or off` };

const number =
  ({ label, min, max, integer = false, nullable = false, decimals }) =>
  (raw) => {
    if (nullable && (raw === null || raw === "")) return { value: null };

    const value =
      typeof raw === "number"
        ? raw
        : typeof raw === "string" && raw.trim() !== ""
          ? Number(raw)
          : NaN;

    if (!Number.isFinite(value)) return { error: `${label} must be a number` };
    if (integer && !Number.isInteger(value)) {
      return { error: `${label} must be a whole number` };
    }
    // e.g. money: at most 2 decimal places (pesewas). The tolerance absorbs
    // float noise such as 25.1 * 100 = 2510.0000000000005
    if (decimals !== undefined) {
      const scaled = value * 10 ** decimals;
      if (Math.abs(scaled - Math.round(scaled)) > 1e-6) {
        return { error: `${label} can have at most ${decimals} decimal places` };
      }
    }
    if (min !== undefined && value < min) {
      return { error: `${label} must be at least ${min}` };
    }
    if (max !== undefined && value > max) {
      return { error: `${label} must be at most ${max}` };
    }
    return { value };
  };

const FIELD_RULES = {
  general: {
    systemName: text({ label: "Business name", max: 80, required: true }),
    logo: logoUrl(),
    email: email({ label: "Email" }),
    phone: text({
      label: "Phone",
      max: 30,
      pattern: /^\+?[\d\s()-]{7,}$/,
      patternMessage: "Phone must contain only digits, spaces, +, - or ()",
    }),
    address: text({ label: "Address", max: 300 }),
    description: text({ label: "Description", max: 1000 }),
    website: url({ label: "Website" }),
  },
  store: {
    currency: text({
      label: "Currency",
      max: 3,
      required: true,
      pattern: /^[A-Za-z]{3}$/,
      patternMessage: "Currency must be a 3-letter code, e.g. GHS",
    }),
    currencySymbol: text({ label: "Currency symbol", max: 5, required: true }),
    country: text({ label: "Default country", max: 60, required: true }),
    deliveryFee: number({ label: "Delivery fee", min: 0, max: 10000, decimals: 2 }),
    taxEnabled: bool({ label: "Tax" }),
    taxPercentage: number({ label: "Tax percentage", min: 0, max: 100 }),
    minimumOrderAmount: number({ label: "Minimum order amount", min: 0 }),
    maximumOrderAmount: number({
      label: "Maximum order amount",
      min: 0,
      nullable: true,
    }),
  },
  orders: {
    allowCancellation: bool({ label: "Order cancellation" }),
    cancellationTimeLimit: number({
      label: "Cancellation time limit",
      min: 0,
      max: 720,
      integer: true,
    }),
    autoCompleteOrders: bool({ label: "Auto-complete orders" }),
    autoCompleteAfterDays: number({
      label: "Auto-complete delay",
      min: 1,
      max: 90,
      integer: true,
    }),
    allowOrders: bool({ label: "Accept orders" }),
    requirePhone: bool({ label: "Require phone number" }),
    requireAddress: bool({ label: "Require address" }),
  },
  payments: {
    cashOnDelivery: bool({ label: "Cash on Delivery" }),
    mobileMoney: bool({ label: "Mobile Money" }),
    card: bool({ label: "Card" }),
  },
  notifications: {
    newOrder: bool({ label: "New order notification" }),
    newUser: bool({ label: "New user notification" }),
    orderStatus: bool({ label: "Order status notification" }),
    payment: bool({ label: "Payment notification" }),
  },
  security: {
    sessionDurationHours: number({
      label: "Session duration",
      min: 1,
      max: 168,
      integer: true,
    }),
  },
};

export class SettingsValidationError extends Error {
  constructor(errors) {
    super(Object.values(errors)[0] || "Invalid settings");
    this.errors = errors;
  }
}

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

// Returns the parsed values grouped by section, or throws with a field -> message map
function parseSettingsUpdate(body) {
  if (!isPlainObject(body) || Object.keys(body).length === 0) {
    throw new SettingsValidationError({ _: "No settings to update" });
  }

  const errors = {};
  const parsed = {};

  for (const [section, fields] of Object.entries(body)) {
    const rules = FIELD_RULES[section];

    if (!rules) {
      errors[section] = `Unknown settings section "${section}"`;
      continue;
    }
    if (!isPlainObject(fields)) {
      errors[section] = `"${section}" must be an object`;
      continue;
    }

    parsed[section] = {};

    for (const [field, raw] of Object.entries(fields)) {
      const path = `${section}.${field}`;

      if (!Object.hasOwn(rules, field)) {
        errors[path] = `Unknown setting "${path}"`;
        continue;
      }

      const { value, error } = rules[field](raw);
      if (error) errors[path] = error;
      else parsed[section][field] = value;
    }
  }

  if (Object.keys(errors).length) throw new SettingsValidationError(errors);
  return parsed;
}

// Rules that depend on more than one field, checked against the merged result
function validateMerged(merged) {
  const errors = {};
  const { minimumOrderAmount, maximumOrderAmount } = merged.store;

  if (maximumOrderAmount !== null && maximumOrderAmount < minimumOrderAmount) {
    errors["store.maximumOrderAmount"] =
      "Maximum order amount must be greater than the minimum";
  }

  if (!Object.values(merged.payments).some(Boolean)) {
    errors["payments"] = "Keep at least one payment method enabled";
  }

  if (Object.keys(errors).length) throw new SettingsValidationError(errors);
}

/* ------------------------------------------------------------------
   Read / write
------------------------------------------------------------------ */

// Only the setting sections leave the server; never internal fields
function toPublicSettings(doc) {
  const plain = doc.toObject();
  const result = { updatedAt: plain.updatedAt };
  for (const section of SETTINGS_SECTIONS) result[section] = plain[section];
  return result;
}

// Returns the single settings document, creating it with defaults on first use
async function loadSettingsDoc() {
  const existing = await AdminSettings.findOne({ key: SETTINGS_KEY });
  if (existing) return existing;

  try {
    return await AdminSettings.create({ key: SETTINGS_KEY });
  } catch (error) {
    // Another request created it at the same moment
    if (error?.code === 11000) {
      return AdminSettings.findOne({ key: SETTINGS_KEY });
    }
    throw error;
  }
}

export async function getSettings() {
  return toPublicSettings(await loadSettingsDoc());
}

// Cache tag for storefront data derived from settings (see lib/storeInfo.js)
export const STORE_SETTINGS_TAG = "store-settings";

/*
  The current flat delivery fee. Read fresh (never cached) because cart
  and checkout totals are calculated from it on the server.
*/
export async function getDeliveryFee() {
  const { store } = await getSettings();
  const fee = Number(store?.deliveryFee);
  if (!Number.isFinite(fee) || fee < 0) throw new Error("Delivery fee setting is invalid");
  return fee;
}

export async function updateSettings(body) {
  const parsed = parseSettingsUpdate(body);
  const current = await getSettings();

  const merged = { ...current };
  for (const [section, values] of Object.entries(parsed)) {
    merged[section] = { ...current[section], ...values };
  }
  validateMerged(merged);

  // Dotted paths so only the submitted fields change
  const $set = {};
  for (const [section, values] of Object.entries(parsed)) {
    for (const [field, value] of Object.entries(values)) {
      $set[`${section}.${field}`] = value;
    }
  }

  const updated = await AdminSettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $set },
    {
      returnDocument: "after",
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  return toPublicSettings(updated);
}
