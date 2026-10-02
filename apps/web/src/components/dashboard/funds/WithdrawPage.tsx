"use client";

import { DepositMethodCard } from "./DepositMethodCard";
import {
  FUNDS_METHODS,
  MIN_TRADING_ACTIVITY_USD,
  TRADING_ACTIVITY_COMPLETED_USD,
  formatUsd,
} from "./fundsConfig";
import { FundsCard, FundsLayout, SectionLabel } from "./FundsLayout";

const FIELD =
  "mt-1.5 h-12 w-full min-w-0 rounded-md border border-white/10 bg-ink-950 px-3 text-[15px] text-white outline-none placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50";

export function WithdrawPage() {
  const completed = TRADING_ACTIVITY_COMPLETED_USD;
  const eligible = completed >= MIN_TRADING_ACTIVITY_USD;
  const pct = Math.min(100, Math.round((completed / MIN_TRADING_ACTIVITY_USD) * 100));

  return (
    <FundsLayout active="withdraw" title="Withdraw" subtitle="Manage your withdrawal request.">
      <section aria-labelledby="withdraw-eligibility" className="rounded-lg border border-accent/30 bg-accent/10 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="withdraw-eligibility" className="text-[16px] font-bold text-white">
            Withdrawal eligibility
          </h2>
          <span className="rounded-full border border-accent/30 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
            Platform rule
          </span>
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-100">
          Before your first withdrawal, you must complete at least $20 in trading activity.
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between text-[12px] text-slate-300">
            <span>Trading activity completed (demo state)</span>
            <span className="font-semibold text-white">
              {formatUsd(completed)} / {formatUsd(MIN_TRADING_ACTIVITY_USD)}
            </span>
          </div>
          <div
            className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={MIN_TRADING_ACTIVITY_USD}
            aria-valuenow={Math.min(completed, MIN_TRADING_ACTIVITY_USD)}
            aria-label="Trading activity toward the withdrawal requirement"
          >
            <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </section>

      <section aria-labelledby="withdraw-methods">
        <p id="withdraw-methods" className="sr-only">Withdrawal methods</p>
        <SectionLabel>Withdrawal methods</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FUNDS_METHODS.map((m) => (
            <DepositMethodCard key={m.id} method={m} available={false} />
          ))}
        </div>
        <p className="mt-3 text-[12px] text-slate-500">
          Withdrawal processing has not been configured yet, so no withdrawal methods are available.
        </p>
      </section>

      <FundsCard className="space-y-4">
        <h2 className="text-[16px] font-bold text-white">Withdrawal request</h2>

        {!eligible && (
          <p role="alert" className="rounded-md border border-amber-400/30 bg-amber-400/10 px-3.5 py-3 text-[13px] font-semibold leading-snug text-amber-300">
            Complete at least $20 in trading activity before requesting your first withdrawal.
          </p>
        )}

        <div>
          <label htmlFor="withdraw-amount" className="text-[13px] font-semibold text-white">
            Withdrawal amount
          </label>
          <input id="withdraw-amount" type="text" inputMode="decimal" disabled placeholder="0.00" className={FIELD} />
          <p className="mt-1.5 text-[12px] text-slate-500">
            Minimum withdrawal amount will be shown when withdrawals become available.
          </p>
        </div>

        <div>
          <label htmlFor="withdraw-address" className="text-[13px] font-semibold text-white">
            Destination address
          </label>
          <input
            id="withdraw-address"
            type="text"
            disabled
            placeholder="Available when withdrawals open"
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="withdraw-network" className="text-[13px] font-semibold text-white">
            Network
          </label>
          <select id="withdraw-network" disabled defaultValue="" className={FIELD}>
            <option value="">Coming Soon</option>
          </select>
        </div>

        <button
          type="button"
          disabled
          className="h-12 w-full cursor-not-allowed rounded-md bg-white/10 text-[15px] font-bold text-slate-500"
        >
          Request withdrawal
        </button>
        <p className="text-[12px] leading-snug text-slate-500">
          Prototype: no withdrawal can be submitted or processed.
        </p>
      </FundsCard>
    </FundsLayout>
  );
}
