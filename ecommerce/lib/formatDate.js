// "2026-09-24T10:00:00Z" -> "24 Sep 2026"
export function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-GH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
