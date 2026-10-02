"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Market, MarketCategory } from "@/types/trading";
import { CATEGORY_LABELS, CATEGORY_ORDER, MARKETS } from "@/lib/markets";
import { CloseIcon } from "@/components/ui/Icons";
import { AssetRow } from "./AssetRow";
import { SearchIcon, StarIcon } from "./DashIcons";

type Filter = MarketCategory | "favorites";

type MarketSelectorProps = {
  activeId: string;
  favorites: string[];
  /** Title hint: replacing the current tab or adding a new one. */
  mode: "switch" | "add";
  /** Left edge (px) of the anchor, used to place the panel on wide screens. */
  anchorLeft: number;
  onSelect: (market: Market) => void;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
};

export function MarketSelector({
  activeId,
  favorites,
  mode,
  anchorLeft,
  onSelect,
  onToggleFavorite,
  onClose,
}: MarketSelectorProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("forex");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const list = useMemo(() => {
    return MARKETS.filter((m) => {
      if (q) return m.name.toLowerCase().includes(q) || m.assetType.toLowerCase().includes(q);
      if (filter === "favorites") return favorites.includes(m.id);
      return m.category === filter;
    });
  }, [q, filter, favorites]);

  const chips: { id: Filter; label: string }[] = [
    { id: "favorites", label: "Favorites" },
    ...CATEGORY_ORDER.map((c) => ({ id: c as Filter, label: CATEGORY_LABELS[c] })),
  ];

  // Keep the panel inside the viewport on wide screens.
  const left = typeof window === "undefined" ? 72 : Math.max(8, Math.min(anchorLeft, window.innerWidth - 588));

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-label="Select market"
        style={{ "--sel-left": `${left}px` } as CSSProperties}
        className="fixed inset-x-2 top-28 z-50 flex max-h-[min(540px,calc(100dvh-8rem))] flex-col overflow-hidden rounded-xl border border-white/15 bg-ink-800 shadow-2xl shadow-black/60 sm:inset-x-auto sm:left-[var(--sel-left)] sm:top-[6.25rem] sm:w-[572px] lg:top-[3.75rem]"
      >
        <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2.5">
          <h2 className="text-[13px] font-bold text-white">
            {mode === "add" ? "Add market" : "Select market"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close market selector"
            className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="px-3 pt-3">
          <label className="relative block">
            <span className="sr-only">Search markets</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon size={16} />
            </span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search markets"
              className="h-9 w-full rounded-md border border-white/10 bg-ink-900 pl-9 pr-3 text-[13px] text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
            />
          </label>
        </div>

        <div role="tablist" aria-label="Market categories" className="flex flex-wrap gap-1.5 px-3 py-3">
          {chips.map((c) => {
            const on = !q && filter === c.id;
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={on}
                type="button"
                onClick={() => {
                  setFilter(c.id);
                  setQuery("");
                }}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  on ? "border-brand bg-brand text-white" : "border-white/10 bg-ink-900 text-slate-300 hover:border-white/25 hover:text-white"
                }`}
              >
                {c.id === "favorites" && <StarIcon size={12} fill={on ? "currentColor" : "none"} />}
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-4 pb-1 text-[11px] uppercase tracking-wide text-slate-500">
          <span>{list.length} markets</span>
          <span className="hidden sm:inline">Payout %</span>
        </div>

        <div className="grid min-h-[120px] flex-1 grid-cols-1 content-start gap-1.5 overflow-y-auto px-3 pb-3 [scrollbar-color:#313a54_transparent] [scrollbar-width:thin] sm:grid-cols-2">
          {list.length === 0 ? (
            <p className="px-3 py-8 text-center text-[13px] text-slate-400 sm:col-span-2">
              {filter === "favorites" && !q ? "Star a market to pin it here." : "No markets match your search."}
            </p>
          ) : (
            list.map((m) => (
              <AssetRow
                key={m.id}
                market={m}
                active={m.id === activeId}
                favorite={favorites.includes(m.id)}
                onSelect={() => onSelect(m)}
                onToggleFavorite={() => onToggleFavorite(m.id)}
              />
            ))
          )}
        </div>

        <p className="border-t border-white/[0.07] bg-ink-900/50 px-4 py-2 text-[11px] text-slate-500">
          Demo markets with simulated prices and sample payouts.
        </p>
      </div>
    </>
  );
}
