"use client";

import type { Account, AccountType, Market } from "@/types/trading";
import { Logo } from "@/components/ui/Logo";
import { MenuIcon } from "@/components/ui/Icons";
import { AccountSwitcher } from "./AccountSwitcher";
import { MarketTabs } from "./MarketTabs";
import { BellIcon } from "./DashIcons";

type TopBarProps = {
  tabs: Market[];
  activeId: string;
  maxTabs: number;
  onActivate: (id: string) => void;
  onCloseTab: (id: string) => void;
  onOpenSelector: (mode: "switch" | "add", anchorLeft: number) => void;
  accounts: Account[];
  accountType: AccountType;
  onAccountChange: (t: AccountType) => void;
  onSetDemoBalance: (amount: number) => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onNotifications: () => void;
  onMenu: () => void;
};

export function TopBar(props: TopBarProps) {
  return (
    <header className="shrink-0 border-b border-white/[0.06] bg-ink-900">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-2 py-1.5 sm:gap-x-3 sm:px-3 sm:py-2 lg:flex-nowrap">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            onClick={props.onMenu}
            aria-label="Open menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-300 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <MenuIcon size={22} />
          </button>
          <div className="flex min-w-0 items-center gap-3">
            <Logo />
            <span className="hidden whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 xl:inline">
              Web trading platform
            </span>
          </div>
        </div>

        <div className="order-last min-w-0 basis-full lg:order-none lg:flex-1 lg:basis-auto">
          <MarketTabs
            tabs={props.tabs}
            activeId={props.activeId}
            maxTabs={props.maxTabs}
            onActivate={props.onActivate}
            onClose={props.onCloseTab}
            onOpenSelector={props.onOpenSelector}
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={props.onNotifications}
            aria-label="Notifications"
            className="hidden h-10 w-10 items-center justify-center rounded-md text-slate-300 hover:bg-white/5 hover:text-white sm:flex"
          >
            <BellIcon size={20} />
          </button>
          <AccountSwitcher
            accounts={props.accounts}
            selected={props.accountType}
            onSelect={props.onAccountChange}
            onSetDemoBalance={props.onSetDemoBalance}
            onDeposit={props.onDeposit}
          />
          <button
            type="button"
            onClick={props.onDeposit}
            className="h-9 rounded-md bg-brand px-3 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover sm:h-10 sm:px-4"
          >
            Deposit
          </button>
          {/* Hidden on small phones to keep the top bar on one line; Withdrawal stays reachable from the menu. */}
          <button
            type="button"
            onClick={props.onWithdraw}
            className="hidden h-10 rounded-md bg-ink-700 px-4 text-[13px] font-bold text-white transition-colors hover:bg-ink-600 sm:block"
          >
            Withdrawal
          </button>
        </div>
      </div>
    </header>
  );
}