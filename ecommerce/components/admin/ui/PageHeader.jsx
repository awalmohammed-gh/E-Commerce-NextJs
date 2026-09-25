/*
  Top of every admin page: title, one line of context, and the page's
  primary actions. Actions wrap under the title on narrow screens.
*/
export default function PageHeader({ title, description, actions, children }) {
  return (
    <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.01em] text-ink sm:text-2xl">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
