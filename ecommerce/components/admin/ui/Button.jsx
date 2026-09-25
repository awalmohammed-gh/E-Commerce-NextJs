import Link from "next/link";
import { Loader2 } from "lucide-react";

/*
  Admin buttons. One shape (6px radius, 36px tall, 40px on touch) and
  four intents. Pass href to render a Link with the same styling.
*/
const BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,transform] duration-150 select-none active:scale-[0.98] disabled:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const VARIANTS = {
  primary: "bg-ink text-white hover:bg-ink-hover",
  secondary: "border border-line bg-white text-ink hover:border-ink/30 hover:bg-paper",
  ghost: "text-ink-soft hover:bg-ink/5 hover:text-ink",
  danger: "bg-danger text-white hover:bg-danger/90",
  "danger-outline": "border border-danger/30 bg-white text-danger hover:bg-danger-tint",
};

const SIZES = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 sm:h-9",
  icon: "h-10 w-10 sm:h-9 sm:w-9",
};

export function buttonClass({ variant = "secondary", size = "md", className = "" } = {}) {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}

export default function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  loadingText,
  icon: Icon,
  href,
  className = "",
  children,
  disabled,
  type = "button",
  ...props
}) {
  const classes = buttonClass({ variant, size, className });
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  const content = (
    <>
      {loading ? (
        <Loader2 className={`${iconSize} animate-spin`} aria-hidden="true" />
      ) : (
        Icon && <Icon className={iconSize} aria-hidden="true" />
      )}
      {loading && loadingText ? loadingText : children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </button>
  );
}
