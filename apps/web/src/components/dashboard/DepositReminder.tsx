"use client";

import { CloseIcon } from "@/components/ui/Icons";

/**
 * Small, dismissible, non-blocking reminder shown for a Live Account with $0.00.
 * No backdrop, no focus trap: the trading UI stays fully usable underneath.
 */
export function DepositReminder({ onDeposit, onDismiss }: { onDeposit: () => void; onDismiss: () => void }) {
  return (
    <div
      role="status"
      className="fixed bottom-16 left-3 z-40 w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border border-white/10 bg-ink-800 p-4 shadow-2xl shadow-black/40 md:bottom-4 lg:left-[84px]"
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss reminder"
        className="absolute right-2 top-2 rounded p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
      >
        <CloseIcon size={14} />
      </button>
      <p className="pr-6 text-[14px] font-semibold text-white">Your live balance is $0.00.</p>
      <p className="mt-0.5 text-[13px] text-slate-400">Add funds to start live trading.</p>
      <button
        type="button"
        onClick={onDeposit}
        className="mt-3 h-9 rounded-md bg-brand px-4 text-[13px] font-semibold text-white transition-colors hover:bg-brand-hover"
      >
        Deposit
      </button>
    </div>
  );
}
