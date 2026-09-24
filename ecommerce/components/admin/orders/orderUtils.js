/*
  Helpers for reading Checkout documents in the admin.
  Newer orders carry a lineItems snapshot (server-priced at checkout);
  older ones only have items: { productId: { size: qty } }, which are
  priced from the current product list as a best effort.
*/

export const shortOrderId = (id) => `#${String(id).slice(-8).toUpperCase()}`;

const unitPriceOf = (product) => Number(product?.offerPrice) || Number(product?.price) || 0;

export function orderLines(order, productsById) {
  if (order?.lineItems?.length) {
    return order.lineItems.map((line) => ({
      key: `${line.product}-${line.size}`,
      productId: line.product,
      name: line.name,
      image: line.image,
      size: line.size,
      qty: Number(line.quantity) || 0,
      unitPrice: Number(line.unitPrice) || 0,
      lineTotal: Number(line.lineTotal) || 0,
    }));
  }

  if (!order?.items || Array.isArray(order.items)) return [];

  return Object.entries(order.items).flatMap(([productId, sizes]) => {
    const product = productsById.get(String(productId));
    const unitPrice = unitPriceOf(product);

    return Object.entries(sizes || {})
      .filter(([, qty]) => Number(qty) > 0)
      .map(([size, qty]) => ({
        key: `${productId}-${size}`,
        productId,
        name: product?.name || "Product no longer in catalog",
        image: product?.images?.[0],
        size,
        qty: Number(qty),
        unitPrice,
        lineTotal: unitPrice * Number(qty),
      }));
  });
}

export const itemCount = (lines) => lines.reduce((sum, line) => sum + line.qty, 0);

export function orderTotal(order, lines) {
  if (typeof order.totalAmount === "number") return order.totalAmount;
  if (typeof order.total === "number") return order.total;
  return lines.reduce((sum, line) => sum + line.lineTotal, 0);
}

// Delivery details, copied onto the order at checkout
export function customerOf(order) {
  const a = order.address || {};
  return {
    name: a.fullName || "",
    phone: a.phone || "",
    lines: [a.address, a.city, a.region].filter(Boolean),
  };
}
