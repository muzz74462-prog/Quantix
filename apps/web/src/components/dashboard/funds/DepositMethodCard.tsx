import type { FundsMethod } from "./fundsConfig";

/**
 * One payment method tile. Unavailable methods render as disabled tiles with a
 * "Coming Soon" badge and never open a payment form.
 */
export function DepositMethodCard({
  method,
  available,
  selected = false,
  onSelect,
}: {
  method: FundsMethod;
  available: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const body = (
    <>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white ${method.badge} ${
          available ? "" : "opacity-60"
        }`}
        aria-hidden="true"
      >
        {method.symbol}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-[14px] font-semibold ${available ? "text-white" : "text-slate-400"}`}>
          {method.name}
        </span>
        <span className="block truncate text-[12px] text-slate-500">{method.network}</span>
      </span>
      {available ? (
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            selected ? "border-brand bg-brand text-white" : "border-white/20 text-transparent"
          }`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2.5 6.5l2.2 2.2L9.5 3.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      ) : (
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-slate-400">
          Coming Soon
        </span>
      )}
    </>
  );

  if (!available) {
    return (
      <button
        type="button"
        disabled
        className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-left"
      >
        {body}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left transition-colors ${
        selected ? "border-brand/60 bg-brand/10" : "border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]"
      }`}
    >
      {body}
    </button>
  );
}
