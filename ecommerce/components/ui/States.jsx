import Link from "next/link";
import { RotateCcw } from "lucide-react";

/*
  Empty and error states for the storefront. Each explains what
  happened and offers one useful next step.
*/
export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
  secondary,
  className = "",
}) {
  return (
    <div className={`flex flex-col items-center px-4 py-16 text-center sm:py-20 ${className}`}>
      {Icon && (
        <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-cream text-taupe">
          <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
        </span>
      )}
      <h2 className="font-display text-2xl font-medium text-ink sm:text-[28px]">{title}</h2>
      {message && <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">{message}</p>}

      {(actionLabel || secondary) && (
        <div className="mt-7 flex flex-col items-center gap-4 sm:flex-row">
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
        </div>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong.",
  message = "Please check your connection and try again.",
  onRetry,
  className = "",
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center px-4 py-16 text-center sm:py-20 ${className}`}
    >
      <h2 className="font-display text-2xl font-medium text-ink sm:text-[28px]">{title}</h2>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-7">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
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
