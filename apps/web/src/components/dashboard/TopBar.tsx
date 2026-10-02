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
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-2 py-2 sm:px-3 lg:flex-nowrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={props.onMenu}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-md text-slate-300 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <MenuIcon size={22} />
          </button>
          <div className="flex items-center gap-3">
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

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
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
            className="h-10 rounded-md bg-brand px-3 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover sm:px-4"
          >
            Deposit
          </button>
          <button
            type="button"
            onClick={props.onWithdraw}
            className="h-10 rounded-md bg-ink-700 px-3 text-[13px] font-bold text-white transition-colors hover:bg-ink-600 sm:px-4"
          >
            Withdrawal
          </button>
        </div>
      </div>
    </header>
  );
}
