import type { Market, MarketCategory, Timeframe } from "@/types/trading";

export const CATEGORY_LABELS: Record<MarketCategory, string> = {
  forex: "Forex",
  otc: "OTC",
  commodities: "Commodities",
  crypto: "Crypto",
  indices: "Indices",
  stocks: "Stocks",
};

export const CATEGORY_ORDER: MarketCategory[] = ["forex", "otc", "commodities", "crypto", "indices", "stocks"];

export const TIMEFRAMES: { id: Timeframe; seconds: number }[] = [
  { id: "1m", seconds: 60 },
  { id: "5m", seconds: 300 },
  { id: "15m", seconds: 900 },
  { id: "30m", seconds: 1800 },
  { id: "1h", seconds: 3600 },
  { id: "4h", seconds: 14400 },
  { id: "1d", seconds: 86400 },
];

export const timeframeSeconds = (tf: Timeframe) => TIMEFRAMES.find((t) => t.id === tf)!.seconds;

function make(
  category: MarketCategory,
  symbol: string,
  assetType: string,
  payout: number,
  basePrice: number,
  decimals: number,
  volatility: number,
  suffix = "",
  badge?: string,
): Market {
  const name = suffix ? `${symbol} (${suffix})` : symbol;
  return {
    id: `${category}:${symbol}`.replace(/[^A-Za-z0-9:]/g, ""),
    name,
    category,
    assetType,
    payout,
    basePrice,
    decimals,
    volatility,
    badge: badge ?? symbol.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase(),
  };
}

const fx = (s: string, p: number, price: number, d = 5) =>
  make("forex", s, "Currency pair", p, price, d, 0.00022);
const otc = (s: string, p: number, price: number, d = 5) =>
  make("otc", s, "Currency pair · OTC", p, price, d, 0.00028, "OTC");

/**
 * Sandbox market catalogue. Base prices are ILLUSTRATIVE starting points for the
 * simulated feed and are not real quotes. Payouts are demo values.
 */
export const MARKETS: Market[] = [
  fx("EUR/USD", 87, 1.085),
  fx("GBP/USD", 86, 1.27),
  fx("USD/JPY", 85, 151.2, 3),
  fx("USD/CHF", 84, 0.885),
  fx("AUD/USD", 86, 0.655),
  fx("USD/CAD", 88, 1.36),
  fx("NZD/USD", 84, 0.6),
  fx("EUR/GBP", 83, 0.855),
  fx("EUR/JPY", 85, 164.1, 3),
  fx("GBP/JPY", 84, 192.0, 3),
  fx("AUD/JPY", 83, 99.0, 3),
  fx("CHF/JPY", 82, 170.8, 3),
  fx("EUR/CHF", 82, 0.96),
  fx("EUR/AUD", 81, 1.655),
  fx("AUD/CAD", 82, 0.89),
  fx("CAD/JPY", 81, 111.2, 3),

  otc("EUR/USD", 92, 1.085),
  otc("GBP/USD", 91, 1.27),
  otc("USD/JPY", 90, 151.2, 3),
  otc("AUD/CHF", 88, 0.58),
  otc("USD/EGP", 93, 48.5, 4),
  otc("USD/CAD", 90, 1.36),
  otc("EUR/GBP", 89, 0.855),
  otc("NZD/USD", 89, 0.6),
  otc("AUD/USD", 90, 0.655),

  make("commodities", "Gold", "Commodity", 82, 2350, 2, 0.00035),
  make("commodities", "Silver", "Commodity", 80, 29.5, 3, 0.0005),
  make("commodities", "Brent Oil", "Commodity", 80, 82.5, 2, 0.0006),
  make("commodities", "WTI Oil", "Commodity", 80, 78.4, 2, 0.0006),
  make("commodities", "Natural Gas", "Commodity", 78, 2.1, 3, 0.001),
  make("commodities", "Copper", "Commodity", 78, 4.4, 4, 0.0005),

  make("crypto", "BTC/USD", "Cryptocurrency", 85, 65000, 2, 0.0009),
  make("crypto", "ETH/USD", "Cryptocurrency", 84, 3200, 2, 0.001),
  make("crypto", "LTC/USD", "Cryptocurrency", 80, 82, 2, 0.0012),
  make("crypto", "XRP/USD", "Cryptocurrency", 80, 0.52, 4, 0.0012),
  make("crypto", "SOL/USD", "Cryptocurrency", 82, 150, 2, 0.0014),
  make("crypto", "DOGE/USD", "Cryptocurrency", 78, 0.16, 5, 0.0016),

  make("indices", "US 500", "Index", 82, 5200, 2, 0.0003),
  make("indices", "US 100", "Index", 82, 18200, 2, 0.0004),
  make("indices", "Dow Jones 30", "Index", 81, 39000, 2, 0.0003),
  make("indices", "Germany 40", "Index", 80, 18100, 2, 0.0003),
  make("indices", "UK 100", "Index", 80, 8100, 2, 0.0003),
  make("indices", "Japan 225", "Index", 80, 39500, 2, 0.0004),

  make("stocks", "AAPL", "Stock", 78, 190, 2, 0.0006, "", "AA"),
  make("stocks", "MSFT", "Stock", 78, 420, 2, 0.0006, "", "MS"),
  make("stocks", "TSLA", "Stock", 76, 175, 2, 0.0012, "", "TS"),
  make("stocks", "AMZN", "Stock", 77, 180, 2, 0.0007, "", "AM"),
  make("stocks", "GOOGL", "Stock", 77, 165, 2, 0.0006, "", "GO"),
  make("stocks", "NVDA", "Stock", 76, 900, 2, 0.001, "", "NV"),

  // ---- More forex ----
  fx("GBP/CHF", 82, 1.125),
  fx("GBP/AUD", 81, 1.94),
  fx("GBP/CAD", 81, 1.727),
  fx("GBP/NZD", 80, 2.117),
  fx("EUR/CAD", 82, 1.476),
  fx("EUR/NZD", 80, 1.81),
  fx("AUD/NZD", 81, 1.093),
  fx("AUD/CHF", 82, 0.58),
  fx("NZD/JPY", 81, 90.7, 3),
  fx("NZD/CAD", 80, 0.816),
  fx("NZD/CHF", 80, 0.531),
  fx("CAD/CHF", 80, 0.651),
  fx("USD/SGD", 79, 1.35),
  fx("USD/MXN", 79, 17.0, 4),
  fx("USD/ZAR", 78, 18.7, 4),
  fx("USD/NOK", 78, 10.7, 4),
  fx("USD/SEK", 78, 10.5, 4),
  fx("USD/TRY", 77, 32.2, 4),

  // ---- More OTC ----
  otc("GBP/JPY", 90, 192.0, 3),
  otc("EUR/JPY", 90, 164.1, 3),
  otc("EUR/CHF", 88, 0.96),
  otc("EUR/AUD", 87, 1.655),
  otc("EUR/NZD", 87, 1.81),
  otc("GBP/AUD", 87, 1.94),
  otc("GBP/NZD", 86, 2.117),
  otc("GBP/CHF", 88, 1.125),
  otc("AUD/CAD", 88, 0.89),
  otc("AUD/JPY", 89, 99.0, 3),
  otc("AUD/NZD", 87, 1.093),
  otc("CAD/JPY", 88, 111.2, 3),
  otc("CHF/JPY", 88, 170.8, 3),
  otc("USD/CHF", 89, 0.885),
  otc("NZD/JPY", 87, 90.7, 3),
  otc("USD/INR", 91, 83.4, 4),
  otc("USD/PKR", 90, 278.0, 3),
  otc("USD/BDT", 89, 117.0, 3),
  otc("USD/BRL", 89, 5.1, 4),
  otc("USD/TRY", 88, 32.2, 4),
  otc("USD/MXN", 88, 17.0, 4),
  otc("USD/IDR", 88, 16000, 1),
  otc("USD/ZAR", 87, 18.7, 4),

  // ---- More commodities ----
  make("commodities", "Platinum", "Commodity", 79, 960, 2, 0.0005),
  make("commodities", "Palladium", "Commodity", 78, 1000, 2, 0.0008),
  make("commodities", "Wheat", "Commodity", 76, 5.9, 3, 0.0009),
  make("commodities", "Corn", "Commodity", 76, 4.5, 3, 0.0008),
  make("commodities", "Coffee", "Commodity", 76, 2.3, 3, 0.001),
  make("commodities", "Sugar", "Commodity", 75, 0.19, 4, 0.001),
  make("commodities", "Cocoa", "Commodity", 75, 8000, 1, 0.0012),

  // ---- More crypto ----
  make("crypto", "BNB/USD", "Cryptocurrency", 82, 600, 2, 0.001),
  make("crypto", "ADA/USD", "Cryptocurrency", 79, 0.45, 4, 0.0014),
  make("crypto", "DOT/USD", "Cryptocurrency", 79, 7.0, 3, 0.0014),
  make("crypto", "AVAX/USD", "Cryptocurrency", 80, 35, 2, 0.0015),
  make("crypto", "LINK/USD", "Cryptocurrency", 80, 14, 3, 0.0014),
  make("crypto", "TRX/USD", "Cryptocurrency", 78, 0.12, 5, 0.0012),
  make("crypto", "TON/USD", "Cryptocurrency", 78, 6.0, 3, 0.0014),
  make("crypto", "BCH/USD", "Cryptocurrency", 79, 480, 2, 0.0012),
  make("crypto", "SHIB/USD", "Cryptocurrency", 76, 0.000025, 8, 0.0018),

  // ---- More indices ----
  make("indices", "France 40", "Index", 80, 8000, 2, 0.0003),
  make("indices", "Spain 35", "Index", 79, 11000, 2, 0.0003),
  make("indices", "Italy 40", "Index", 79, 34000, 2, 0.0003),
  make("indices", "Euro Stoxx 50", "Index", 80, 5000, 2, 0.0003),
  make("indices", "Australia 200", "Index", 79, 7700, 2, 0.0003),
  make("indices", "Hong Kong 50", "Index", 79, 17500, 2, 0.0005),
  make("indices", "US Small Cap 2000", "Index", 79, 2050, 2, 0.0004),

  // ---- More stocks ----
  make("stocks", "META", "Stock", 77, 500, 2, 0.0008, "", "ME"),
  make("stocks", "NFLX", "Stock", 76, 620, 2, 0.0009, "", "NF"),
  make("stocks", "AMD", "Stock", 76, 160, 2, 0.001, "", "AM"),
  make("stocks", "INTC", "Stock", 75, 31, 2, 0.0009, "", "IN"),
  make("stocks", "BABA", "Stock", 75, 75, 2, 0.001, "", "BA"),
  make("stocks", "JPM", "Stock", 77, 200, 2, 0.0006, "", "JP"),
  make("stocks", "V", "Stock", 77, 275, 2, 0.0005, "", "VI"),
  make("stocks", "KO", "Stock", 76, 62, 2, 0.0004, "", "KO"),
  make("stocks", "DIS", "Stock", 76, 105, 2, 0.0007, "", "DI"),
  make("stocks", "NKE", "Stock", 76, 95, 2, 0.0007, "", "NK"),
  make("stocks", "PYPL", "Stock", 75, 65, 2, 0.0009, "", "PY"),
  make("stocks", "UBER", "Stock", 76, 70, 2, 0.0009, "", "UB"),
  make("stocks", "COIN", "Stock", 75, 240, 2, 0.0014, "", "CO"),
  make("stocks", "BA", "Stock", 75, 180, 2, 0.0008, "", "BO"),
  make("stocks", "MCD", "Stock", 77, 290, 2, 0.0004, "", "MC"),
];

export const getMarket = (id: string): Market => MARKETS.find((m) => m.id === id) ?? MARKETS[0];

/** Initial open tabs (mirrors the reference workflow). */
export const DEFAULT_TABS = [
  MARKETS.find((m) => m.name === "AUD/CHF (OTC)")!.id,
  MARKETS.find((m) => m.name === "USD/CAD")!.id,
  MARKETS.find((m) => m.name === "USD/EGP (OTC)")!.id,
];

/** Stable hue (0-359) for generated icon badges. */
export function badgeHue(m: Market): number {
  let h = 0;
  for (let i = 0; i < m.id.length; i++) h = (h * 31 + m.id.charCodeAt(i)) % 360;
  return h;
}
