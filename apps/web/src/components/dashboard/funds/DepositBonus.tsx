import {
  BONUS_RATE,
  MAX_BONUS_DEPOSIT_USD,
  MAX_BONUS_USD,
  calcBonus,
  formatUsd,
  formatUsd2,
  type DepositCheck,
} from "./fundsConfig";
import { FundsCard } from "./FundsLayout";

/**
 * Live summary: Your deposit / Deposit bonus / Total.
 * Display only: nothing is credited in this prototype.
 */
export function BonusSummary({ check }: { check: DepositCheck }) {
  const ok = check.ok;
  const dash = <span className="text-slate-600">—</span>;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-ink-950/60 p-4 sm:p-5" aria-live="polite">
      <dl className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[14px] text-slate-400">Your deposit</dt>
          <dd className="min-w-0 truncate text-[18px] font-semibold tabular-nums text-white">
            {check.ok ? formatUsd2(check.amount) : dash}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[14px] text-slate-400">Deposit bonus</dt>
          <dd className="min-w-0 truncate text-[18px] font-semibold tabular-nums text-brand">
            {check.ok ? `+ ${formatUsd2(check.bonus)}` : dash}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-white/[0.08] pt-3">
          <dt className="text-[14px] font-medium text-slate-200">Total</dt>
          <dd className="min-w-0 truncate text-[26px] font-bold leading-none tabular-nums text-white">
            {check.ok ? formatUsd2(check.total) : dash}
          </dd>
        </div>
      </dl>
      {check.ok && check.capped && (
        <p className="mt-3 rounded-md bg-brand/10 px-3 py-2 text-[13px] font-medium text-brand">
          Bonus capped at {formatUsd(MAX_BONUS_USD)}.
        </p>
      )}
      <p className="mt-3 text-[12px] leading-snug text-slate-500">
        Illustration only. Nothing is credited automatically in this prototype.
      </p>
    </div>
  );
}

/** Side card describing the bonus rules. */
export function DepositBonusInfo() {
  const example = 100;
  return (
    <FundsCard>
      <h2 className="text-[16px] font-semibold text-white">Deposit bonus</h2>
      <p className="mt-1 text-[14px] leading-snug text-slate-400">
        Get a {BONUS_RATE * 100}% bonus on eligible deposits.
      </p>

      <dl className="mt-4 divide-y divide-white/[0.06] text-[14px]">
        <div className="flex items-baseline justify-between gap-3 py-2.5">
          <dt className="text-slate-400">Maximum bonus</dt>
          <dd className="font-semibold tabular-nums text-white">{formatUsd(MAX_BONUS_USD)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 py-2.5">
          <dt className="text-slate-400">Maximum bonus-eligible deposit</dt>
          <dd className="shrink-0 font-semibold tabular-nums text-white">{formatUsd(MAX_BONUS_DEPOSIT_USD)}</dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3.5 py-3">
        <span className="text-[13px] text-slate-300">Deposit {formatUsd(example)}</span>
        <span className="text-[15px] font-semibold tabular-nums text-brand">+{formatUsd(calcBonus(example))} bonus</span>
      </div>

      <p className="mt-3 text-[12px] leading-snug text-slate-500">
        Bonus terms and eligibility may apply. Display only; no real money is credited in this prototype.
      </p>
    </FundsCard>
  );
}
