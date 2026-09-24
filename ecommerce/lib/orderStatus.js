// Mirrors the orderStatus enum in models/Checkout.js
export const ORDER_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

// Orders saved before a status was set are shown as the model default
export const DEFAULT_ORDER_STATUS = "Processing";

/*
  How each status reads in the admin. `tone` picks the badge colours
  (components/admin/ui/Badge.jsx); the label always carries the meaning,
  colour only reinforces it.
*/
export const ORDER_STATUS_META = {
  Processing: { tone: "warning", hint: "Awaiting dispatch" },
  Shipped: { tone: "info", hint: "On the way" },
  Delivered: { tone: "success", hint: "Completed" },
  Cancelled: { tone: "danger", hint: "Not fulfilled" },
};

// Solid fills for bars and charts, one per tone
export const TONE_FILL = {
  neutral: "bg-ink/25",
  warning: "bg-warning-mark",
  info: "bg-info",
  success: "bg-success",
  danger: "bg-danger/70",
};

// Products at or below this count are flagged as low stock
export const LOW_STOCK_THRESHOLD = 5;

export function stockLevel(stock) {
  const count = Number(stock);
  if (!Number.isFinite(count)) return "unknown";
  if (count <= 0) return "out";
  if (count <= LOW_STOCK_THRESHOLD) return "low";
  return "in";
}
