import Link from "next/link";

type LogoProps = { className?: string; size?: "sm" | "md" };

/** Original QUANTIX mark: gradient tile, bold "Q" ring with a rising arrow inside, plus wordmark. */
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
          <linearGradient id="qx-tile" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2fbf71" />
            <stop offset="1" stopColor="#2f7bff" />
          </linearGradient>
        </defs>

        {/* Tile */}
        <rect width="24" height="24" rx="7" fill="url(#qx-tile)" />

        {/* Q ring */}
        <circle cx="11.2" cy="11.2" r="6.2" stroke="#ffffff" strokeWidth="2.4" />

        {/* Rising arrow inside the ring */}
        <path
          d="M8.4 13l2.2-2.4 1.6 1.4 2.4-3.1"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Q tail */}
        <path d="M15.8 15.8L19.6 19.6" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      <span className="text-[17px] font-extrabold tracking-[0.08em]">QUANTIX</span>
    </Link>
  );
}