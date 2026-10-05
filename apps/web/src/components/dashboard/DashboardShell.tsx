"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Account, AccountType, Market, OrderDirection, Timeframe, Trade } from "@/types/trading";
import { DEFAULT_TABS, MARKETS, getMarket } from "@/lib/markets";
import {
  DEMO_START_BALANCE,
  LIVE_PLACEHOLDER_BALANCE,
  MAX_INVESTMENT,
  MIN_INVESTMENT,
  createDemoTrade,
  formatMoney,
  settleTrade,
  simulateExitPrice,
} from "@/lib/demoTrading";
import { useMarketFeed } from "@/hooks/useMarketFeed";
import { clearDemoUser, loadDemoUser, type DemoUser } from "@/lib/session";
import { MarketSelector } from "./MarketSelector";
import { MobileNav, Sidebar } from "./Sidebar";
import { DashboardContext } from "./DashboardContext";
import { DepositReminder } from "./DepositReminder";
import { PlaceholderModal } from "./PlaceholderModal";
import { TopBar } from "./TopBar";
import { TradeHistory } from "./TradeHistory";
import { TradePanel } from "./TradePanel";
import { TradingChart } from "./TradingChart";

const MAX_TABS = 6;
/** First reminder appears shortly after switching to an empty Live Account. */
const REMINDER_FIRST_DELAY_MS = 3000;
/** After dismissing, it may come back no sooner than this (spec minimum: 15s). */
const REMINDER_COOLDOWN_MS = 60000;
const MARKET_MAP: Record<string, Market> = Object.fromEntries(MARKETS.map((m) => [m.id, m]));

type Modal = { title: string; message: string } | null;
type SelectorState = { mode: "switch" | "add"; anchorLeft: number } | null;

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isTrade = pathname === "/dashboard";
  const [user, setUser] = useState<DemoUser | null>(null);
  useEffect(() => setUser(loadDemoUser()), []);

  // Live balance comes from the server (read-only). If there is no server session, it stays at the placeholder.
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/account/balance", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (alive && data?.ok && typeof data.balance === "number") {
          setBalances((b) => (b.live === data.balance ? b : { ...b, live: data.balance }));
        }
      } catch {
        /* offline: keep the current value */
      }
    };
    void load();
    window.addEventListener("focus", load);
    // Pick up admin adjustments within seconds while the tab is open.
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 15000);
    return () => {
      alive = false;
      window.removeEventListener("focus", load);
      window.clearInterval(timer);
    };
  }, []);
  // Markets / tabs
  const [tabIds, setTabIds] = useState<string[]>(DEFAULT_TABS);
  const [activeId, setActiveId] = useState<string>(DEFAULT_TABS[DEFAULT_TABS.length - 1]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selector, setSelector] = useState<SelectorState>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>("1m");

  // Accounts (frontend-only state)
  const [accountType, setAccountType] = useState<AccountType>("live");
  const [balances, setBalances] = useState({ demo: DEMO_START_BALANCE, live: LIVE_PLACEHOLDER_BALANCE });

  // Trade ticket + demo trades
  const [durationSec, setDurationSec] = useState(5);
  const [investment, setInvestment] = useState(25);
  const [showClock, setShowClock] = useState(false);
  const [placing, setPlacing] = useState<OrderDirection | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);

  // Chrome
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modal, setModal] = useState<Modal>(null);

  const isReal = accountType === "live";
  const liveEmpty = isReal && balances.live <= 0;

  // Live deposit reminder: non-blocking, dismissible, and never more often than REMINDER_COOLDOWN_MS.
  const [reminderOpen, setReminderOpen] = useState(false);
  const reminderBusy = useRef(false);
  const showReminderEligible = liveEmpty && isTrade;
  reminderBusy.current = placing !== null;
  useEffect(() => {
    if (!showReminderEligible) {
      setReminderOpen(false);
      return;
    }
    const first = setTimeout(() => {
      if (!reminderBusy.current) setReminderOpen(true);
    }, REMINDER_FIRST_DELAY_MS);
    return () => clearTimeout(first);
  }, [showReminderEligible]);
  const dismissReminder = () => {
    setReminderOpen(false);
    // Allow it to come back after the cooldown while the live balance is still $0.00.
    setTimeout(() => {
      if (!reminderBusy.current) setReminderOpen(true);
    }, REMINDER_COOLDOWN_MS);
  };
  const market = getMarket(activeId);
  const tabs = useMemo(() => tabIds.map(getMarket), [tabIds]);
  const feed = useMarketFeed(market, timeframe);

  const accounts: Account[] = [
    { type: "demo", label: "Demo Account", balance: balances.demo, available: true },
    { type: "live", label: "Live Account", balance: balances.live, available: false },
  ];
  const selectedBalance = accountType === "demo" ? balances.demo : balances.live;

  // Latest values for timers/async callbacks.
  const tradesRef = useRef(trades);
  tradesRef.current = trades;
  const priceRef = useRef(feed.price);
  priceRef.current = feed.price;
  const marketRef = useRef(market);
  marketRef.current = market;
  const settling = useRef(new Set<string>());

  // Settle expired demo trades.
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const due = tradesRef.current.filter((t) => t.status === "open" && t.expiresAt <= now && !settling.current.has(t.id));
      if (!due.length) return;
      const results = new Map<string, Trade>();
      let credit = 0;
      for (const t of due) {
        settling.current.add(t.id);
        const mk = MARKET_MAP[t.marketId];
        const live = marketRef.current.id === t.marketId ? priceRef.current : null;
        const exit = live ?? simulateExitPrice(mk, t.entryPrice, t.durationSec);
        const r = settleTrade(t, exit);
        results.set(t.id, r.trade);
        credit += r.credit;
      }
      setTrades((prev) => prev.map((t) => results.get(t.id) ?? t));
      if (credit > 0) setBalances((b) => ({ ...b, demo: Math.round((b.demo + credit) * 100) / 100 }));
    }, 400);
    return () => clearInterval(id);
  }, []);

  // Tabs / market selection
  const handleSelectMarket = useCallback(
    (m: Market) => {
      setTabIds((ids) => {
        if (ids.includes(m.id)) return ids;
        if (selector?.mode === "add") return ids.length >= MAX_TABS ? ids : [...ids, m.id];
        return ids.map((id) => (id === activeId ? m.id : id));
      });
      setActiveId(m.id);
      setSelector(null);
      goTrade();
    },
    [selector, activeId],
  );

  const handleCloseTab = (id: string) => {
    if (tabIds.length <= 1) return;
    const idx = tabIds.indexOf(id);
    const next = tabIds.filter((x) => x !== id);
    setTabIds(next);
    if (id === activeId) setActiveId(next[Math.max(0, idx - 1)]);
  };

  const toggleFavorite = (id: string) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  // Trading
  const validInvestment = investment >= MIN_INVESTMENT && investment <= MAX_INVESTMENT;
  let disabledReason: string | null = null;
  if (accountType === "live") {
    // Real-money trading does not exist in this prototype: never execute or fabricate a live trade.
    disabledReason =
      balances.live < MIN_INVESTMENT || investment > balances.live
        ? "Deposit funds to trade with your Live Account."
        : "Live trading is not available in this prototype.";
  } else if (!feed.ready || feed.price === null) {
    disabledReason = "Waiting for the demo feed…";
  } else if (!validInvestment) {
    disabledReason = `Enter an investment between ${formatMoney(MIN_INVESTMENT)} and ${formatMoney(MAX_INVESTMENT)}.`;
  } else if (investment > balances.demo) {
    disabledReason = "Not enough demo balance for this investment.";
  }

  const handleTrade = (direction: OrderDirection) => {
    if (disabledReason || placing || feed.price === null) return;
    const entry = feed.price;
    const mk = market;
    const amount = investment;
    const dur = durationSec;
    setPlacing(direction);
    // Short simulated submit delay to show the loading state.
    setTimeout(() => {
      const trade = createDemoTrade({ market: mk, direction, investment: amount, durationSec: dur, entryPrice: entry });
      setBalances((b) => ({ ...b, demo: Math.round((b.demo - amount) * 100) / 100 }));
      setTrades((prev) => [trade, ...prev].slice(0, 50));
      setPlacing(null);
    }, 450);
  };

  const goTrade = () => {
    if (!isTrade) router.push("/dashboard");
  };

  const handleLogout = () => {
    clearDemoUser();
    void fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/signup");
  };

  const chargeLive = (amount: number): boolean => {
    if (balances.live < amount) return false;
    setBalances((b) => ({ ...b, live: Math.round((b.live - amount) * 100) / 100 }));
    return true;
  };

  const openTrades = useMemo(() => trades.filter((t) => t.status === "open"), [trades]);

  return (
    <DashboardContext.Provider value={{ user, demoBalance: balances.demo, liveBalance: balances.live, chargeLive, logout: handleLogout }}>
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-ink-950 text-slate-100">
      <TopBar
        tabs={tabs}
        activeId={activeId}
        maxTabs={MAX_TABS}
        onActivate={(id) => {
          setActiveId(id);
          goTrade();
        }}
        onCloseTab={handleCloseTab}
        onOpenSelector={(mode, anchorLeft) => setSelector({ mode, anchorLeft })}
        accounts={accounts}
        accountType={accountType}
        onAccountChange={setAccountType}
        onSetDemoBalance={(n) => setBalances((b) => ({ ...b, demo: Math.round(n * 100) / 100 }))}
        onDeposit={() => router.push("/dashboard/deposit")}
        onWithdraw={() => router.push("/dashboard/withdraw")}
        onNotifications={() =>
          setModal({ title: "Notifications", message: "You have no notifications. This feature will be connected later." })
        }
        onMenu={() => setDrawerOpen(true)}
      />

      <div className="relative flex min-h-0 flex-1">
        <Sidebar drawerOpen={drawerOpen} onCloseDrawer={() => setDrawerOpen(false)} />

        <main
          id="main"
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden pb-14 md:pb-0 lg:overflow-hidden"
        >
          <div className={isTrade ? "h-full" : "hidden"}>
          {/* Mobile: chart fills the leftover height, compact trade ticket sits right below it.
              Desktop (lg+): chart on the left, full trade column on the right. */}
          <div className="flex h-full flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:grid-rows-1">
            {/* Chart: takes all remaining height on mobile, full height on desktop */}
            <div className="relative min-h-[220px] min-w-0 flex-1 overflow-hidden lg:h-full lg:min-h-0 lg:flex-none">
              <TradingChart
                market={market}
                candles={feed.candles}
                ready={feed.ready}
                timeframe={timeframe}
                onTimeframe={setTimeframe}
                openTrades={isReal ? [] : openTrades}
                isSimulated={feed.isSimulated}
                isReal={isReal}
                providerName={feed.providerName}
              />
            </div>

            {/* Trade ticket (Up/Down). On desktop the open trades + history sit below it. */}
            <div className="flex min-w-0 shrink-0 flex-col lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-white/[0.06] lg:bg-ink-900">
              <TradePanel
                market={market}
                durationSec={durationSec}
                onDuration={setDurationSec}
                investment={investment}
                onInvestment={(n) => setInvestment(Number.isFinite(n) ? n : MIN_INVESTMENT)}
                placing={placing}
                disabledReason={disabledReason}
                onTrade={handleTrade}
                isReal={isReal}
                onDeposit={() => router.push("/dashboard/deposit")}
                showClock={showClock}
                onToggleClock={() => setShowClock((v) => !v)}
              />
              {/* Hidden on mobile to keep the chart large; open trades are still drawn on the chart. */}
              <div className="hidden lg:contents">
                <TradeHistory trades={isReal ? [] : trades} markets={MARKET_MAP} isReal={isReal} />
              </div>
            </div>
          </div>
          </div>
          {!isTrade && <div className="h-full">{children}</div>}
        </main>
      </div>

      <MobileNav />

      {selector && (
        <MarketSelector
          activeId={activeId}
          favorites={favorites}
          mode={selector.mode}
          anchorLeft={selector.anchorLeft}
          onSelect={handleSelectMarket}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelector(null)}
        />
      )}

      {reminderOpen && liveEmpty && isTrade && !placing && (
        <DepositReminder
          onDeposit={() => {
            setReminderOpen(false);
            router.push("/dashboard/deposit");
          }}
          onDismiss={dismissReminder}
        />
      )}

      {modal && <PlaceholderModal title={modal.title} message={modal.message} onClose={() => setModal(null)} />}

      <span className="sr-only" aria-live="polite">
        {accountType === "demo" ? "Demo account" : "Live account"} balance {formatMoney(selectedBalance)}
      </span>
    </div>
    </DashboardContext.Provider>
  );
}