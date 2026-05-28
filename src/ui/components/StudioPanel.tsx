import type { ReactNode } from 'react';
import clsx from 'clsx';
import { StatusLight } from './StatusLight';

export function StudioPanel({
  title,
  icon,
  actions,
  children,
  className,
  noPadding,
  active,
}: {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  active?: boolean;
}) {
  return (
    <div
      className={clsx(
        'flex flex-col h-full min-h-0 vyb-panel vyb-surface-energize overflow-hidden',
        active && 'border-vyb-plasma/40 shadow-rim-plasma',
        className,
      )}
    >
      <div className="vyb-panel-chrome">
        <div className="flex items-center gap-2 min-w-0">
          <StatusLight variant={active ? 'plasma' : 'muted'} pulse={active} />
          {icon ? <span className="text-vyb-plasma shrink-0 opacity-90">{icon}</span> : null}
          <span className="vyb-panel-chrome-title">{title}</span>
        </div>
        {actions ? <div className="flex items-center gap-1 shrink-0">{actions}</div> : null}
      </div>
      <div className={clsx('flex-1 min-h-0 overflow-hidden', !noPadding && 'p-2')}>{children}</div>
    </div>
  );
}
