import mongoose from "mongoose";
import { Users } from "@/models/User";

/*
  Saved delivery addresses live in users.addresses.

  Rule: while a user has any addresses, exactly ONE has isDefault: true.
  Every write below is a single atomic update on the user's document,
  so concurrent requests can never leave two defaults (or none).
  Ownership is implicit: every query is scoped to the authenticated
  user's _id, so another user's address simply isn't found.
*/

export const ADDRESS_LABELS = ["Home", "Office", "Other"];
export const MAX_ADDRESSES = 20;

const FIELD_RULES = {
  label: { optional: true, oneOf: ADDRESS_LABELS },
  fullName: { label: "Full name", min: 2, max: 80 },
  phone: {
    label: "Phone number",
    min: 7,
    max: 20,
    pattern: /^\+?[\d\s()-]+$/,
    patternMessage: "Phone number can only contain digits, spaces, +, - and ()",
  },
  address: { label: "Address", min: 3, max: 200 },
  city: { label: "City", min: 2, max: 80 },
  region: { label: "Region", min: 2, max: 80 },
  country: { label: "Country", min: 2, max: 60 },
  postalCode: { label: "Postal code", optional: true, max: 20 },
  additionalInfo: { label: "Additional information", optional: true, max: 300 },
};

export const ADDRESS_FIELDS = Object.keys(FIELD_RULES);

export const isValidAddressId = (id) =>
  typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

/*
  Validates and trims address input. Only known fields are kept, so
  nothing else (userId, isDefault, _id...) can be written through it.
  Returns { value } or { errors: { field: message } }.
*/
export function validateAddress(input) {
  const errors = {};
  const value = {};
  const body = input && typeof input === "object" ? input : {};

  for (const [field, rule] of Object.entries(FIELD_RULES)) {
    const raw = body[field];
    const text = typeof raw === "string" ? raw.trim() : raw == null ? "" : null;

    if (text === null) {
      errors[field] = `${rule.label || field} must be text`;
      continue;
    }

    if (field === "label") {
      value.label = rule.oneOf.includes(text) ? text : "Home";
      continue;
    }

    if (!text) {
      if (!rule.optional) errors[field] = `${rule.label} is required`;
      else value[field] = "";
      continue;
    }

    if (rule.min && text.length < rule.min) {
      errors[field] = `${rule.label} must be at least ${rule.min} characters`;
    } else if (text.length > rule.max) {
      errors[field] = `${rule.label} must be at most ${rule.max} characters`;
    } else if (rule.pattern && !rule.pattern.test(text)) {
      errors[field] = rule.patternMessage;
    } else {
      value[field] = text;
    }
  }

  return Object.keys(errors).length ? { errors } : { value };
}

// Shape sent to the client (and snapshotted onto orders)
export function toPublicAddress(a) {
  return {
    _id: String(a._id),
    label: a.label || "Home",
    fullName: a.fullName,
    phone: a.phone,
    address: a.address,
    city: a.city,
    region: a.region || "",
    country: a.country || "",
    postalCode: a.postalCode || "",
    additionalInfo: a.additionalInfo || "",
    isDefault: Boolean(a.isDefault),
  };
}

// Default first, then in the order they were added
export async function listAddresses(userId) {
  const user = await Users.findById(userId).select("addresses").lean();
  if (!user) return null;

  const addresses = (user.addresses || []).map(toPublicAddress);
  return addresses.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}

export async function findUserAddress(userId, addressId) {
  if (!isValidAddressId(addressId)) return null;

  const user = await Users.findOne(
    { _id: userId, "addresses._id": addressId },
    { "addresses.$": 1 },
  ).lean();

  return user?.addresses?.[0] ? toPublicAddress(user.addresses[0]) : null;
}

// Pipeline values must be literals so user text like "$city" isn't read as a field path
const literal = (v) => ({ $literal: v });

/*
  Adds an address. It becomes the default when requested or when it's
  the user's first; any previous default is cleared in the same update.
  Returns the new address id, or null when the user already has
  MAX_ADDRESSES (or doesn't exist).
*/
export async function createAddress(userId, value, makeDefault) {
  const _id = new mongoose.Types.ObjectId();
  const current = { $ifNull: ["$addresses", []] };

  const newAddress = { _id: literal(_id), isDefault: "$$becomesDefault" };
  for (const field of ADDRESS_FIELDS) newAddress[field] = literal(value[field]);

  const result = await Users.updateOne(
    {
      _id: userId,
      $expr: { $lt: [{ $size: { $ifNull: ["$addresses", []] } }, MAX_ADDRESSES] },
    },
    [
      {
        $set: {
          addresses: {
            $let: {
              vars: {
                becomesDefault: {
                  $or: [literal(Boolean(makeDefault)), { $eq: [{ $size: current }, 0] }],
                },
              },
              in: {
                $concatArrays: [
                  {
                    $map: {
                      input: current,
                      as: "a",
                      in: {
                        $mergeObjects: [
                          "$$a",
                          { isDefault: { $and: ["$$a.isDefault", { $not: ["$$becomesDefault"] }] } },
                        ],
                      },
                    },
                  },
                  [newAddress],
                ],
              },
            },
          },
        },
      },
    ],
    { updatePipeline: true },
  );

  return result.modifiedCount === 1 ? String(_id) : null;
}

/*
  Updates an address the user owns. makeDefault=true also moves the
  default here; an address can't be un-defaulted directly (choose
  another default instead), so the user never ends up without one.
  Returns false when the address isn't the user's.
*/
export async function updateAddress(userId, addressId, value, makeDefault) {
  if (!isValidAddressId(addressId)) return false;

  const $set = {};
  for (const field of ADDRESS_FIELDS) {
    $set[`addresses.$[target].${field}`] = value[field];
  }

  const arrayFilters = [{ "target._id": new mongoose.Types.ObjectId(addressId) }];

  if (makeDefault) {
    $set["addresses.$[target].isDefault"] = true;
    $set["addresses.$[other].isDefault"] = false;
    arrayFilters.push({ "other._id": { $ne: new mongoose.Types.ObjectId(addressId) } });
  }

  const result = await Users.updateOne(
    { _id: userId, "addresses._id": addressId },
    { $set },
    { arrayFilters },
  );

  return result.matchedCount === 1;
}

// Makes one address the default and clears every other, atomically
export async function setDefaultAddress(userId, addressId) {
  if (!isValidAddressId(addressId)) return false;

  const id = new mongoose.Types.ObjectId(addressId);

  const result = await Users.updateOne(
    { _id: userId, "addresses._id": id },
    {
      $set: {
        "addresses.$[target].isDefault": true,
        "addresses.$[other].isDefault": false,
      },
    },
    { arrayFilters: [{ "target._id": id }, { "other._id": { $ne: id } }] },
  );

  return result.matchedCount === 1;
}

/*
  Removes an address the user owns. If it was the default and others
  remain, the oldest remaining address becomes the default - all in
  one update.
*/
export async function deleteAddress(userId, addressId) {
  if (!isValidAddressId(addressId)) return false;

  const id = new mongoose.Types.ObjectId(addressId);

  const result = await Users.updateOne({ _id: userId, "addresses._id": id }, [
    {
      $set: {
        addresses: {
          $filter: { input: "$addresses", cond: { $ne: ["$$this._id", literal(id)] } },
        },
      },
    },
    {
      $set: {
        addresses: {
          $cond: [
            {
              $or: [
                { $eq: [{ $size: "$addresses" }, 0] },
                { $in: [true, "$addresses.isDefault"] },
              ],
            },
            "$addresses",
            {
              $map: {
                input: { $range: [0, { $size: "$addresses" }] },
                as: "i",
                in: {
                  $mergeObjects: [
                    { $arrayElemAt: ["$addresses", "$$i"] },
                    { isDefault: { $eq: ["$$i", 0] } },
                  ],
                },
              },
            },
          ],
        },
      },
    },
  ], { updatePipeline: true });

  return result.matchedCount === 1;
}
