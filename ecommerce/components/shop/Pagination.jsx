import { ChevronLeft, ChevronRight } from "lucide-react";

// Page numbers with the first, last and neighbours of the current page
function pageList(current, total) {
  const pages = [];
  for (let n = 1; n <= total; n++) {
    if (n === 1 || n === total || Math.abs(n - current) <= 1) pages.push(n);
    else if (pages[pages.length - 1] !== "gap") pages.push("gap");
  }
  return pages;
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const arrow =
    "flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream disabled:pointer-events-none disabled:opacity-30";

  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-1 border-t border-line pt-8">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} className={arrow} aria-label="Previous page">
        <ChevronLeft className="h-4.5 w-4.5" />
      </button>

      {pageList(page, totalPages).map((n, i) =>
        n === "gap" ? (
          <span key={`gap-${i}`} className="flex h-11 w-8 items-center justify-center text-muted" aria-hidden="true">
            &hellip;
          </span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-current={n === page ? "page" : undefined}
            aria-label={`Page ${n}`}
            className={`flex h-11 min-w-11 items-center justify-center rounded-full px-2 text-[15px] transition-colors ${
              n === page ? "bg-ink text-cream" : "text-ink-soft hover:bg-cream"
            }`}
          >
            {n}
          </button>
        ),
      )}

      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages} className={arrow} aria-label="Next page">
        <ChevronRight className="h-4.5 w-4.5" />
      </button>
    </nav>
  );
}
