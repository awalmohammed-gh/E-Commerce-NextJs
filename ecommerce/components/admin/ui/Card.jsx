import Link from "next/link";

/*
  Panels: white surface, 1px hairline, 8px radius, no shadow.
  Horizontal padding is 16px on phones and 20px from sm up, everywhere.
*/
export const CARD = "rounded-lg border border-line bg-white";
export const CARD_X = "px-4 sm:px-5";

export function Card({ as: Tag = "section", className = "", children, ...props }) {
  return (
    <Tag className={`${CARD} ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, description, action, id, border = false }) {
  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-x-4 gap-y-2 ${CARD_X} pt-4 ${
        border ? "border-b border-line pb-4" : "pb-3"
      }`}
    >
      <div className="min-w-0">
        <h2 id={id} className="text-[15px] font-semibold text-ink">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

// Small "View all" style link used in card headers
export function CardLink({ href, children }) {
  return (
    <Link
      href={href}
      className="rounded-sm text-[13px] font-medium text-ink-soft underline decoration-ink/25 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
    >
      {children}
    </Link>
  );
}
