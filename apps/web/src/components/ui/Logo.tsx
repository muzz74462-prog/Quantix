import Link from "next/link";

type LogoProps = { className?: string; size?: "sm" | "md" };

/** Original QUANTIX mark: five vertical bars forming a rising chart, plus wordmark. */
export function Logo({ className = "", size = "md" }: LogoProps) {
  const mark = size === "sm" ? 24 : 30;
  return (
    <Link
      href="/"
      aria-label="QUANTIX home"
      className={`inline-flex items-center gap-2.5 text-white ${className}`}
    >
      <svg width={mark} height={mark} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="qx-bars" gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="22">
            <stop offset="0" stopColor="#35d482" />
            <stop offset="1" stopColor="#2f7bff" />
          </linearGradient>
        </defs>
        <g stroke="url(#qx-bars)" strokeWidth="2.8" strokeLinecap="round">
          <line x1="3.5" y1="16" x2="3.5" y2="20" />
          <line x1="8" y1="11" x2="8" y2="20" />
          <line x1="12.5" y1="14" x2="12.5" y2="20" />
          <line x1="17" y1="7" x2="17" y2="20" />
          <line x1="21.5" y1="4" x2="21.5" y2="20" />
        </g>
      </svg>
      <span className="text-[17px] font-extrabold tracking-[0.08em]">QUANTIX</span>
    </Link>
  );
}