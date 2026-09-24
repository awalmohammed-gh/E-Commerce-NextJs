import { Loader2, Save, RotateCcw } from "lucide-react";
import { CARD_CLASS } from "@/components/admin/dashboard/DashboardStates";

// Same input styling as the Create Product form
const inputBase =
  "w-full min-w-0 font-utility text-sm text-[#1C1A17] bg-[#F7F4EE] border rounded-xl px-4 py-3 outline-none transition-all placeholder:text-[#8A6A52]/50 focus:bg-white focus:ring-4 disabled:opacity-60";
const inputOk =
  "border-[#E5DDD1] focus:border-[#1C1A17] focus:ring-[#1C1A17]/5";
const inputErr =
  "border-red-400 focus:border-red-500 focus:ring-red-500/5 bg-red-50/30";

const labelClass =
  "block font-utility text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2";

function FieldShell({ id, label, hint, error, children }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600 mt-1.5">{error}</p>
      ) : (
        hint && <p className="text-xs text-[#8A6A52] mt-1.5">{hint}</p>
      )}
    </div>
  );
}

export function TextField({
  id,
  label,
  hint,
  error,
  value,
  onChange,
  type = "text",
  ...props
}) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} ${error ? inputErr : inputOk}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </FieldShell>
  );
}

export function TextAreaField({ id, label, hint, error, value, onChange, ...props }) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        rows={4}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} resize-none ${error ? inputErr : inputOk}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </FieldShell>
  );
}

// Keeps the raw string while typing; the server parses and validates it
export function NumberField({ suffix, ...props }) {
  return (
    <div className="relative">
      <TextField type="number" inputMode="decimal" {...props} />
      {suffix && (
        <span className="absolute right-4 top-[38px] text-xs text-[#8A6A52] pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function Toggle({ id, label, description, checked, onChange, disabled, error }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-[#1C1A17] cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-xs text-[#8A6A52] mt-0.5">{description}</p>
        )}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={Boolean(checked)}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1C1A17]/10 ${
          checked ? "bg-[#1C1A17]" : "bg-[#E5DDD1]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
        <span className="sr-only">{checked ? "On" : "Off"}</span>
      </button>
    </div>
  );
}

export function ToggleList({ children }) {
  return <div className="divide-y divide-[#1C1A17]/5">{children}</div>;
}

/*
  Card wrapper for one settings section: title, description, content,
  and a footer with Discard / Save when onSave is given.
*/
export function SettingsCard({
  title,
  description,
  children,
  dirty = false,
  saving = false,
  onSave,
  onDiscard,
}) {
  return (
    <section className={`${CARD_CLASS} overflow-hidden`}>
      <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-5 border-b border-[#1C1A17]/5">
        <h2 className="text-lg font-semibold text-[#1C1A17]">{title}</h2>
        {description && (
          <p className="text-sm text-[#8A6A52] mt-1">{description}</p>
        )}
      </div>

      <div className="px-5 sm:px-7 py-5 sm:py-6">{children}</div>

      {onSave && (
        <div className="flex flex-wrap items-center justify-end gap-3 px-5 sm:px-7 py-4 bg-[#FAF8F4] border-t border-[#1C1A17]/5">
          {dirty && (
            <p className="mr-auto text-xs text-[#8A6A52]">Unsaved changes</p>
          )}
          <button
            type="button"
            onClick={onDiscard}
            disabled={!dirty || saving}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#4A463F] hover:text-[#1C1A17] px-4 py-2.5 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            Discard
          </button>
          <PrimaryButton onClick={onSave} disabled={!dirty} loading={saving}>
            <Save className="w-4 h-4" />
            Save Changes
          </PrimaryButton>
        </div>
      )}
    </section>
  );
}

export function PrimaryButton({ children, loading, disabled, type = "button", ...props }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className="inline-flex items-center justify-center gap-2 bg-[#1C1A17] text-[#F5F1EA] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#332F29] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </>
      ) : (
        children
      )}
    </button>
  );
}
