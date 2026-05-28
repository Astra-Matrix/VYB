import clsx from 'clsx';

type HudRingProps = {
  size?: number;
  className?: string;
  animate?: boolean;
  label?: string;
  progress?: number;
};

/**
 * Radial segmented HUD ring — hero loaders, boot sequences, diagnostics focal points.
 */
export function HudRing({ size = 280, className, animate = true, label, progress }: HudRingProps) {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.42;
  const rMid = size * 0.34;
  const rInner = size * 0.26;
  const stroke = 2;

  const arc = (radius: number, startDeg: number, sweepDeg: number) => {
    const start = (startDeg * Math.PI) / 180;
    const end = ((startDeg + sweepDeg) * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);
    const large = sweepDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  const progressSweep = progress !== undefined ? Math.min(1, Math.max(0, progress)) * 270 : undefined;

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="hud-plasma" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b1a" />
            <stop offset="50%" stopColor="#ffb347" />
            <stop offset="100%" stopColor="#e83a2a" />
          </linearGradient>
          <linearGradient id="hud-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00c8e0" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#00c8e0" stopOpacity="0.9" />
          </linearGradient>
          <filter id="hud-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Precision guide rings */}
        <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={rMid} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        <g className={animate ? 'animate-boot-spin' : undefined} style={{ transformOrigin: `${cx}px ${cy}px` }}>
        {/* Tick marks */}
        {Array.from({ length: 48 }).map((_, i) => {
          const a = (i * 360) / 48;
          const rad = (a * Math.PI) / 180;
          const x1 = cx + (rOuter - 4) * Math.cos(rad);
          const y1 = cy + (rOuter - 4) * Math.sin(rad);
          const x2 = cx + (rOuter + (i % 6 === 0 ? 6 : 2)) * Math.cos(rad);
          const y2 = cy + (rOuter + (i % 6 === 0 ? 6 : 2)) * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i % 6 === 0 ? 'rgba(255,107,26,0.35)' : 'rgba(255,255,255,0.12)'}
              strokeWidth={i % 6 === 0 ? 1 : 0.5}
            />
          );
        })}

        </g>

        {/* Plasma arcs (static focal energy) */}
        <path
          d={arc(rOuter, -120, 85)}
          fill="none"
          stroke="url(#hud-plasma)"
          strokeWidth={stroke + 1}
          strokeLinecap="round"
          filter="url(#hud-glow)"
          className={animate ? 'animate-hud-arc' : undefined}
        />
        <path
          d={arc(rOuter, 60, 70)}
          fill="none"
          stroke="url(#hud-plasma)"
          strokeWidth={stroke}
          strokeLinecap="round"
          opacity={0.7}
        />
        <path
          d={arc(rMid, 200, 55)}
          fill="none"
          stroke="url(#hud-cyan)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />

        {progressSweep !== undefined ? (
          <path
            d={arc(rMid, -90, progressSweep)}
            fill="none"
            stroke="url(#hud-plasma)"
            strokeWidth={stroke + 0.5}
            strokeLinecap="round"
            filter="url(#hud-glow)"
          />
        ) : null}

        {/* Corner brackets — center focal */}
        {[
          [cx - 28, cy - 28, 12, 12],
          [cx + 16, cy - 28, -12, 12],
          [cx - 28, cy + 16, 12, -12],
          [cx + 16, cy + 16, -12, -12],
        ].map(([x, y, dx, dy], i) => (
          <g key={i} stroke="rgba(255,107,26,0.6)" strokeWidth="1.5" fill="none">
            <path d={`M ${x} ${y + dy} L ${x} ${y} L ${x + dx} ${y}`} />
          </g>
        ))}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-8">
        {label ? (
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-vyb-muted">{label}</span>
        ) : null}
      </div>
    </div>
  );
}
