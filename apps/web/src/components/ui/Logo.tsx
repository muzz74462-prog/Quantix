import Link from "next/link";

type LogoProps = { className?: string; size?: "sm" | "md" };

/**
 * Original QUANTIX mark: a "Q" built from horizontal stripes, a rising chart line
 * inside the counter, and an angled tail. Plus wordmark.
 */
export function Logo({ className = "", size = "md" }: LogoProps) {
  const mark = size === "sm" ? 22 : 28;
  return (
    <Link
      href="/"
      aria-label="QUANTIX home"
      className={`inline-flex items-center gap-2 text-white ${className}`}
    >
      <svg width={mark} height={mark} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="qx-grad" gradientUnits="userSpaceOnUse" x1="0" y1="3" x2="0" y2="20">
            <stop offset="0" stopColor="#2fbf71" />
            <stop offset="1" stopColor="#3b8bff" />
          </linearGradient>
          <clipPath id="qx-clip">
            <circle cx="11.5" cy="11.5" r="8.5" />
          </clipPath>
        </defs>

        <rect x="0.5" y="0.5" width="23" height="23" rx="6" className="fill-ink-700" />

        {/* Striped disc */}
        <g clipPath="url(#qx-clip)" stroke="url(#qx-grad)" strokeWidth="1.4">
          <line x1="2" y1="3.7" x2="21" y2="3.7" />
          <line x1="2" y1="6.1" x2="21" y2="6.1" />
          <line x1="2" y1="8.5" x2="21" y2="8.5" />
          <line x1="2" y1="10.9" x2="21" y2="10.9" />
          <line x1="2" y1="13.3" x2="21" y2="13.3" />
          <line x1="2" y1="15.7" x2="21" y2="15.7" />
          <line x1="2" y1="18.1" x2="21" y2="18.1" />
          <line x1="2" y1="20.5" x2="21" y2="20.5" />
        </g>

        {/* Counter (hole of the Q) */}
        <circle cx="11.5" cy="11.5" r="4.6" className="fill-ink-700" />

        {/* Rising chart line inside the counter */}
        <path
          d="M8.6 13.4l2.1-2.2 1.5 1.3 2.4-3"
          stroke="#ffffff"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Q tail */}
        <path d="M15.6 15.6L21 21" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="text-[17px] font-bold tracking-[0.06em]">QUANTIX</span>
    </Link>
  );
}