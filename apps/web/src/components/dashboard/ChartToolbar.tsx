"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Timeframe } from "@/types/trading";
import { TIMEFRAMES } from "@/lib/markets";
import { IndicatorsIcon } from "@/components/ui/Icons";
import {
  FullscreenIcon,
  PencilIcon,
  SettingsIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "./DashIcons";

export type ChartOptions = {
  grid: boolean;
  priceLine: boolean;
  sma: boolean;
  ema: boolean;
};

type Panel = "indicators" | "timeframe" | "settings" | null;

type ChartToolbarProps = {
  timeframe: Timeframe;
  onTimeframe: (tf: Timeframe) => void;
  drawMode: boolean;
  onToggleDraw: () => void;
  drawingCount: number;
  onClearDrawings: () => void;
  options: ChartOptions;
  onOptions: (next: ChartOptions) => void;
  onZoom: (dir: "in" | "out") => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
};

function ToolButton({
  label,
  active,
  onClick,
  children,
  pressed,
}: {
  label: string;
  active?: boolean;
  pressed?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[12px] font-bold transition-colors ${
        active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-6 rounded px-2 py-1.5 text-[13px] text-slate-200 hover:bg-white/5">
      {label}
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#12b45f]"
      />
    </label>
  );
}

export function ChartToolbar({
  timeframe,
  onTimeframe,
  drawMode,
  onToggleDraw,
  drawingCount,
  onClearDrawings,
  options,
  onOptions,
  onZoom,
  onFullscreen,
  isFullscreen,
}: ChartToolbarProps) {
  const [panel, setPanel] = useState<Panel>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panel) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setPanel(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [panel]);

  const toggle = (p: Exclude<Panel, null>) => setPanel((cur) => (cur === p ? null : p));

  return (
    <div ref={ref} className="relative z-20 shrink-0">
      <div className="flex items-center gap-1 overflow-x-auto border-b border-white/[0.06] bg-ink-900 px-1.5 py-1 md:h-full md:w-12 md:flex-col md:overflow-visible md:border-b-0 md:border-r md:px-1.5 md:py-2">
        <ToolButton
          label={drawMode ? "Drawing: click chart to add a line (on)" : "Draw horizontal line"}
          active={drawMode}
          pressed={drawMode}
          onClick={onToggleDraw}
        >
          <PencilIcon size={18} />
        </ToolButton>
        <ToolButton label="Indicators" active={panel === "indicators"} onClick={() => toggle("indicators")}>
          <IndicatorsIcon size={18} />
        </ToolButton>
        <ToolButton label={`Timeframe (${timeframe})`} active={panel === "timeframe"} onClick={() => toggle("timeframe")}>
          {timeframe}
        </ToolButton>
        <ToolButton label="Chart settings" active={panel === "settings"} onClick={() => toggle("settings")}>
          <SettingsIcon size={18} />
        </ToolButton>
        <ToolButton label="Zoom in" onClick={() => onZoom("in")}>
          <ZoomInIcon size={18} />
        </ToolButton>
        <ToolButton label="Zoom out" onClick={() => onZoom("out")}>
          <ZoomOutIcon size={18} />
        </ToolButton>
        <ToolButton label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={onFullscreen}>
          <FullscreenIcon size={18} />
        </ToolButton>
      </div>

      {panel && (
        <div className="absolute left-2 top-full z-30 mt-1 w-56 rounded-lg border border-white/10 bg-ink-800 p-2 shadow-2xl shadow-black/50 md:left-full md:top-2 md:ml-1 md:mt-0">
          {panel === "indicators" && (
            <>
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Indicators</p>
              <Toggle label="SMA (20)" on={options.sma} onChange={(v) => onOptions({ ...options, sma: v })} />
              <Toggle label="EMA (50)" on={options.ema} onChange={(v) => onOptions({ ...options, ema: v })} />
            </>
          )}
          {panel === "timeframe" && (
            <>
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Timeframe</p>
              <div className="grid grid-cols-4 gap-1">
                {TIMEFRAMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onTimeframe(t.id);
                      setPanel(null);
                    }}
                    aria-pressed={t.id === timeframe}
                    className={`h-8 rounded text-[12px] font-bold transition-colors ${
                      t.id === timeframe ? "bg-brand text-white" : "bg-ink-700 text-slate-200 hover:bg-ink-600"
                    }`}
                  >
                    {t.id}
                  </button>
                ))}
              </div>
            </>
          )}
          {panel === "settings" && (
            <>
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Chart settings</p>
              <Toggle label="Grid" on={options.grid} onChange={(v) => onOptions({ ...options, grid: v })} />
              <Toggle label="Current price line" on={options.priceLine} onChange={(v) => onOptions({ ...options, priceLine: v })} />
              <button
                type="button"
                disabled={drawingCount === 0}
                onClick={onClearDrawings}
                className="mt-1 w-full rounded px-2 py-1.5 text-left text-[13px] text-slate-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:text-slate-600 disabled:hover:bg-transparent"
              >
                Clear drawings ({drawingCount})
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
