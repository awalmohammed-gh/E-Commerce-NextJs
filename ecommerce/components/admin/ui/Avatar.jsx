export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

// Initials in a neutral circle; decorative, the name is always shown beside it
export default function Avatar({ name, size = "sm" }) {
  const sizes = { sm: "h-8 w-8 text-[11px]", md: "h-10 w-10 text-xs" };

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-sand font-semibold text-ink-soft ${sizes[size]}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
