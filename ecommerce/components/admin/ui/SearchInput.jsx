"use client";

import { Search, X } from "lucide-react";
import { INPUT } from "./Field";

/*
  Filters data already on the page, so results update as you type.
  Escape or the clear button empties it.
*/
export default function SearchInput({ value, onChange, placeholder, label, className = "" }) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.preventDefault();
            onChange("");
          }
        }}
        placeholder={placeholder}
        aria-label={label || placeholder}
        className={`${INPUT} pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-1.5 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
