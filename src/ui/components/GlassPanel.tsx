import type { ReactNode } from 'react';

export function GlassPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        'rounded-xl border border-vyb-border/60 bg-vyb-panel/60 shadow-glass backdrop-blur-panel',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

