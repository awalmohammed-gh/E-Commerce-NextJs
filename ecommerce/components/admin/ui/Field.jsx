import { ChevronDown } from "lucide-react";

/*
  Form controls. 40px tall (44px on phones for touch), white fill,
  hairline border that darkens on hover and turns ink on focus.
  aria-invalid switches the border to the danger colour.
*/
export const CONTROL =
  "block w-full min-w-0 rounded-md border border-line bg-white px-3 text-sm text-ink transition-colors outline-none placeholder:text-muted/60 hover:border-ink/30 focus:border-ink focus-visible:outline-none focus:ring-2 focus:ring-ink/10 disabled:cursor-not-allowed disabled:bg-paper disabled:opacity-70 aria-invalid:border-danger aria-invalid:focus:ring-danger/15";

export const INPUT = `${CONTROL} h-11 sm:h-10`;
export const TEXTAREA = `${CONTROL} py-2.5 leading-relaxed`;
export const SELECT = `${CONTROL} h-11 cursor-pointer appearance-none pr-9 sm:h-10`;

export const LABEL = "mb-1.5 block text-[13px] font-medium text-ink";

/*
  Label + control + hint/error. The control is passed as children and
  should use the same id, plus aria-describedby={describedBy(id, …)}.
*/
export function Field({ id, label, required = false, optional = false, hint, error, className = "", children }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className={LABEL}>
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden="true">
            *
          </span>
        )}
        {optional && <span className="ml-1.5 font-normal text-muted">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export const describedBy = (id, { error, hint }) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

export function Select({ className = "", children, ...props }) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <select className={SELECT} {...props}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
    </div>
  );
}

// Input with a fixed prefix such as a currency code
export function PrefixInput({ prefix, className = "", ...props }) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[13px] text-muted">
        {prefix}
      </span>
      <input className={`${INPUT} pl-12 tabular-nums`} {...props} />
    </div>
  );
}
