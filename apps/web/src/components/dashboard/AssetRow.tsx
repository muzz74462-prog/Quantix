"use client";

import type { Market } from "@/types/trading";
import { MarketIcon } from "./MarketIcon";
import { StarIcon } from "./DashIcons";

export { MarketIcon };

type AssetRowProps = {
  market: Market;
  active: boolean;
  favorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
};

export function AssetRow({ market, active, favorite, onSelect, onToggleFavorite }: AssetRowProps) {
  return (
    <div
      className={`group flex items-center gap-1.5 rounded-lg border px-1.5 py-1 transition-colors ${
        active
          ? "border-brand/70 bg-brand/10"
          : "border-white/[0.08] bg-ink-900/60 hover:border-white/25 hover:bg-white/[0.04]"
      }`}
    >
      <button
        type="button"
        onClick={onToggleFavorite}
        aria-label={favorite ? `Remove ${market.name} from favorites` : `Add ${market.name} to favorites`}
        aria-pressed={favorite}
        className={`shrink-0 rounded p-1 transition-colors ${
          favorite ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
        }`}
      >
        <StarIcon size={14} fill={favorite ? "currentColor" : "none"} />
      </button>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className="flex min-w-0 flex-1 items-center gap-2 py-0.5 text-left"
      >
        <MarketIcon market={market} size={26} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-semibold leading-tight text-white">{market.name}</span>
          <span className="block truncate text-[10px] text-slate-500">{market.assetType}</span>
        </span>
        <span className="shrink-0 rounded bg-up/10 px-1.5 py-0.5 text-[12px] font-bold text-up">{market.payout}%</span>
      </button>
    </div>
  );
}
