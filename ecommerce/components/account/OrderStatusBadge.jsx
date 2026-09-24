import { CheckCircle2, CircleDot, Truck, XCircle } from "lucide-react";

// Order statuses from models/Checkout.js, each with an icon and a label
const STATUS = {
  Processing: { icon: CircleDot, className: "bg-warning-tint text-warning" },
  Shipped: { icon: Truck, className: "bg-cream text-ink" },
  Delivered: { icon: CheckCircle2, className: "bg-success-tint text-success" },
  Cancelled: { icon: XCircle, className: "bg-danger-tint text-danger" },
};

export default function OrderStatusBadge({ status = "Processing" }) {
  const { icon: Icon, className } = STATUS[status] || STATUS.Processing;
  return (
    <span className={`badge ${className}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {status}
    </span>
  );
}

export function PaymentBadge({ paid, method }) {
  const isCash = method === "Cash On Delivery";
  return (
    <span className={`badge ${paid ? "bg-success-tint text-success" : "bg-cream text-muted"}`}>
      {paid ? "Paid" : isCash ? "Pay on delivery" : "Payment pending"}
    </span>
  );
}
