import { SearchX } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/ui/States";

// Standard catalogue grid: 2 columns on phones, 3 on tablets/laptops, 4 on wide screens
export const PRODUCT_GRID =
  "grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4 lg:gap-x-6 lg:gap-y-12";

// Placeholder cards shown while products load (never a premature "no products")
export function ProductGridSkeleton({ count = 4, className = PRODUCT_GRID }) {
  return (
    <div className={className} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} aria-hidden="true">
          <div className="skeleton aspect-3/4 w-full rounded-xs" />
          <div className="mt-3 space-y-2">
            <div className="skeleton h-3.5 w-4/5" />
            <div className="skeleton h-3.5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductsError({ message = "We couldn't load these products.", onRetry }) {
  return (
    <ErrorState
      className="col-span-full"
      title="Something went wrong."
      message={`${message} Please check your connection and try again.`}
      onRetry={onRetry}
    />
  );
}

export function ProductsEmpty({ title = "Nothing here yet.", message, action }) {
  return (
    <EmptyState
      className="col-span-full"
      icon={SearchX}
      title={title}
      message={message}
      secondary={action}
    />
  );
}
