"use client";

import type { Market, OrderDirection } from "@/types/trading";
import {
  INVESTMENT_PRESETS,
  MAX_INVESTMENT,
  MIN_INVESTMENT,
  QUICK_DURATIONS,
  calcPayout,
  clampInvestment,
  formatDuration,
  formatMoney,
  stepDuration,
} from "@/lib/demoTrading";
import { PlusIcon } from "@/components/ui/Icons";
import { MarketIcon } from "./AssetRow";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon, SpinnerIcon } from "./DashIcons";

type TradePanelProps = {
  market: Market;
  durationSec: number;
  onDuration: (sec: number) => void;
  investment: number;
  onInvestment: (n: number) => void;
  /** Which direction is currently being submitted (loading state). */
  placing: OrderDirection | null;
  disabledReason: string | null;
  onTrade: (dir: OrderDirection) => void;
  isReal?: boolean;
  /** Live account selected with no funds: trading is replaced by a deposit prompt. */
  onDeposit?: () => void;
  showClock: boolean;
  onToggleClock: () => void;
};

const label = "text-[11px] font-semibold uppercase tracking-wide text-slate-400";
const stepBtn =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ink-600/70 text-slate-200 transition-colors hover:bg-ink-600 active:bg-ink-500 disabled:cursor-not-allowed disabled:opacity-40";

export function TradePanel({
  market,
  durationSec,
  onDuration,
  investment,
  onInvestment,
  placing,
  disabledReason,
  onTrade,
  isReal = false,
  onDeposit,
  showClock,
  onToggleClock,
}: TradePanelProps) {
  const { profit, totalReturn } = calcPayout(investment, market.payout);
  const busy = placing !== null;
  const blocked = disabledReason !== null || busy;
  const expiry = new Date(Date.now() + durationSec * 1000);
  const p2 = (n: number) => String(n).padStart(2, "0");

  const cycleInvestment = () => {
    const next = INVESTMENT_PRESETS.find((p) => p > investment) ?? INVESTMENT_PRESETS[0];
    onInvestment(next);
  };

  return (
    <aside
      aria-label="Trade panel"
      className="grid grid-cols-1 gap-3 border-t border-white/[0.06] bg-ink-900 p-3 sm:grid-cols-2 lg:flex lg:shrink-0 lg:flex-col lg:gap-2.5 lg:border-t-0 lg:p-3"
    >
      {/* Account / trading state */}
      <div
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-[12px] font-medium sm:col-span-2 ${
          isReal ? "bg-sky-400/10 text-sky-200" : "bg-amber-400/10 text-amber-200"
        }`}
      >
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isReal ? "bg-sky-300" : "bg-amber-300"}`} aria-hidden="true" />
        {isReal ? "Live account" : "Demo trading ready. Start trading below."}
      </div>

      {/* Asset + payout */}
      <div className="flex items-center justify-between gap-3 sm:col-span-2">
        <div className="flex min-w-0 items-center gap-2">
          <MarketIcon market={market} size={26} />
          <span className="truncate text-[14px] font-bold text-white">{market.name}</span>
        </div>
        <span className="shrink-0 text-[15px] font-bold text-up" aria-label={`Payout ${market.payout} percent`}>
          {market.payout}%
        </span>
      </div>

      <div className="flex items-center justify-between rounded-md bg-ink-800 px-3 py-2 sm:col-span-2">
        <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-300">
          Pending trade
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-400">Soon</span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={false}
          aria-label="Pending trade (not available yet)"
          disabled
          className="relative h-5 w-9 shrink-0 cursor-not-allowed rounded-full bg-ink-600 opacity-60"
        >
          <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-slate-300" />
        </button>
      </div>

      {/* Time */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className={label}>Time</span>
          <button
            type="button"
            onClick={onToggleClock}
            className="text-[10px] font-bold uppercase tracking-wide text-accent hover:text-white"
          >
            Switch
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-ink-800 p-1.5">
          <button
            type="button"
            className={stepBtn}
            aria-label="Decrease time"
            onClick={() => onDuration(stepDuration(durationSec, -1))}
          >
            <MinusIcon size={16} />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <div className="font-mono text-[15px] font-bold text-white">
              {showClock ? `${p2(expiry.getHours())}:${p2(expiry.getMinutes())}:${p2(expiry.getSeconds())}` : formatDuration(durationSec)}
            </div>
            <div className="text-[10px] text-slate-500">{showClock ? "Expiry time" : "Duration"}</div>
          </div>
          <button
            type="button"
            className={stepBtn}
            aria-label="Increase time"
            onClick={() => onDuration(stepDuration(durationSec, 1))}
          >
            <PlusIcon size={16} />
          </button>
        </div>
        <div className="mt-1.5 grid grid-cols-4 gap-1">
          {QUICK_DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDuration(d)}
              aria-pressed={d === durationSec}
              className={`h-7 rounded text-[11px] font-semibold transition-colors ${
                d === durationSec ? "bg-brand/20 text-white ring-1 ring-brand/60" : "bg-ink-800 text-slate-300 hover:bg-ink-700"
              }`}
            >
              {formatDuration(d).replace(/^00:/, "")}
            </button>
          ))}
        </div>
      </div>

      {/* Investment */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className={label}>Investment</span>
          <button
            type="button"
            onClick={cycleInvestment}
            className="text-[10px] font-bold uppercase tracking-wide text-accent hover:text-white"
          >
            Switch
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-ink-800 p-1.5">
          <button
            type="button"
            className={stepBtn}
            aria-label="Decrease investment"
            disabled={investment <= MIN_INVESTMENT}
            onClick={() => onInvestment(clampInvestment(investment - 5 < MIN_INVESTMENT ? MIN_INVESTMENT : investment - 5))}
          >
            <MinusIcon size={16} />
          </button>
          <label className="flex min-w-0 flex-1 items-center justify-center gap-0.5 text-[15px] font-bold text-white">
            <span className="text-slate-400">$</span>
            <input
              type="number"
              inputMode="decimal"
              min={MIN_INVESTMENT}
              max={MAX_INVESTMENT}
              value={Number.isFinite(investment) && investment > 0 ? investment : ""}
              aria-label="Investment amount in US dollars"
              onChange={(e) => onInvestment(Number(e.target.value))}
              onBlur={() => onInvestment(clampInvestment(investment))}
              className="w-16 bg-transparent text-center font-bold text-white [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </label>
          <button
            type="button"
            className={stepBtn}
            aria-label="Increase investment"
            disabled={investment >= MAX_INVESTMENT}
            onClick={() => onInvestment(clampInvestment(investment + 5))}
          >
            <PlusIcon size={16} />
          </button>
        </div>
        <div className="mt-1.5 text-[10px] text-slate-500">
          Min {formatMoney(MIN_INVESTMENT)} · Max {formatMoney(MAX_INVESTMENT)}
        </div>
      </div>

      {/* Payout */}
      <div className="rounded-md bg-ink-800 px-3 py-2.5 sm:col-span-2">
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] text-slate-300">Your payout if win</span>
          <span className="text-[17px] font-bold text-up">{formatMoney(totalReturn)}</span>
        </div>
        <div className="mt-0.5 flex items-baseline justify-between text-[11px] text-slate-500">
          <span>
            {formatMoney(investment)} × {market.payout}% = profit
          </span>
          <span>+ {formatMoney(profit)}</span>
        </div>
      </div>

      {/* Up / Down */}
      <div className="grid grid-cols-2 gap-3 sm:col-span-2 lg:grid-cols-1">
        <button
          type="button"
          disabled={blocked}
          onClick={() => onTrade("up")}
          aria-busy={placing === "up"}
          className="flex h-14 items-center justify-between rounded-md bg-brand px-4 text-[16px] font-bold text-white shadow-[0_6px_18px_-8px_rgba(18,180,95,0.7)] transition-all hover:bg-brand-hover active:translate-y-px active:brightness-95 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:hover:bg-brand"
        >
          Up
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
            {placing === "up" ? <SpinnerIcon size={16} /> : <ArrowUpIcon size={16} />}
          </span>
        </button>
        <button
          type="button"
          disabled={blocked}
          onClick={() => onTrade("down")}
          aria-busy={placing === "down"}
          className="flex h-14 items-center justify-between rounded-md bg-down px-4 text-[16px] font-bold text-white shadow-[0_6px_18px_-8px_rgba(239,91,83,0.7)] transition-all hover:brightness-110 active:translate-y-px active:brightness-95 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:hover:brightness-100"
        >
          Down
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
            {placing === "down" ? <SpinnerIcon size={16} /> : <ArrowDownIcon size={16} />}
          </span>
        </button>
      </div>

      {isReal && onDeposit ? (
        <div role="status" className="rounded-lg border border-white/10 bg-white/[0.03] p-3 sm:col-span-2">
          <p className="text-[13px] font-medium leading-snug text-slate-200">Deposit funds to trade with your Live Account.</p>
          <button
            type="button"
            onClick={onDeposit}
            className="mt-2.5 h-9 w-full rounded-md bg-brand text-[13px] font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Deposit
          </button>
        </div>
      ) : (
        <p role="status" className="text-[11px] leading-snug text-slate-500 sm:col-span-2">
          {disabledReason ?? "Simulated demo trade. No real money is used."}
        </p>
      )}
    </aside>
  );
}
