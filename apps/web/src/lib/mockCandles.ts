import type { Candle } from "@/types";

/** Small deterministic PRNG so server and client always render identical mock data. */
function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n: number) => Math.round(n * 100000) / 100000;

/** Sample candles with a gentle rally followed by a pull-back. Illustrative only. */
export function generateCandles(count: number, seed = 11, start = 1.0842): Candle[] {
  const rand = mulberry32(seed);
  const out: Candle[] = [];
  let prev = start;
  for (let i = 0; i < count; i++) {
    const progress = i / count;
    const drift = progress < 0.55 ? 0.00012 : -0.00032;
    const o = prev;
    const c = o + drift + (rand() - 0.5) * 0.0009;
    const h = Math.max(o, c) + rand() * 0.0004;
    const l = Math.min(o, c) - rand() * 0.0004;
    out.push({ o: round(o), h: round(h), l: round(l), c: round(c) });
    prev = c;
  }
  return out;
}
