import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export function Button({
  className,
  children,
  variant = 'primary',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  children: ReactNode;
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-vyb-accent text-vyb-bg hover:bg-vyb-accentDim',
        variant === 'secondary' && 'bg-vyb-elevated text-vyb-text hover:bg-[#2a3142]',
        variant === 'ghost' && 'bg-transparent text-vyb-text/90 hover:bg-white/5',
        variant === 'danger' && 'bg-vyb-danger/20 text-vyb-danger hover:bg-vyb-danger/30',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

