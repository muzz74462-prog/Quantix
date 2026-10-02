/**
 * Original, decorative QUANTIX market backdrop: a faint area chart plus a
 * perspective floor grid. Purely visual, sits behind the card at low opacity.
 */
const POINTS: [number, number][] = [
  [0, 62], [40, 58], [80, 64], [120, 60], [160, 70], [200, 52], [240, 48], [280, 56], [320, 44], [360, 50],
  [400, 38], [440, 46], [480, 40], [520, 30], [560, 42], [600, 34], [640, 24], [680, 36], [720, 28], [760, 40],
  [800, 32], [840, 22], [880, 34], [920, 26], [960, 36], [1000, 28], [1040, 40], [1080, 34], [1120, 44], [1160, 38], [1200, 46],
];

const LINE = POINTS.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");
const AREA = `${LINE} L1200 100 L0 100 Z`;

export function AuthBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(35,92,150,0.18),transparent_70%)]" />

      <svg
        className="absolute inset-x-0 bottom-0 h-[42%] min-h-[220px] w-full"
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="auth-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a5fa8" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#2a5fa8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={AREA} fill="url(#auth-area)" />
        <path d={LINE} fill="none" stroke="#3b6fb5" strokeOpacity="0.28" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>

      <svg
        className="absolute inset-x-0 bottom-0 h-[22%] w-full opacity-[0.16]"
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={`h${i}`} x1="0" x2="1200" y1={20 + i * i * 4.5 + i * 8} y2={20 + i * i * 4.5 + i * 8} stroke="#7a8fb8" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        ))}
        {Array.from({ length: 17 }, (_, i) => {
          const x = i * 75;
          const shift = (x - 600) * 0.9;
          return <line key={`v${i}`} x1={x} x2={x + shift} y1="14" y2="100" stroke="#7a8fb8" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />;
        })}
      </svg>
    </div>
  );
}
