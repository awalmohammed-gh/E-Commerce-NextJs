import { RotateCcw } from "lucide-react";
import Button from "@/components/admin/ui/Button";
import { Card, CardHeader, CARD_X } from "@/components/admin/ui/Card";
import { Field, INPUT, TEXTAREA, describedBy } from "@/components/admin/ui/Field";

/*
  Settings form controls. Thin wrappers over the admin field primitives
  that take (value, onChange(value)) so each settings section stays short.
*/
export function TextField({ id, label, hint, error, value, onChange, type = "text", suffix, ...props }) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${INPUT} ${suffix ? "pr-16" : ""}`}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, { error, hint })}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[13px] text-muted">
            {suffix}
          </span>
        )}
      </div>
    </Field>
  );
}

export function TextAreaField({ id, label, hint, error, value, onChange, ...props }) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        rows={4}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${TEXTAREA} resize-y`}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, { error, hint })}
        {...props}
      />
    </Field>
  );
}

// Keeps the raw string while typing; the server parses and validates it
export function NumberField(props) {
  return <TextField type="number" inputMode="decimal" {...props} />;
}

export function Toggle({ id, label, description, checked, onChange, disabled, error }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
        {error && <p className="mt-1 text-[13px] text-danger">{error}</p>}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={Boolean(checked)}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative mt-0.5 h-6 w-10 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
          checked ? "bg-ink" : "bg-ink/20"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
        <span className="sr-only">{checked ? "On" : "Off"}</span>
      </button>
    </div>
  );
}

export function ToggleList({ children }) {
  return <div className="divide-y divide-line">{children}</div>;
}

/*
  One settings section: title, description, content, and a footer with
  Discard / Save when onSave is given.
*/
export function SettingsCard({ title, description, children, dirty = false, saving = false, onSave, onDiscard }) {
  return (
    <Card>
      <CardHeader title={title} description={description} border />

      <div className={`${CARD_X} py-4 sm:py-5`}>{children}</div>

      {onSave && (
        <div className={`flex flex-wrap items-center justify-end gap-2 border-t border-line bg-paper ${CARD_X} py-3`}>
          {dirty && <p className="mr-auto text-[13px] text-warning">Unsaved changes</p>}
          <Button variant="ghost" icon={RotateCcw} onClick={onDiscard} disabled={!dirty || saving}>
            Discard
          </Button>
          <PrimaryButton onClick={onSave} disabled={!dirty} loading={saving}>
            Save changes
          </PrimaryButton>
        </div>
      )}
    </Card>
  );
}

export function PrimaryButton({ children, loading, disabled, type = "button", ...props }) {
  return (
    <Button variant="primary" type={type} loading={loading} loadingText="Saving..." disabled={disabled} {...props}>
      {children}
    </Button>
  );
}
