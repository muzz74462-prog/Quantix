import Link from "next/link";

type LogoProps = { className?: string; size?: "sm" | "md" };

/** Original QUANTIX mark: a rounded square with a rising/falling candle pair, plus wordmark. */
export function Logo({ className = "", size = "md" }: LogoProps) {
  const mark = size === "sm" ? 20 : 24;
  return (
    <Link
      href="/"
      aria-label="QUANTIX home"
      className={`inline-flex items-center gap-2 text-white ${className}`}
    >
      <svg width={mark} height={mark} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="22" height="22" rx="6" className="fill-ink-700" />
        <path d="M8 5v3M8 16v3M16 5v5M16 17v2" stroke="#6b7694" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="6" y="8" width="4" height="8" rx="1" fill="#2fbf71" />
        <rect x="14" y="10" width="4" height="7" rx="1" fill="#3b8bff" />
      </svg>
      <span className="text-[17px] font-bold tracking-[0.06em]">QUANTIX</span>
    </Link>
  );
}
