import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "./Button";

export function Skeleton({ className = "", style }) {
  return <div className={`animate-pulse rounded bg-ink/7 ${className}`} style={style} aria-hidden="true" />;
}

/*
  Explains an empty list and, where it helps, offers the next step.
  compact: tighter padding for use inside a card section.
*/
export function EmptyState({ icon: Icon, title, message, action, compact = false }) {
  return (
    <div
      className={`flex flex-col items-center text-center ${compact ? "px-4 py-8" : "px-6 py-12"}`}
    >
      {Icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper">
          <Icon className="h-[18px] w-[18px] text-muted" aria-hidden="true" />
        </div>
      )}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {message && <p className="mt-1 max-w-sm text-[13px] text-muted">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// A section that failed to load, with a way to try again
export function ErrorState({ title = "Something went wrong", message, onRetry, retrying = false, compact = false }) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center text-center ${compact ? "px-4 py-8" : "px-6 py-12"}`}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-danger-tint">
        <AlertCircle className="h-[18px] w-[18px] text-danger" aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {message && <p className="mt-1 max-w-sm text-[13px] text-muted">{message}</p>}
      {onRetry && (
        <Button className="mt-4" icon={RefreshCw} loading={retrying} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

// One-line notice above content (e.g. a refresh failed but old data is still shown)
export function InlineAlert({ tone = "danger", children, action }) {
  const tones = {
    danger: "border-danger/25 bg-danger-tint text-danger",
    warning: "border-warning/25 bg-warning-tint text-warning",
  };

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border px-3.5 py-2.5 text-[13px] ${tones[tone]}`}
    >
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">{children}</span>
      {action}
    </div>
  );
}

/*
  Map a failed request to something an admin can act on, instead of
  raw technical text. Server messages written for people are kept.
*/
export function friendlyError(error, fallback = "Something went wrong. Please try again.") {
  if (error?.code === "ERR_NETWORK" || error?.message === "Failed to fetch") {
    return "Can't reach the server. Check your connection and try again.";
  }
  const status = error?.response?.status ?? error?.status;
  if (status >= 500) return fallback;
  return error?.response?.data?.message || fallback;
}
