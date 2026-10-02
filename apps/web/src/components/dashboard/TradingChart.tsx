"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import type { Candle, Market, Timeframe, Trade } from "@/types/trading";
import { ChartToolbar, type ChartOptions } from "./ChartToolbar";

type TradingChartProps = {
  market: Market;
  candles: Candle[];
  ready: boolean;
  timeframe: Timeframe;
  onTimeframe: (tf: Timeframe) => void;
  openTrades: Trade[];
  isSimulated: boolean;
  isReal?: boolean;
  providerName: string;
};

const AXIS_W = 66;
const AXIS_H = 24;
const PAD_BARS = 6;
const MIN_VISIBLE = 15;
const MAX_VISIBLE = 300;
const DEFAULT_VISIBLE = 80;

const COLOR = {
  up: "#2fbf71",
  down: "#ef5b53",
  grid: "rgba(255,255,255,0.05)",
  axis: "#7f8aa8",
  border: "rgba(255,255,255,0.08)",
  crosshair: "rgba(200,208,230,0.45)",
  label: "#313a54",
  sma: "#f5b83d",
  ema: "#b07cff",
  draw: "#3b8bff",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const p2 = (n: number) => String(n).padStart(2, "0");

function fmtTime(sec: number, tf: Timeframe, long = false): string {
  const d = new Date(sec * 1000);
  if (tf === "1d") return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const t = `${p2(d.getHours())}:${p2(d.getMinutes())}`;
  return long ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${t}` : t;
}

function niceStep(raw: number): number {
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  const m = n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10;
  return m * mag;
}

function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}

function ema(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  const k = 2 / (period + 1);
  let prev: number | null = null;
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      out.push(null);
      continue;
    }
    if (prev === null) {
      let s = 0;
      for (let j = i - period + 1; j <= i; j++) s += values[j];
      prev = s / period;
    } else {
      prev = values[i] * k + prev * (1 - k);
    }
    out.push(prev);
  }
  return out;
}

export function TradingChart({
  market,
  candles,
  ready,
  timeframe,
  onTimeframe,
  openTrades,
  isSimulated,
  isReal = false,
  providerName,
}: TradingChartProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [options, setOptions] = useState<ChartOptions>({ grid: true, priceLine: true, sma: false, ema: false });
  const [drawMode, setDrawMode] = useState(false);
  const [drawings, setDrawings] = useState<Record<string, number[]>>({});
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const view = useRef({ visible: DEFAULT_VISIBLE, offset: 0 });
  const cross = useRef<{ x: number; y: number } | null>(null);
  const scale = useRef({ min: 0, max: 1, plotH: 1, plotW: 1, barW: 1, viewEnd: 0 });
  const drag = useRef<{ x: number; offset: number; moved: boolean } | null>(null);
  const raf = useRef(0);

  const live = useRef({ candles, market, timeframe, options, drawings, openTrades, drawMode });
  live.current = { candles, market, timeframe, options, drawings, openTrades, drawMode };

  const draw = useCallback(() => {
    raf.current = 0;
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { candles: cs, market: mk, timeframe: tf, options: opt, drawings: dr, openTrades: ot } = live.current;

    const w = host.clientWidth;
    const h = host.clientHeight;
    if (w < 10 || h < 10) return;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const n = cs.length;
    if (!n) return;

    const axisW = w < 420 ? 54 : AXIS_W;
    const plotW = w - axisW;
    const plotH = h - AXIS_H;
    const { visible } = view.current;
    const maxOffset = Math.max(0, n - 10);
    view.current.offset = Math.min(maxOffset, Math.max(-10, view.current.offset));
    const offset = view.current.offset;
    const barW = plotW / visible;
    const viewEnd = n - 1 + PAD_BARS - offset;
    const xOf = (i: number) => plotW - (viewEnd - i + 0.5) * barW;

    const first = Math.max(0, Math.floor(viewEnd - visible));
    const last = Math.min(n - 1, Math.ceil(viewEnd));
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = first; i <= last; i++) {
      if (cs[i].low < lo) lo = cs[i].low;
      if (cs[i].high > hi) hi = cs[i].high;
    }
    if (!isFinite(lo) || !isFinite(hi)) return;
    const price = cs[n - 1].close;
    lo = Math.min(lo, price);
    hi = Math.max(hi, price);
    if (hi - lo < 1e-9) {
      hi += 1e-4;
      lo -= 1e-4;
    }
    const padY = (hi - lo) * 0.1;
    const min = lo - padY;
    const max = hi + padY;
    const yOf = (p: number) => plotH - ((p - min) / (max - min)) * plotH;
    scale.current = { min, max, plotH, plotW, barW, viewEnd };

    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.textBaseline = "middle";

    // Grid + price axis
    const step = niceStep((max - min) / Math.max(3, Math.floor(plotH / 56)));
    ctx.lineWidth = 1;
    for (let p = Math.ceil(min / step) * step; p <= max; p += step) {
      const y = Math.round(yOf(p)) + 0.5;
      if (opt.grid) {
        ctx.strokeStyle = COLOR.grid;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(plotW, y);
        ctx.stroke();
      }
      ctx.fillStyle = COLOR.axis;
      ctx.textAlign = "left";
      ctx.fillText(p.toFixed(mk.decimals), plotW + 6, y);
    }

    // Time axis
    const every = Math.max(1, Math.ceil(84 / barW));
    ctx.textAlign = "center";
    for (let i = first; i <= last; i++) {
      if (i % every !== 0) continue;
      const x = Math.round(xOf(i)) + 0.5;
      if (x < 20 || x > plotW - 20) continue;
      if (opt.grid) {
        ctx.strokeStyle = COLOR.grid;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, plotH);
        ctx.stroke();
      }
      ctx.fillStyle = COLOR.axis;
      ctx.fillText(fmtTime(cs[i].time, tf), x, plotH + AXIS_H / 2 + 1);
    }

    // Axis borders
    ctx.strokeStyle = COLOR.border;
    ctx.beginPath();
    ctx.moveTo(plotW + 0.5, 0);
    ctx.lineTo(plotW + 0.5, plotH);
    ctx.lineTo(0, plotH + 0.5);
    ctx.moveTo(0, plotH + 0.5);
    ctx.lineTo(plotW, plotH + 0.5);
    ctx.stroke();

    // Clip plot area
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, plotW, plotH);
    ctx.clip();

    // Candles
    const bodyW = Math.max(1, Math.floor(barW * 0.7));
    for (let i = first; i <= last; i++) {
      const c = cs[i];
      const x = Math.round(xOf(i));
      const up = c.close >= c.open;
      ctx.fillStyle = ctx.strokeStyle = up ? COLOR.up : COLOR.down;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 0.5, yOf(c.high));
      ctx.lineTo(x + 0.5, yOf(c.low));
      ctx.stroke();
      const yO = yOf(c.open);
      const yC = yOf(c.close);
      ctx.fillRect(Math.round(x - bodyW / 2), Math.min(yO, yC), bodyW, Math.max(1, Math.abs(yO - yC)));
    }

    // Indicators
    const closes = cs.map((c) => c.close);
    const line = (vals: (number | null)[], color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      for (let i = Math.max(0, first - 1); i <= last; i++) {
        const v = vals[i];
        if (v === null) continue;
        const x = xOf(i) + 0.5;
        if (!started) {
          ctx.moveTo(x, yOf(v));
          started = true;
        } else ctx.lineTo(x, yOf(v));
      }
      ctx.stroke();
    };
    if (opt.sma) line(sma(closes, 20), COLOR.sma);
    if (opt.ema) line(ema(closes, 50), COLOR.ema);

    // User drawings (horizontal lines)
    ctx.setLineDash([]);
    for (const p of dr[mk.id] ?? []) {
      const y = Math.round(yOf(p)) + 0.5;
      ctx.strokeStyle = COLOR.draw;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(plotW, y);
      ctx.stroke();
    }

    // Open demo trades on this market
    ctx.setLineDash([4, 4]);
    for (const t of ot) {
      if (t.marketId !== mk.id) continue;
      const y = Math.round(yOf(t.entryPrice)) + 0.5;
      const col = t.direction === "up" ? COLOR.up : COLOR.down;
      ctx.strokeStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(plotW, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = col;
      ctx.textAlign = "right";
      ctx.fillText(`${t.direction === "up" ? "▲" : "▼"} $${t.investment}`, plotW - 6, y - 8);
      ctx.setLineDash([4, 4]);
    }
    ctx.setLineDash([]);

    // Current price line
    const lastCandle = cs[n - 1];
    const priceUp = lastCandle.close >= lastCandle.open;
    const pc = priceUp ? COLOR.up : COLOR.down;
    const py = Math.min(plotH - 1, Math.max(1, yOf(price)));
    if (opt.priceLine) {
      ctx.strokeStyle = pc;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, Math.round(py) + 0.5);
      ctx.lineTo(plotW, Math.round(py) + 0.5);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Crosshair lines
    const cr = cross.current;
    let snapIdx: number | null = null;
    if (cr && cr.x >= 0 && cr.x <= plotW && cr.y >= 0 && cr.y <= plotH) {
      const idx = Math.round(viewEnd + 0.5 - (plotW - cr.x) / barW);
      if (idx >= 0 && idx < n) snapIdx = idx;
      const cx = snapIdx !== null ? Math.round(xOf(snapIdx)) + 0.5 : cr.x;
      ctx.strokeStyle = COLOR.crosshair;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, plotH);
      ctx.moveTo(0, Math.round(cr.y) + 0.5);
      ctx.lineTo(plotW, Math.round(cr.y) + 0.5);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();

    // Axis tags
    const tag = (text: string, y: number, bg: string) => {
      ctx.fillStyle = bg;
      ctx.fillRect(plotW, y - 9, axisW, 18);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "left";
      ctx.fillText(text, plotW + 6, y);
    };
    if (opt.priceLine) tag(price.toFixed(mk.decimals), py, pc);
    for (const t of ot) {
      if (t.marketId !== mk.id) continue;
      const y = yOf(t.entryPrice);
      if (y > 0 && y < plotH) tag(t.entryPrice.toFixed(mk.decimals), y, t.direction === "up" ? COLOR.up : COLOR.down);
    }
    if (cr && cr.x >= 0 && cr.x <= plotW && cr.y >= 0 && cr.y <= plotH) {
      const pAt = min + ((plotH - cr.y) / plotH) * (max - min);
      tag(pAt.toFixed(mk.decimals), cr.y, COLOR.label);
      if (snapIdx !== null) {
        const label = fmtTime(cs[snapIdx].time, tf, true);
        const tw = ctx.measureText(label).width + 14;
        const lx = Math.min(plotW - tw / 2, Math.max(tw / 2, xOf(snapIdx)));
        ctx.fillStyle = COLOR.label;
        ctx.fillRect(lx - tw / 2, plotH + 2, tw, 18);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(label, lx, plotH + 12);
      }
    }
  }, []);

  const schedule = useCallback(() => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(draw);
  }, [draw]);

  // Redraw after every render (data, options, trades, etc.).
  useEffect(() => {
    schedule();
  });

  // Reset the viewport when the market or timeframe changes.
  useEffect(() => {
    view.current = { visible: DEFAULT_VISIBLE, offset: 0 };
    cross.current = null;
    setHoverIdx(null);
    schedule();
  }, [market.id, timeframe, schedule]);

  // Resize handling.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ro = new ResizeObserver(() => schedule());
    ro.observe(host);
    return () => {
      ro.disconnect();
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [schedule]);

  // Wheel zoom (needs a non-passive listener to prevent page scroll).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const f = e.deltaY > 0 ? 1.12 : 1 / 1.12;
      view.current.visible = Math.min(MAX_VISIBLE, Math.max(MIN_VISIBLE, view.current.visible * f));
      schedule();
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [schedule]);

  // Fullscreen state sync.
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const localPoint = (e: RPointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: RPointerEvent<HTMLCanvasElement>) => {
    const pt = localPoint(e);
    drag.current = { x: pt.x, offset: view.current.offset, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: RPointerEvent<HTMLCanvasElement>) => {
    const pt = localPoint(e);
    cross.current = pt;
    const d = drag.current;
    if (d) {
      const dx = pt.x - d.x;
      if (Math.abs(dx) > 3) d.moved = true;
      if (d.moved) view.current.offset = d.offset + dx / scale.current.barW;
    }
    const { plotW, barW, viewEnd } = scale.current;
    const idx = Math.round(viewEnd + 0.5 - (plotW - pt.x) / barW);
    const next = idx >= 0 && idx < live.current.candles.length && pt.x <= plotW ? idx : null;
    setHoverIdx((cur) => (cur === next ? cur : next));
    schedule();
  };

  const onPointerUp = (e: RPointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved && live.current.drawMode) {
      const pt = localPoint(e);
      const s = scale.current;
      if (pt.x <= s.plotW && pt.y <= s.plotH) {
        const price = s.min + ((s.plotH - pt.y) / s.plotH) * (s.max - s.min);
        const id = live.current.market.id;
        setDrawings((cur) => ({ ...cur, [id]: [...(cur[id] ?? []), price] }));
      }
    }
  };

  const onPointerLeave = () => {
    cross.current = null;
    setHoverIdx(null);
    schedule();
  };

  const zoom = (dir: "in" | "out") => {
    const f = dir === "in" ? 1 / 1.3 : 1.3;
    view.current.visible = Math.min(MAX_VISIBLE, Math.max(MIN_VISIBLE, view.current.visible * f));
    schedule();
  };

  const fullscreen = () => {
    const el = rootRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else if (el.requestFullscreen) void el.requestFullscreen().catch(() => undefined);
  };

  const shown: Candle | undefined = hoverIdx !== null ? candles[hoverIdx] : candles[candles.length - 1];
  const dec = market.decimals;
  const up = shown ? shown.close >= shown.open : true;

  return (
    <div ref={rootRef} className="flex h-full min-h-0 w-full flex-col bg-ink-950 md:flex-row">
      <ChartToolbar
        timeframe={timeframe}
        onTimeframe={onTimeframe}
        drawMode={drawMode}
        onToggleDraw={() => setDrawMode((v) => !v)}
        drawingCount={(drawings[market.id] ?? []).length}
        onClearDrawings={() => setDrawings((cur) => ({ ...cur, [market.id]: [] }))}
        options={options}
        onOptions={setOptions}
        onZoom={zoom}
        onFullscreen={fullscreen}
        isFullscreen={isFullscreen}
      />

      <div ref={hostRef} className="relative min-h-0 min-w-0 flex-1">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`${market.name} candlestick chart, ${timeframe} timeframe${isReal ? "" : ", simulated demo data"}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerLeave}
          onPointerLeave={onPointerLeave}
          style={{ touchAction: "pan-y", cursor: drawMode ? "crosshair" : "default" }}
          className="absolute left-0 top-0 block"
        />

        {/* OHLC readout + feed label */}
        <div className="pointer-events-none absolute left-2 top-2 flex max-w-[calc(100%-5rem)] flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
          <span className="font-bold text-white">
            {market.name} · {timeframe}
          </span>
          {shown && (
            <span className={`font-mono ${up ? "text-up" : "text-down"}`}>
              O {shown.open.toFixed(dec)} H {shown.high.toFixed(dec)} L {shown.low.toFixed(dec)} C {shown.close.toFixed(dec)}
            </span>
          )}
        </div>
        {!isReal && (
          <div className="pointer-events-none absolute bottom-8 left-2 rounded bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300/90">
            {isSimulated ? `Demo data · simulated · ${providerName}` : providerName}
          </div>
        )}

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] text-slate-400">
            {isReal ? "Loading market data…" : "Loading demo feed…"}
          </div>
        )}
      </div>
    </div>
  );
}
