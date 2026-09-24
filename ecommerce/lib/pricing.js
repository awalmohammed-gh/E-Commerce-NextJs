/*
  Pricing rules shared by the server (authoritative) and the client
  (display only). Checkout always recalculates with these on the server.

  The delivery fee is not here: it's an admin setting (store.deliveryFee),
  read on the server with getDeliveryFee() in lib/settings.js.
*/

// Size key used for products that have no sizes
export const DEFAULT_SIZE = "default";

// The price a customer pays: the offer price when it is a real discount
export function getUnitPrice(product) {
  const price = Number(product?.price) || 0;
  const offer = Number(product?.offerPrice) || 0;
  return offer > 0 && offer < price ? offer : price;
}

export function hasDiscount(product) {
  return getUnitPrice(product) < (Number(product?.price) || 0);
}
