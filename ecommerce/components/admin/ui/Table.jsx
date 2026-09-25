/*
  Table styling shared by every admin list. Rows are separated by a
  hairline, no vertical borders; headers are small and quiet.
*/
export const TABLE = "w-full border-collapse text-left text-sm";
export const TH =
  "border-y border-line bg-paper px-3 py-2 text-xs font-medium whitespace-nowrap text-muted first:pl-4 last:pr-4 sm:first:pl-5 sm:last:pr-5";
export const TD = "border-b border-line px-3 py-2.5 align-middle first:pl-4 last:pr-4 sm:first:pl-5 sm:last:pr-5";
export const TR = "transition-colors hover:bg-ink/2 [&:last-child>td]:border-b-0";
