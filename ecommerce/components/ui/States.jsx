"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, RotateCcw } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/storeMotion";

// Icon, heading, message and action appear in a short sequence
const Group = ({ className, children, ...props }) => (
  <motion.div variants={staggerContainer(0.07)} initial="hidden" animate="show" className={className} {...props}>
    {children}
  </motion.div>
);
const Item = motion.div;

// Icon on layered warm discs, shared by the empty and error states
function StateIcon({ icon: Icon, tone = "warm" }) {
  const danger = tone === "danger";
  return (
    <span
      className={`relative mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
        danger ? "bg-danger-tint" : "bg-cream"
      }`}
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full bg-paper shadow-soft ${
          danger ? "text-danger" : "text-terracotta-deep"
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
      </span>
    </span>
  );
}

/*
  Empty and error states for the storefront. Each explains what
  happened and offers one useful next step.
*/
export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
  secondary,
  className = "",
}) {
  return (
    <Group className={`flex flex-col items-center px-4 py-16 text-center sm:py-24 ${className}`}>
      {icon && (
        <Item variants={staggerItem}>
          <StateIcon icon={icon} />
        </Item>
      )}
      <Item variants={staggerItem}>
        <h2 className="font-display text-[30px] leading-tight font-medium text-ink sm:text-[38px]">{title}</h2>
        {message && <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-muted">{message}</p>}
      </Item>

      {(actionLabel || secondary) && (
        <Item variants={staggerItem} className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          {actionLabel &&
            (actionHref ? (
              <Link href={actionHref} className="btn-primary">
                {actionLabel}
              </Link>
            ) : (
              <button type="button" onClick={onAction} className="btn-primary">
                {actionLabel}
              </button>
            ))}
          {secondary}
        </Item>
      )}
    </Group>
  );
}

export function ErrorState({
  title = "Something went wrong.",
  message = "Please check your connection and try again.",
  onRetry,
  className = "",
}) {
  return (
    <Group role="alert" className={`flex flex-col items-center px-4 py-16 text-center sm:py-24 ${className}`}>
      <Item variants={staggerItem}>
        <StateIcon icon={AlertCircle} tone="danger" />
      </Item>
      <Item variants={staggerItem}>
        <h2 className="font-display text-[30px] leading-tight font-medium text-ink sm:text-[38px]">{title}</h2>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-muted">{message}</p>
      </Item>
      {onRetry && (
        <Item variants={staggerItem}>
          <button type="button" onClick={onRetry} className="btn-secondary mt-8">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
        </Item>
      )}
    </Group>
  );
}

// Lines of placeholder text, e.g. <SkeletonLines widths={["w-40", "w-24"]} />
export function SkeletonLines({ widths = ["w-40", "w-28"], className = "" }) {
  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden="true">
      {widths.map((w, i) => (
        <div key={i} className={`skeleton h-3.5 ${w}`} />
      ))}
    </div>
  );
}
