import { Logo } from "@/components/ui/Logo";
import {
  ChartIcon,
  DotsIcon,
  GridIcon,
  MenuIcon,
  TrophyIcon,
  UserIcon,
  SupportIcon,
} from "@/components/ui/Icons";
import { CandleChart } from "./CandleChart";
import { TradePanel } from "./TradePanel";

const SIDEBAR = [
  { label: "Trade", icon: ChartIcon, active: true },
  { label: "Support", icon: SupportIcon },
  { label: "Account", icon: UserIcon },
  { label: "Contests", icon: TrophyIcon },
  { label: "Markets", icon: GridIcon },
  { label: "More", icon: DotsIcon },
];

const ASSETS = [
  { pair: "EUR/USD", change: "+0.12%", up: true },
  { pair: "GBP/JPY", change: "-0.31%", up: false },
  { pair: "AUD/USD", change: "+0.05%", up: true },
];

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"];

export function TradingPreview() {
  return (
    <section id="platform" aria-labelledby="platform-caption" className="relative px-4 pb-16 sm:px-6 md:pb-24">
      <div className="mx-auto max-w-[1040px] animate-terminal-float">
        <div
          aria-hidden="true"
          className="overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
        >
          {/* top bar */}
          <div className="flex h-11 items-center justify-between border-b border-white/[0.06] px-3">
            <div className="flex items-center gap-3">
              <MenuIcon size={16} className="text-slate-400" />
              <Logo size="sm" />
              <span className="hidden text-[10px] font-semibold tracking-wide text-slate-500 sm:inline">WEB TRADING PLATFORM</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="rounded-md bg-ink-700 px-2 py-1 font-semibold text-slate-100">
                Demo <span className="text-up">$10,000.00</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* left navigation (tablet and up) */}
            <div className="hidden w-[58px] shrink-0 flex-col items-center gap-1 border-r border-white/[0.06] bg-ink-900 py-2 md:flex">
              {SIDEBAR.map(({ label, icon: Icon, active }) => (
                <div
                  key={label}
                  className={`flex w-12 flex-col items-center gap-0.5 rounded-md py-1.5 text-[8px] font-semibold ${
                    active ? "bg-accent text-white" : "text-slate-400"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </div>
              ))}
            </div>

            {/* chart column */}
            <div className="min-w-0 flex-1">
              {/* asset tabs */}
              <div className="flex items-center gap-2 overflow-hidden border-b border-white/[0.06] px-3 py-2">
                {ASSETS.map((a, i) => (
                  <div
                    key={a.pair}
                    className={`flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1 text-[11px] ${
                      i === 0 ? "bg-ink-700" : "bg-ink-850"
                    }`}
                  >
                    <span className="font-semibold text-white">{a.pair}</span>
                    <span className={a.up ? "text-up" : "text-down"}>{a.change}</span>
                  </div>
                ))}
              </div>

              {/* chart toolbar + timeframes */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-200">Candles</span>
                  <span className="hidden sm:inline">Indicators</span>
                  <span className="hidden sm:inline">Drawings</span>
                </div>
                <div className="flex items-center gap-1">
                  {TIMEFRAMES.map((t) => (
                    <span
                      key={t}
                      className={`rounded px-1.5 py-0.5 ${t === "5m" ? "bg-ink-600 text-white" : ""}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-1 pt-2">
                <CandleChart width={420} height={300} count={30} fontSize={12} seed={11} className="md:hidden" />
                <CandleChart width={760} height={400} count={56} fontSize={11} seed={11} className="hidden md:block" />
              </div>
            </div>

            <TradePanel />
          </div>
        </div>

        <p id="platform-caption" className="mt-4 text-center text-xs text-slate-500">
          Illustrative interface with sample data. It does not execute trades.
        </p>
      </div>
    </section>
  );
}
