import Link from "next/link";

// The ELEOKA wordmark: ink "ELE", rose "OKA" (the existing brand mark)
export default function Logo({ className = "", onClick, tone = "dark" }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="Eleoka home"
      className={`inline-flex items-baseline text-[22px] font-semibold tracking-[0.14em] sm:text-2xl ${className}`}
    >
      <span className={tone === "light" ? "text-cream" : "text-ink"}>ELE</span>
      <span className="text-rose">OKA</span>
    </Link>
  );
}
