"use client";

import { AnimatePresence, motion } from "framer-motion";
import { badgeSwap } from "@/lib/adminMotion";
import {
  DEFAULT_ORDER_STATUS,
  ORDER_STATUS_META,
  stockLevel,
} from "@/lib/orderStatus";

/*
  Status label: tinted background, a dot, and always a text label so
  colour is never the only signal. Tints come from the shared tokens.
*/
const TONES = {
  neutral: { chip: "bg-ink/6 text-ink-soft", dot: "bg-ink/40" },
  success: { chip: "bg-success-tint text-success", dot: "bg-success" },
  warning: { chip: "bg-warning-tint text-warning", dot: "bg-warning-mark" },
  danger: { chip: "bg-danger-tint text-danger", dot: "bg-danger" },
  info: { chip: "bg-info-tint text-info", dot: "bg-info" },
  accent: { chip: "bg-rose-tint text-rose-deep", dot: "bg-rose" },
};

export default function Badge({ tone = "neutral", dot = true, className = "", children }) {
  const styles = TONES[tone] || TONES.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap ${styles.chip} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} aria-hidden="true" />}
      {children}
    </span>
  );
}

// When the status changes (e.g. Processing -> Shipped) the new badge fades in
export function OrderStatusBadge({ status }) {
  const label = status || DEFAULT_ORDER_STATUS;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span key={label} className="inline-flex" {...badgeSwap}>
        <Badge tone={ORDER_STATUS_META[label]?.tone || "neutral"}>{label}</Badge>
      </motion.span>
    </AnimatePresence>
  );
}

export function PaymentBadge({ paid }) {
  return <Badge tone={paid ? "success" : "neutral"}>{paid ? "Paid" : "Unpaid"}</Badge>;
}

export function StockBadge({ stock }) {
  const level = stockLevel(stock);

  if (level === "unknown") return <Badge>Not tracked</Badge>;
  if (level === "out") return <Badge tone="danger">Out of stock</Badge>;
  if (level === "low") return <Badge tone="warning">{Number(stock)} left</Badge>;
  return (
    <Badge tone="success" className="tabular-nums">
      {Number(stock).toLocaleString("en-GH")} in stock
    </Badge>
  );
}
