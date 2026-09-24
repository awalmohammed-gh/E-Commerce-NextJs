import { AlertCircle, RefreshCw } from "lucide-react";

export const CARD_CLASS =
  "bg-white rounded-3xl border border-[#1C1A17]/5 shadow-[0_1px_2px_rgba(28,26,23,0.04)]";

export function Skeleton({ className = "", style }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#1C1A17]/6 ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
      <div>
        <h2 className="text-base font-semibold text-[#1C1A17]">{title}</h2>
        {subtitle && <p className="text-xs text-[#8A6A52] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="py-12 px-6 flex flex-col items-center gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-[#F7F4EE] flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#8A6A52]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#1C1A17]">{title}</p>
        {message && <p className="text-xs text-[#8A6A52] mt-1">{message}</p>}
      </div>
    </div>
  );
}

export function SectionError({ message, onRetry }) {
  return (
    <div className="py-12 px-6 flex flex-col items-center gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-5 h-5 text-red-600" />
      </div>
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && <RetryButton onClick={onRetry} />}
    </div>
  );
}

export function RetryButton({ onClick, loading = false, label = "Try again" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 bg-[#F7F4EE] border border-[#E5DDD1] hover:bg-white hover:border-[#1C1A17] text-[#1C1A17] px-5 py-2.5 rounded-full text-sm transition-colors disabled:opacity-60"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      {label}
    </button>
  );
}
