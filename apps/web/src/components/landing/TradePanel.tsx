const OPEN_TRADES = [
  { asset: "EUR/USD", amount: "$100", result: "+$82.00", up: true },
  { asset: "GBP/JPY", amount: "$50", result: "-$50.00", up: false },
  { asset: "AUD/USD", amount: "$25", result: "+$20.50", up: true },
];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-[10px] text-slate-400">{label}</div>
      <div className="flex h-8 items-center justify-between rounded-md bg-ink-700 px-3 text-xs font-semibold text-white">
        {value}
      </div>
    </div>
  );
}

/** Right-hand trading panel. Purely visual: no state, no actions. */
export function TradePanel() {
  return (
    <div className="flex w-full shrink-0 flex-col gap-3 border-t border-white/[0.06] bg-ink-900 p-3 md:w-[216px] md:border-l md:border-t-0">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex h-8 items-center justify-center rounded-md bg-brand text-xs font-semibold text-white">Deposit</div>
        <div className="flex h-8 items-center justify-center rounded-md bg-ink-700 text-[11px] font-semibold text-slate-200">Withdrawal</div>
      </div>

      <div className="flex items-center justify-between rounded-md bg-ink-800 px-3 py-2">
        <span className="text-[10px] text-slate-400">Demo balance</span>
        <span className="text-xs font-bold text-white">$10,000.00</span>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
        <div className="flex items-center justify-between rounded-md bg-ink-800 px-3 py-2">
          <span className="text-xs font-semibold text-white">EUR/USD</span>
          <span className="text-xs font-bold text-up">82%</span>
        </div>
        <Field label="Time" value="00:05:00" />
        <Field label="Amount" value="$ 100" />
        <div className="flex items-center justify-between self-end text-[11px] text-slate-300 md:self-auto">
          <span>Sample return</span>
          <span className="font-semibold text-up">+$182.00</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
        <div className="flex h-10 items-center justify-center gap-1 rounded-md bg-up text-sm font-bold text-white">Up</div>
        <div className="flex h-10 items-center justify-center gap-1 rounded-md bg-down text-sm font-bold text-white">Down</div>
      </div>

      <div className="rounded-md bg-ink-800 p-2">
        <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-semibold text-slate-200">Open trades</span>
          <span>3 active</span>
        </div>
        <ul className="divide-y divide-white/[0.05]">
          {OPEN_TRADES.map((t) => (
            <li key={t.asset} className="flex items-center justify-between py-1.5 text-[11px]">
              <span className="font-semibold text-slate-100">{t.asset}</span>
              <span className="text-slate-400">{t.amount}</span>
              <span className={`font-semibold ${t.up ? "text-up" : "text-down"}`}>{t.result}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
