"use client";

import type { ReactNode } from "react";
import type { Market } from "@/types/trading";
import { badgeHue } from "@/lib/markets";

/**
 * Local, dependency-free flag + coin icons for the market list.
 * Every flag is drawn on a 20x20 square so it crops cleanly into a circle.
 */

const UnionJack = (
  <>
    <rect width="20" height="20" fill="#012169" />
    <path d="M0 0L20 20M0 20L20 0" stroke="#fff" strokeWidth="3" />
    <path d="M0 0L20 20M0 20L20 0" stroke="#c8102e" strokeWidth="1.2" />
    <rect x="8" width="4" height="20" fill="#fff" />
    <rect y="8" width="20" height="4" fill="#fff" />
    <rect x="8.8" width="2.4" height="20" fill="#c8102e" />
    <rect y="8.8" width="20" height="2.4" fill="#c8102e" />
  </>
);

const hStripes = (a: string, b: string, c: string): ReactNode => (
  <>
    <rect width="20" height="20" fill={b} />
    <rect width="20" height="6.67" fill={a} />
    <rect y="13.33" width="20" height="6.67" fill={c} />
  </>
);
const vStripes = (a: string, b: string, c: string): ReactNode => (
  <>
    <rect width="20" height="20" fill={b} />
    <rect width="6.67" height="20" fill={a} />
    <rect x="13.33" width="6.67" height="20" fill={c} />
  </>
);

const FLAGS: Record<string, ReactNode> = {
  US: (
    <>
      <rect width="20" height="20" fill="#fff" />
      {[0, 2, 4, 6].map((i) => (
        <rect key={i} y={i * 2.857} width="20" height="2.857" fill="#b22234" />
      ))}
      <rect width="11" height="11.43" fill="#3c3b6e" />
      {[[3, 3], [7, 3], [5, 5.7], [3, 8.4], [7, 8.4]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="0.6" fill="#fff" />
      ))}
    </>
  ),
  EU: (
    <>
      <rect width="20" height="20" fill="#039" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={10 + Math.cos(a) * 5.5} cy={10 + Math.sin(a) * 5.5} r="0.9" fill="#fc0" />;
      })}
    </>
  ),
  GB: UnionJack,
  JP: (
    <>
      <rect width="20" height="20" fill="#fff" />
      <circle cx="10" cy="10" r="5.5" fill="#bc002d" />
    </>
  ),
  AU: (
    <>
      <rect width="20" height="20" fill="#00247d" />
      <svg x="0" y="0" width="10" height="10" viewBox="0 0 20 20">{UnionJack}</svg>
      <circle cx="5" cy="15" r="1.7" fill="#fff" />
      <circle cx="15.5" cy="4.5" r="0.9" fill="#fff" />
      <circle cx="17.5" cy="10" r="0.9" fill="#fff" />
      <circle cx="14" cy="13" r="0.9" fill="#fff" />
      <circle cx="16" cy="17" r="0.9" fill="#fff" />
    </>
  ),
  NZ: (
    <>
      <rect width="20" height="20" fill="#00247d" />
      <svg x="0" y="0" width="10" height="10" viewBox="0 0 20 20">{UnionJack}</svg>
      {[[15, 4], [17.5, 9], [15, 15], [11.5, 10]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" fill="#cc142b" stroke="#fff" strokeWidth="0.3" />
      ))}
    </>
  ),
  CA: (
    <>
      <rect width="20" height="20" fill="#fff" />
      <rect width="5" height="20" fill="#d52b1e" />
      <rect x="15" width="5" height="20" fill="#d52b1e" />
      <polygon
        points="10,3.5 11,6.5 13,5.5 12.4,9 14.2,8.4 13.4,10.8 15,11.8 10.6,13 10.6,16.5 9.4,16.5 9.4,13 5,11.8 6.6,10.8 5.8,8.4 7.6,9 7,5.5 9,6.5"
        fill="#d52b1e"
      />
    </>
  ),
  CH: (
    <>
      <rect width="20" height="20" fill="#da291c" />
      <rect x="8.5" y="4.5" width="3" height="11" fill="#fff" />
      <rect x="4.5" y="8.5" width="11" height="3" fill="#fff" />
    </>
  ),
  EG: (
    <>
      {hStripes("#ce1126", "#fff", "#000")}
      <circle cx="10" cy="10" r="1.6" fill="#c09300" />
    </>
  ),
  IN: (
    <>
      {hStripes("#f93", "#fff", "#138808")}
      <circle cx="10" cy="10" r="2.2" fill="none" stroke="#000080" strokeWidth="0.5" />
    </>
  ),
  PK: (
    <>
      <rect width="20" height="20" fill="#01411c" />
      <rect width="5" height="20" fill="#fff" />
      <circle cx="12" cy="10" r="4.5" fill="#fff" />
      <circle cx="13.4" cy="9.2" r="3.8" fill="#01411c" />
      <circle cx="14.6" cy="7" r="1" fill="#fff" />
    </>
  ),
  BD: (
    <>
      <rect width="20" height="20" fill="#006a4e" />
      <circle cx="9" cy="10" r="5.5" fill="#f42a41" />
    </>
  ),
  BR: (
    <>
      <rect width="20" height="20" fill="#009739" />
      <polygon points="10,2 18.5,10 10,18 1.5,10" fill="#fedd00" />
      <circle cx="10" cy="10" r="4" fill="#012169" />
    </>
  ),
  TR: (
    <>
      <rect width="20" height="20" fill="#e30a17" />
      <circle cx="8" cy="10" r="4.6" fill="#fff" />
      <circle cx="9.2" cy="10" r="3.7" fill="#e30a17" />
      <circle cx="13" cy="10" r="1.2" fill="#fff" />
    </>
  ),
  MX: (
    <>
      {vStripes("#006847", "#fff", "#ce1126")}
      <circle cx="10" cy="10" r="1.7" fill="#8a6a2f" />
    </>
  ),
  ID: (
    <>
      <rect width="20" height="20" fill="#fff" />
      <rect width="20" height="10" fill="#e70011" />
    </>
  ),
  ZA: (
    <>
      <rect width="20" height="10" fill="#de3831" />
      <rect y="10" width="20" height="10" fill="#002395" />
      <path d="M0 1.5L8 10L0 18.5M8 10H20" fill="none" stroke="#fff" strokeWidth="4.6" />
      <path d="M0 1.5L8 10L0 18.5M8 10H20" fill="none" stroke="#007a4d" strokeWidth="2.6" />
      <polygon points="0,5.2 0,14.8 4.4,10" fill="#000" />
    </>
  ),
  SG: (
    <>
      <rect width="20" height="20" fill="#fff" />
      <rect width="20" height="10" fill="#ef3340" />
      <circle cx="6" cy="5" r="3.2" fill="#fff" />
      <circle cx="7.4" cy="5" r="2.8" fill="#ef3340" />
      <circle cx="10.5" cy="3.8" r="0.5" fill="#fff" />
      <circle cx="12" cy="5.4" r="0.5" fill="#fff" />
      <circle cx="10.8" cy="7" r="0.5" fill="#fff" />
    </>
  ),
  NO: (
    <>
      <rect width="20" height="20" fill="#ba0c2f" />
      <rect x="5.5" width="4" height="20" fill="#fff" />
      <rect y="8" width="20" height="4" fill="#fff" />
      <rect x="6.5" width="2" height="20" fill="#00205b" />
      <rect y="9" width="20" height="2" fill="#00205b" />
    </>
  ),
  SE: (
    <>
      <rect width="20" height="20" fill="#006aa7" />
      <rect x="6" width="3.5" height="20" fill="#fecc00" />
      <rect y="8.2" width="20" height="3.6" fill="#fecc00" />
    </>
  ),
  HK: (
    <>
      <rect width="20" height="20" fill="#de2910" />
      <circle cx="10" cy="10" r="3.6" fill="#fff" />
      <circle cx="10" cy="10" r="1.2" fill="#de2910" />
    </>
  ),
  DE: hStripes("#000", "#d00", "#ffce00"),
  FR: vStripes("#0055a4", "#fff", "#ef4135"),
  ES: (
    <>
      <rect width="20" height="20" fill="#f1bf00" />
      <rect width="20" height="5" fill="#aa151b" />
      <rect y="15" width="20" height="5" fill="#aa151b" />
    </>
  ),
  IT: vStripes("#009246", "#fff", "#ce2b37"),
};

const CURRENCY_FLAG: Record<string, string> = {
  EUR: "EU", USD: "US", GBP: "GB", JPY: "JP", AUD: "AU", CAD: "CA", CHF: "CH", NZD: "NZ", EGP: "EG",
  INR: "IN", PKR: "PK", BDT: "BD", BRL: "BR", TRY: "TR", MXN: "MX", IDR: "ID", ZAR: "ZA", SGD: "SG",
  NOK: "NO", SEK: "SE",
};

const INDEX_FLAG: Record<string, string> = {
  "US 500": "US", "US 100": "US", "Dow Jones 30": "US", "US Small Cap 2000": "US",
  "Germany 40": "DE", "UK 100": "GB", "Japan 225": "JP", "France 40": "FR", "Spain 35": "ES",
  "Italy 40": "IT", "Euro Stoxx 50": "EU", "Australia 200": "AU", "Hong Kong 50": "HK",
};

type Coin = { label: string; bg: string; fg?: string };
const COINS: Record<string, Coin> = {
  BTC: { label: "₿", bg: "#f7931a" },
  ETH: { label: "Ξ", bg: "#627eea" },
  LTC: { label: "Ł", bg: "#345d9d" },
  XRP: { label: "X", bg: "#23292f" },
  SOL: { label: "S", bg: "linear-gradient(135deg,#9945ff,#14f195)" },
  DOGE: { label: "Ð", bg: "#c2a633" },
  BNB: { label: "B", bg: "#f3ba2f", fg: "#1a1a1a" },
  ADA: { label: "A", bg: "#0033ad" },
  DOT: { label: "D", bg: "#e6007a" },
  AVAX: { label: "A", bg: "#e84142" },
  LINK: { label: "L", bg: "#2a5ada" },
  TRX: { label: "T", bg: "#ef0027" },
  TON: { label: "T", bg: "#0098ea" },
  BCH: { label: "B", bg: "#8dc351", fg: "#1a1a1a" },
  SHIB: { label: "S", bg: "#ffa409", fg: "#1a1a1a" },
};
const COMMODITIES: Record<string, Coin> = {
  Gold: { label: "Au", bg: "linear-gradient(135deg,#f6d365,#c9971c)", fg: "#3b2a00" },
  Silver: { label: "Ag", bg: "linear-gradient(135deg,#e5e7eb,#9ca3af)", fg: "#1f2937" },
  "Brent Oil": { label: "Oil", bg: "#1f2937" },
  "WTI Oil": { label: "Oil", bg: "#374151" },
  "Natural Gas": { label: "Gas", bg: "#0e7490" },
  Copper: { label: "Cu", bg: "linear-gradient(135deg,#d98a5a,#a0522d)" },
  Platinum: { label: "Pt", bg: "linear-gradient(135deg,#d1d5db,#6b7280)", fg: "#111827" },
  Palladium: { label: "Pd", bg: "linear-gradient(135deg,#cbd5e1,#64748b)", fg: "#111827" },
  Wheat: { label: "Wh", bg: "#b7791f" },
  Corn: { label: "Cn", bg: "#d69e2e", fg: "#1a1a1a" },
  Coffee: { label: "Cf", bg: "#6f4e37" },
  Sugar: { label: "Su", bg: "#e2e8f0", fg: "#1f2937" },
  Cocoa: { label: "Co", bg: "#5b3a29" },
};

function Flag({ code, size }: { code: string; size: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="inline-block shrink-0 overflow-hidden rounded-full bg-ink-700 ring-1 ring-black/40"
    >
      <svg viewBox="0 0 20 20" width="100%" height="100%" className="block" focusable="false">
        {FLAGS[code]}
      </svg>
    </span>
  );
}

function Badge({ label, bg, fg = "#fff", size }: Coin & { size: number }) {
  return (
    <span
      style={{ width: size, height: size, fontSize: Math.round(size * (label.length > 1 ? 0.36 : 0.5)), background: bg, color: fg }}
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold ring-1 ring-black/40"
    >
      {label}
    </span>
  );
}

export function MarketIcon({ market, size = 24 }: { market: Market; size?: number }) {
  const symbol = market.name.replace(/\s*\(OTC\)$/, "");
  const [base, quote] = symbol.split("/");

  // Forex + OTC: two overlapping country flags.
  if ((market.category === "forex" || market.category === "otc") && quote) {
    const f1 = CURRENCY_FLAG[base];
    const f2 = CURRENCY_FLAG[quote];
    if (f1 && f2) {
      const d = Math.round(size * 0.78);
      return (
        <span aria-hidden="true" style={{ width: Math.round(size * 1.36), height: size }} className="relative inline-block shrink-0">
          <span className="absolute left-0 top-0"><Flag code={f1} size={d} /></span>
          <span className="absolute bottom-0 right-0"><Flag code={f2} size={d} /></span>
        </span>
      );
    }
  }

  let content: ReactNode = null;
  if (market.category === "indices" && INDEX_FLAG[symbol]) content = <Flag code={INDEX_FLAG[symbol]} size={size} />;
  else if (market.category === "crypto" && COINS[base]) content = <Badge {...COINS[base]} size={size} />;
  else if (market.category === "commodities" && COMMODITIES[symbol]) content = <Badge {...COMMODITIES[symbol]} size={size} />;

  if (!content) {
    // Stocks / anything unmapped: generated letter badge.
    const hue = badgeHue(market);
    content = (
      <span
        style={{
          width: size,
          height: size,
          fontSize: Math.round(size * 0.38),
          background: `linear-gradient(135deg, hsl(${hue} 55% 38%), hsl(${(hue + 40) % 360} 55% 28%))`,
        }}
        className="inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white/90"
      >
        {market.badge}
      </span>
    );
  }
  return (
    <span aria-hidden="true" className="inline-flex shrink-0">
      {content}
    </span>
  );
}
