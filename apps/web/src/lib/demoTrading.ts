import type { Market, OrderDirection, Trade } from "@/types/trading";

export const DEMO_START_BALANCE = 10000;
/** Live account is a placeholder only: it never holds funds. */
export const LIVE_PLACEHOLDER_BALANCE = 0;
/** Upper bound when setting the virtual demo balance. */
export const DEMO_MAX_BALANCE = 1000000;

export const MIN_INVESTMENT = 1;
export const MAX_INVESTMENT = 5000;
export const INVESTMENT_PRESETS = [10, 25, 50, 100, 250];

export const MIN_DURATION = 5;
export const DURATION_STEPS = [5, 10, 15, 30, 60, 120, 180, 300, 600, 900, 1800, 3600];
export const QUICK_DURATIONS = [5, 15, 60, 300];

const round2 = (n: number) => Math.round(n * 100) / 100;

/** investment × payout% = profit; total return = investment + profit. */
export function calcPayout(investment: number, payoutPct: number) {
  const profit = round2((investment * payoutPct) / 100);
  return { profit, totalReturn: round2(investment + profit) };
}

export function formatMoney(n: number, sign = false): string {
  const abs = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (sign) return `${n < 0 ? "-" : "+"} $${abs}`;
  return `${n < 0 ? "-" : ""}$${abs}`;
}

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(h)}:${p(m)}:${p(s)}`;
}

export function stepDuration(current: number, dir: 1 | -1): number {
  if (dir === 1) return DURATION_STEPS.find((s) => s > current) ?? DURATION_STEPS[DURATION_STEPS.length - 1];
  const smaller = DURATION_STEPS.filter((s) => s < current);
  return smaller.length ? smaller[smaller.length - 1] : MIN_DURATION;
}

export function clampInvestment(n: number): number {
  if (!Number.isFinite(n)) return MIN_INVESTMENT;
  return Math.min(MAX_INVESTMENT, Math.max(MIN_INVESTMENT, Math.round(n * 100) / 100));
}

let counter = 0;

export function createDemoTrade(args: {
  market: Market;
  direction: OrderDirection;
  investment: number;
  durationSec: number;
  entryPrice: number;
  now?: number;
}): Trade {
  const now = args.now ?? Date.now();
  counter += 1;
  return {
    id: `demo-${now}-${counter}`,
    marketId: args.market.id,
    marketName: args.market.name,
    direction: args.direction,
    investment: args.investment,
    payoutPct: args.market.payout,
    entryPrice: args.entryPrice,
    openedAt: now,
    expiresAt: now + args.durationSec * 1000,
    durationSec: args.durationSec,
    status: "open",
    account: "demo",
  };
}

/** Settle a demo trade against an exit price. Returns the updated trade and the credit to apply. */
export function settleTrade(trade: Trade, exitPrice: number): { trade: Trade; credit: number } {
  const diff = exitPrice - trade.entryPrice;
  const win = trade.direction === "up" ? diff > 0 : diff < 0;
  const tie = diff === 0;
  if (tie) return { trade: { ...trade, exitPrice, status: "tie", profit: 0 }, credit: trade.investment };
  if (win) {
    const { profit, totalReturn } = calcPayout(trade.investment, trade.payoutPct);
    return { trade: { ...trade, exitPrice, status: "won", profit }, credit: totalReturn };
  }
  return { trade: { ...trade, exitPrice, status: "lost", profit: -trade.investment }, credit: 0 };
}

/** Simulated exit for a trade on a market that isn't currently streaming. */
export function simulateExitPrice(market: Market, entry: number, seconds: number): number {
  const steps = Math.max(1, Math.min(60, seconds / 5));
  const sd = market.basePrice * market.volatility * 0.18 * Math.sqrt(steps);
  const noise = Math.random() + Math.random() + Math.random() - 1.5;
  const p = entry + noise * sd;
  return Math.round(p * Math.pow(10, market.decimals)) / Math.pow(10, market.decimals);
}
