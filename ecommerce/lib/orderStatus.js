// Mirrors the orderStatus enum in models/Checkout.js
export const ORDER_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

export const ORDER_STATUS_STYLES = {
  Processing: "bg-blue-50 text-blue-700 border-blue-200",
  Shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Delivered: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

export const ORDER_STATUS_BAR = {
  Processing: "bg-blue-500",
  Shipped: "bg-indigo-500",
  Delivered: "bg-green-600",
  Cancelled: "bg-red-500",
};
