"use client";

/*
  One settings section: title and explanation on the left from lg,
  the controls on the right. Sections are separated by hairlines.
*/
export function SettingsCard({ title, description, children }) {
  const id = `settings-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section
      aria-labelledby={id}
      className="grid grid-cols-1 gap-6 border-t border-line py-10 first:border-t-0 first:pt-0 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12"
    >
      <div>
        <h2 id={id} className="font-display text-2xl text-ink">
          {title}
        </h2>
        {description && <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

// Labelled input with hint/error, in the storefront field style
export default function SettingsField({ id, label, error, hint, trailing, icon: _icon, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? `${id}-note` : undefined}
          className={`field read-only:border-transparent read-only:bg-cream read-only:text-ink-soft ${trailing ? "pr-12" : ""}`}
          {...inputProps}
        />
        {trailing && <div className="absolute top-1/2 right-1 -translate-y-1/2">{trailing}</div>}
      </div>
      {(error || hint) && (
        <p id={`${id}-note`} className={error ? "field-error" : "field-hint"}>
          {error || hint}
        </p>
      )}
    </div>
  );
}
