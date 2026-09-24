export const CURRENCY_CODE = "GHS";

const numberFormatter = new Intl.NumberFormat("en-GH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-GH", {
  notation: "compact",
  maximumFractionDigits: 1,
});

// 1250 -> "GHS 1,250.00"
export function formatCurrency(amount) {
  return `${CURRENCY_CODE} ${numberFormatter.format(Number(amount) || 0)}`;
}

// Storefront style: 1250 -> "GH₵1,250", 99.5 -> "GH₵99.50"
export function formatCedis(amount) {
  const n = Number(amount) || 0;
  return `GH₵${n.toLocaleString("en-GH", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

// 12500 -> "GHS 12.5K" (for chart axes where space is tight)
export function formatCurrencyCompact(amount) {
  return `${CURRENCY_CODE} ${compactFormatter.format(Number(amount) || 0)}`;
}
