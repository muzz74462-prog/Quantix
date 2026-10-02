import { generateCandles } from "@/lib/mockCandles";

type CandleChartProps = {
  width: number;
  height: number;
  count: number;
  seed?: number;
  fontSize?: number;
  className?: string;
};

const AXIS_W = 62;
const PAD_Y = 16;
const TIME_LABELS = ["14:05", "14:10", "14:15", "14:20", "14:25", "14:30"];

/** Static SVG candlestick chart built from deterministic mock data. */
export function CandleChart({
  width,
  height,
  count,
  seed = 11,
  fontSize = 11,
  className = "",
}: CandleChartProps) {
  const candles = generateCandles(count, seed);
  const plotW = width - AXIS_W;
  const plotH = height - 24 - PAD_Y;
  const hi = Math.max(...candles.map((c) => c.h));
  const lo = Math.min(...candles.map((c) => c.l));
  const span = hi - lo || 1;
  const y = (p: number) => PAD_Y + (1 - (p - lo) / span) * plotH;
  const step = plotW / count;
  const body = Math.max(3, step * 0.58);

  const last = candles[candles.length - 1];
  const lastY = y(last.c);
  const gridLevels = [0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => lo + span * t);
  const expiryX = plotW - step * 3;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`block h-auto w-full ${className}`}
      role="presentation"
      aria-hidden="true"
    >
      {gridLevels.map((p) => (
        <g key={p}>
          <line x1={0} x2={plotW} y1={y(p)} y2={y(p)} stroke="#ffffff" strokeOpacity={0.05} />
          <text x={plotW + 8} y={y(p) + 4} fontSize={fontSize} fill="#6f7a97">
            {p.toFixed(4)}
          </text>
        </g>
      ))}

      {candles.map((c, i) => {
        const x = i * step + step / 2;
        const up = c.c >= c.o;
        const color = up ? "#2fbf71" : "#ef5b53";
        const top = y(Math.max(c.o, c.c));
        const h = Math.max(1.5, Math.abs(y(c.o) - y(c.c)));
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth={1.2} />
            <rect x={x - body / 2} y={top} width={body} height={h} rx={0.6} fill={color} />
          </g>
        );
      })}

      {/* expiry marker */}
      <line x1={expiryX} x2={expiryX} y1={PAD_Y} y2={height - 24} stroke="#ffffff" strokeOpacity={0.25} strokeDasharray="3 4" />

      {/* current price line + tag */}
      <line x1={0} x2={plotW} y1={lastY} y2={lastY} stroke="#3b8bff" strokeOpacity={0.7} strokeDasharray="4 4" />
      <g className="animate-tag-pulse">
        <rect x={plotW + 2} y={lastY - 9} width={AXIS_W - 4} height={18} rx={3} fill="#3b8bff" />
        <text x={plotW + AXIS_W / 2} y={lastY + 4} fontSize={fontSize} fill="#fff" textAnchor="middle" fontWeight={600}>
          {last.c.toFixed(4)}
        </text>
      </g>

      {TIME_LABELS.map((t, i) => (
        <text
          key={t}
          x={(plotW / (TIME_LABELS.length - 1)) * i * 0.94 + 14}
          y={height - 7}
          fontSize={fontSize}
          fill="#6f7a97"
        >
          {t}
        </text>
      ))}
    </svg>
  );
}
