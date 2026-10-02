import type { Candle, Market, Tick, Timeframe } from "@/types/trading";
import { timeframeSeconds } from "@/lib/markets";

/**
 * Market-data provider contract. The dashboard only talks to this interface, so a
 * licensed real-time provider (REST + WebSocket) can be dropped in later without
 * touching any UI code.
 */
export interface MarketDataProvider {
  readonly name: string;
  /** True when prices are generated locally and must be labelled as simulated. */
  readonly isSimulated: boolean;
  getHistory(market: Market, tf: Timeframe, count: number): Promise<Candle[]>;
  subscribe(market: Market, tf: Timeframe, onTick: (t: Tick) => void): () => void;
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Approximately normal noise in [-~2, ~2]. */
const gauss = (rand: () => number) => rand() + rand() + rand() - 1.5;

const roundTo = (n: number, d: number) => {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
};

/** Per-candle standard step for a market on a timeframe (simulation only). */
function stepSize(market: Market, tf: Timeframe): number {
  const minutes = timeframeSeconds(tf) / 60;
  return market.basePrice * market.volatility * Math.sqrt(minutes);
}

/**
 * SANDBOX provider: deterministic simulated history + locally generated ticks.
 * These are NOT real market prices.
 */
export class DemoMarketDataProvider implements MarketDataProvider {
  readonly name = "QUANTIX Demo Feed";
  readonly isSimulated = true;
  private last = new Map<string, number>();

  private key(m: Market, tf: Timeframe) {
    return `${m.id}|${tf}`;
  }

  async getHistory(market: Market, tf: Timeframe, count: number): Promise<Candle[]> {
    const rand = mulberry32(hashString(this.key(market, tf)));
    const bucket = timeframeSeconds(tf);
    const end = Math.floor(Date.now() / 1000 / bucket) * bucket;
    const step = stepSize(market, tf);
    const out: Candle[] = [];
    let prev = market.basePrice;
    for (let i = 0; i < count; i++) {
      const open = prev;
      const reversion = (market.basePrice - open) * 0.015;
      const close = open + reversion + gauss(rand) * step;
      const high = Math.max(open, close) + rand() * step * 0.6;
      const low = Math.min(open, close) - rand() * step * 0.6;
      out.push({
        time: end - (count - 1 - i) * bucket,
        open: roundTo(open, market.decimals),
        high: roundTo(high, market.decimals),
        low: roundTo(low, market.decimals),
        close: roundTo(close, market.decimals),
      });
      prev = close;
    }
    this.last.set(this.key(market, tf), out[out.length - 1].close);
    return out;
  }

  subscribe(market: Market, tf: Timeframe, onTick: (t: Tick) => void): () => void {
    const key = this.key(market, tf);
    let price = this.last.get(key) ?? market.basePrice;
    const tickStep = market.basePrice * market.volatility * 0.18;
    const id = setInterval(() => {
      const rand = Math.random;
      price += (market.basePrice - price) * 0.002 + gauss(rand) * tickStep;
      price = roundTo(price, market.decimals);
      this.last.set(key, price);
      onTick({ time: Math.floor(Date.now() / 1000), price });
    }, 900);
    return () => clearInterval(id);
  }
}

/** Single shared provider instance. Swap this for a real provider later. */
export const marketDataProvider: MarketDataProvider = new DemoMarketDataProvider();

/** Pure helper: fold a tick into the candle series (immutable). */
export function applyTick(candles: Candle[], tick: Tick, tf: Timeframe, max = 600): Candle[] {
  if (!candles.length) return candles;
  const bucket = timeframeSeconds(tf);
  const start = Math.floor(tick.time / bucket) * bucket;
  const last = candles[candles.length - 1];
  if (start > last.time) {
    const next: Candle = {
      time: start,
      open: last.close,
      high: Math.max(last.close, tick.price),
      low: Math.min(last.close, tick.price),
      close: tick.price,
    };
    const out = [...candles, next];
    return out.length > max ? out.slice(out.length - max) : out;
  }
  const updated: Candle = {
    ...last,
    close: tick.price,
    high: Math.max(last.high, tick.price),
    low: Math.min(last.low, tick.price),
  };
  return [...candles.slice(0, -1), updated];
}
