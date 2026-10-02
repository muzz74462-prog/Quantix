"use client";

import { memo, useEffect, useMemo, useState } from "react";
import type { Market, Trade } from "@/types/trading";
import { formatDuration, formatMoney } from "@/lib/demoTrading";
import { ArrowDownIcon, ArrowUpIcon } from "./DashIcons";

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

const STATUS_STYLE: Record<Trade["status"], string> = {
  open: "bg-accent/15 text-accent",
  won: "bg-up/15 text-up",
  lost: "bg-down/15 text-down",
  tie: "bg-white/10 text-slate-300",
};
const STATUS_LABEL: Record<Trade["status"], string> = { open: "Open", won: "Won", lost: "Lost", tie: "Tie" };

const TradeRow = memo(function TradeRow({ trade: t, decimals, now }: { trade: Trade; decimals: number; now: number }) {
  const remaining = Math.max(0, Math.ceil((t.expiresAt - now) / 1000));
  const isOpen = t.status === "open";
  const pl = isOpen
    ? { text: `${formatMoney((t.investment * t.payoutPct) / 100, true)} if win`, cls: "text-slate-400" }
    : {
        text: formatMoney(t.profit ?? 0, true),
        cls: t.status === "won" ? "text-up" : t.status === "lost" ? "text-down" : "text-slate-300",
      };
  const up = t.direction === "up";

  return (
    <li className="border-b border-white/[0.05] px-3 py-2.5 text-[12px]">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-semibold text-white">{t.marketName}</span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 font-bold ${up ? "text-up" : "text-down"}`}>
            {up ? <ArrowUpIcon size={12} /> : <ArrowDownIcon size={12} />}
            {up ? "UP" : "DOWN"}
          </span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[t.status]}`}>
            {STATUS_LABEL[t.status]}
          </span>
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 text-slate-400">
        <span className="font-mono tabular-nums">
          {formatMoney(t.investment)} · {t.entryPrice.toFixed(decimals)}
          {t.exitPrice !== undefined && <span className="text-slate-500"> → {t.exitPrice.toFixed(decimals)}</span>}
        </span>
        <span className="font-mono tabular-nums">{formatDuration(isOpen ? remaining : t.durationSec)}</span>
      </div>
      <div className={`mt-0.5 text-right font-semibold tabular-nums ${pl.cls}`}>{pl.text}</div>
    </li>
  );
});

type Tab = "open" | "closed";

export function TradeHistory({
  trades,
  markets,
  isReal = false,
}: {
  trades: Trade[];
  markets: Record<string, Market>;
  isReal?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("open");
  const openTrades = useMemo(() => trades.filter((t) => t.status === "open"), [trades]);
  const closedTrades = useMemo(() => trades.filter((t) => t.status !== "open"), [trades]);
  const now = useNow(openTrades.length > 0);

  const list = tab === "open" ? openTrades : closedTrades;
  const tabBtn = (active: boolean) =>
    `flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-2.5 text-[12px] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
      active ? "border-brand text-white" : "border-transparent text-slate-500 hover:text-slate-300"
    }`;
  const count = "rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-slate-300";

  return (
    <section
      aria-label="Trades"
      className="flex min-h-[220px] flex-1 flex-col border-t border-white/[0.06] bg-ink-900 lg:min-h-[200px]"
    >
      <div role="tablist" aria-label="Trades" className="flex border-b border-white/[0.06]">
        <button type="button" role="tab" aria-selected={tab === "open"} onClick={() => setTab("open")} className={tabBtn(tab === "open")}>
          Trades <span className={count}>{openTrades.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === "closed"} onClick={() => setTab("closed")} className={tabBtn(tab === "closed")}>
          History <span className={count}>{closedTrades.length}</span>
        </button>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-slate-400" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16l-1.5 12h-13L4 7Z" />
              <path d="M9 7V5a3 3 0 0 1 6 0v2" />
            </svg>
          </div>
          <p className="text-[12px] leading-snug text-slate-500">
            {isReal
              ? "No live trades. Real-money trading is not available in this prototype."
              : tab === "open"
                ? "You have no open trades. Choose Up or Down above to place a simulated demo trade."
                : "No closed trades yet. Finished demo trades will appear here."}
          </p>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {list.map((t) => (
            <TradeRow key={t.id} trade={t} decimals={markets[t.marketId]?.decimals ?? 4} now={now} />
          ))}
        </ul>
      )}

      {!isReal && list.length > 0 && (
        <p className="border-t border-white/[0.05] px-3 py-1.5 text-[10px] text-slate-500">Demo only · virtual funds</p>
      )}
    </section>
  );
}
