"use client";

import { Check, Loader2 } from "lucide-react";

export function AddressLines({ address }) {
  const cityLine = [address.city, address.region].filter(Boolean).join(", ");

  return (
    <address className="text-[15px] leading-relaxed text-ink-soft not-italic">
      <span className="block text-ink">{address.fullName}</span>
      <span className="block text-[14px] text-muted">{address.phone}</span>
      <span className="mt-2 block">{address.address}</span>
      {cityLine && <span className="block">{cityLine}</span>}
      <span className="block">
        {address.country}
        {address.postalCode && ` · ${address.postalCode}`}
      </span>
      {address.additionalInfo && (
        <span className="mt-2 block text-[14px] text-muted">{address.additionalInfo}</span>
      )}
    </address>
  );
}

export function AddressLabel({ address }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] font-medium tracking-[0.08em] text-ink uppercase">{address.label}</span>
      {address.isDefault && (
        <span className="badge bg-ink text-cream">
          <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
          Default
        </span>
      )}
    </div>
  );
}

/*
  Saved-address card for the addresses page. `pending` is the action
  currently running for this card ("default" | "delete" | null).
*/
export default function AddressCard({ address, pending, disabled, onEdit, onDelete, onSetDefault }) {
  const busy = Boolean(pending) || disabled;

  return (
    <article
      className={`flex flex-col rounded-card border bg-white p-5 transition-opacity sm:p-6 ${
        address.isDefault ? "border-ink" : "border-line"
      } ${pending === "delete" ? "opacity-50" : ""}`}
      aria-label={`${address.label} address${address.isDefault ? ", default" : ""}`}
    >
      <AddressLabel address={address} />

      <div className="mt-4 flex-1">
        <AddressLines address={address} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-[14px]">
        <button type="button" onClick={onEdit} disabled={busy} className="min-h-10 text-ink link disabled:opacity-50">
          Edit
        </button>

        {!address.isDefault && (
          <button
            type="button"
            onClick={onSetDefault}
            disabled={busy}
            className="inline-flex min-h-10 items-center gap-1.5 text-ink link disabled:opacity-50"
          >
            {pending === "default" && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            {pending === "default" ? "Saving" : "Set as default"}
          </button>
        )}

        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="ml-auto inline-flex min-h-10 items-center gap-1.5 text-muted underline decoration-muted/40 underline-offset-4 transition-colors hover:text-danger hover:decoration-danger disabled:opacity-50"
        >
          {pending === "delete" && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
          {pending === "delete" ? "Deleting" : "Delete"}
        </button>
      </div>
    </article>
  );
}

export function AddressCardSkeleton() {
  return (
    <div className="space-y-3 rounded-card border border-line bg-white p-6" aria-hidden="true">
      <div className="skeleton h-3.5 w-20" />
      <div className="skeleton mt-5 h-4 w-40" />
      <div className="skeleton h-3 w-28" />
      <div className="skeleton h-3 w-52" />
      <div className="skeleton h-3 w-36" />
      <div className="skeleton mt-6 h-9 w-full" />
    </div>
  );
}
