import Image from "next/image";
import Link from "next/link";
import { PackageCheck, Package } from "lucide-react";
import { LOW_STOCK_THRESHOLD, stockLevel } from "@/lib/orderStatus";
import { Card, CardHeader, CardLink, CARD_X } from "@/components/admin/ui/Card";
import { StockBadge } from "@/components/admin/ui/Badge";
import { EmptyState, ErrorState, Skeleton } from "@/components/admin/ui/States";

const MAX_ROWS = 5;

/*
  Products that are out of stock or running low, out-of-stock first.
  Built from the admin product list (/api/list), so it's real stock.
*/
export default function StockAlerts({ products, loading = false, error, onRetry }) {
  const flagged = (products || [])
    .filter((p) => ["out", "low"].includes(stockLevel(p.stock)))
    .sort((a, b) => Number(a.stock) - Number(b.stock));

  const outCount = flagged.filter((p) => stockLevel(p.stock) === "out").length;

  return (
    <Card aria-labelledby="stock-alerts-title">
      <CardHeader
        id="stock-alerts-title"
        title="Stock alerts"
        description={
          flagged.length
            ? `${outCount} out of stock, ${flagged.length - outCount} running low`
            : `Products with ${LOW_STOCK_THRESHOLD} or fewer left`
        }
        action={flagged.length > 0 && <CardLink href="/admin/list?stock=attention">Review</CardLink>}
      />

      {loading ? (
        <div className={`${CARD_X} space-y-3 pb-5`}>
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState compact title="Couldn't check stock" message={error} onRetry={onRetry} />
      ) : flagged.length === 0 ? (
        <EmptyState
          compact
          icon={PackageCheck}
          title="Stock looks healthy"
          message={`Every product has more than ${LOW_STOCK_THRESHOLD} in stock.`}
        />
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {flagged.slice(0, MAX_ROWS).map((product) => (
            <li key={product._id} className={`flex items-center gap-3 ${CARD_X} py-2.5`}>
              <div className="relative h-10 w-9 shrink-0 overflow-hidden rounded bg-paper">
                {product.images?.[0] ? (
                  <Image src={product.images[0]} alt="" fill sizes="36px" className="object-cover" />
                ) : (
                  <Package className="m-auto mt-3 h-4 w-4 text-muted" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/edit-product/${product._id}`}
                  className="block truncate rounded-sm text-sm text-ink underline decoration-ink/20 underline-offset-4 hover:decoration-ink"
                >
                  {product.name}
                </Link>
                <p className="truncate text-xs text-muted">{product.category}</p>
              </div>
              <StockBadge stock={product.stock} />
            </li>
          ))}
          {flagged.length > MAX_ROWS && (
            <li className={`${CARD_X} py-2.5 text-xs text-muted`}>
              And {flagged.length - MAX_ROWS} more
            </li>
          )}
        </ul>
      )}
    </Card>
  );
}
