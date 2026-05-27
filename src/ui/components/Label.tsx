import type { ReactNode } from 'react';

export function Label({ children }: { children: ReactNode }) {
  return <div className="text-xs font-semibold tracking-wide text-vyb-text/80">{children}</div>;
}

