/** Shared types for the QUANTIX demo trading dashboard. Everything here is simulated. */

export type MarketCategory = "forex" | "otc" | "commodities" | "crypto" | "indices" | "stocks";

export type Market = {
  id: string;
  /** Display name, e.g. "EUR/USD (OTC)". */
  name: string;
  category: MarketCategory;
  /** Human readable asset type, e.g. "Currency pair". */
  assetType: string;
  /** Payout percentage, e.g. 93 means 93%. */
  payout: number;
  /** Illustrative starting price for the simulated feed (not a real quote). */
  basePrice: number;
  decimals: number;
  /** Rough per-1m-candle volatility as a fraction of price (simulation only). */
  volatility: number;
  /** Two-letter code used for the generated icon badge. */
  badge: string;
};

export type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d";

export type Candle = {
  /** Bucket start, unix seconds. */
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type Tick = { time: number; price: number };

export type AccountType = "demo" | "live";

export type Account = {
  type: AccountType;
  label: string;
  balance: number;
  /** Live is a placeholder: no real funds, no real trading. */
  available: boolean;
};

export type OrderDirection = "up" | "down";

export type TradeStatus = "open" | "won" | "lost" | "tie";

export type Trade = {
  id: string;
  marketId: string;
  marketName: string;
  direction: OrderDirection;
  investment: number;
  payoutPct: number;
  entryPrice: number;
  exitPrice?: number;
  openedAt: number;
  expiresAt: number;
  durationSec: number;
  status: TradeStatus;
  /** Net result once settled: +profit, -investment, or 0 on a tie. */
  profit?: number;
  /** Always "demo" in this prototype. */
  account: "demo";
};
