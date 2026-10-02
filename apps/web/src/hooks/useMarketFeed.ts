"use client";

import { useEffect, useState } from "react";
import type { Candle, Market, Timeframe } from "@/types/trading";
import { applyTick, marketDataProvider } from "@/lib/marketData";

export type MarketFeed = {
  candles: Candle[];
  price: number | null;
  ready: boolean;
  isSimulated: boolean;
  providerName: string;
};

const HISTORY = 240;

/** Loads history and streams ticks for one market/timeframe from the active provider. */
export function useMarketFeed(market: Market, tf: Timeframe): MarketFeed {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    setReady(false);
    setCandles([]);
    marketDataProvider.getHistory(market, tf, HISTORY).then((history) => {
      if (cancelled) return;
      setCandles(history);
      setReady(true);
      unsubscribe = marketDataProvider.subscribe(market, tf, (tick) => {
        setCandles((prev) => applyTick(prev, tick, tf));
      });
    });
    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [market, tf]);

  const price = candles.length ? candles[candles.length - 1].close : null;
  return {
    candles,
    price,
    ready,
    isSimulated: marketDataProvider.isSimulated,
    providerName: marketDataProvider.name,
  };
}
