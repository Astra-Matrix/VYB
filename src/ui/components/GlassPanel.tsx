import type { ReactNode } from 'react';
import clsx from 'clsx';

/** Hero / launcher surfaces — metallic glass with HUD-friendly depth. */
export function GlassPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        'rounded-lg border border-vyb-line/70 bg-vyb-gunmetal/80 shadow-glass backdrop-blur-panel',
        'bg-panel-sheen vyb-surface-energize',
        className,
      )}
    >
      {children}
    </div>
  );
}
