import Link from "next/link";

// The ELEOKA wordmark: ink "ELE", terracotta "OKA" (the existing brand mark)
export default function Logo({ className = "", onClick, tone = "dark" }) {
  const light = tone === "light";

  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="Eleoka home"
      className={`inline-flex items-baseline text-[21px] font-bold tracking-[0.2em] sm:text-[23px] ${className}`}
    >
      <span className={`transition-colors duration-500 ${light ? "text-paper" : "text-ink"}`}>ELE</span>
      <span className={`transition-colors duration-500 ${light ? "text-terracotta-light" : "text-terracotta"}`}>OKA</span>
    </Link>
  );
}
