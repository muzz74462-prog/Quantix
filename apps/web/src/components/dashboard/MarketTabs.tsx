"use client";

import type { MouseEvent } from "react";
import type { Market } from "@/types/trading";
import { ChevronDownIcon, CloseIcon, PlusIcon } from "@/components/ui/Icons";
import { MarketIcon } from "./AssetRow";

type MarketTabsProps = {
  tabs: Market[];
  activeId: string;
  maxTabs: number;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  /** Opens the selector. `mode` "switch" replaces the active tab's market; "add" opens a new tab. */
  onOpenSelector: (mode: "switch" | "add", anchorLeft: number) => void;
};

export function MarketTabs({ tabs, activeId, maxTabs, onActivate, onClose, onOpenSelector }: MarketTabsProps) {
  const open = (mode: "switch" | "add") => (e: MouseEvent<HTMLElement>) => {
    onOpenSelector(mode, e.currentTarget.getBoundingClientRect().left);
  };

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <div role="tablist" aria-label="Open markets" className="flex min-w-0 items-center gap-1.5 overflow-x-auto">
        {tabs.map((m) => {
          const active = m.id === activeId;
          return (
            <div
              key={m.id}
              className={`flex h-10 shrink-0 items-stretch overflow-hidden rounded-md border border-b-2 transition-colors ${
                active
                  ? "border-white/20 border-b-brand bg-ink-700 shadow-[0_0_0_1px_rgba(18,180,95,0.15)]"
                  : "border-white/[0.08] border-b-transparent bg-ink-800 hover:border-white/20 hover:bg-ink-700/70"
              }`}
            >
              <button
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onActivate(m.id)}
                className="flex items-center gap-2 pl-2 pr-1.5 text-left"
              >
                <MarketIcon market={m} size={22} />
                <span className="leading-tight">
                  <span className="block max-w-[110px] truncate text-[12px] font-bold text-white">{m.name}</span>
                  <span className="block text-[11px] font-semibold text-up">{m.payout}%</span>
                </span>
              </button>
              {active && (
                <button
                  type="button"
                  onClick={open("switch")}
                  aria-label="Change market"
                  aria-haspopup="dialog"
                  className="flex w-6 items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <ChevronDownIcon size={16} />
                </button>
              )}
              {tabs.length > 1 && (
                <button
                  type="button"
                  onClick={() => onClose(m.id)}
                  aria-label={`Close ${m.name}`}
                  className="flex w-6 items-center justify-center text-slate-500 hover:bg-white/10 hover:text-white"
                >
                  <CloseIcon size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={open("add")}
        disabled={tabs.length >= maxTabs}
        aria-label="Add market"
        aria-haspopup="dialog"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-white transition-colors hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <PlusIcon size={18} />
      </button>
    </div>
  );
}
