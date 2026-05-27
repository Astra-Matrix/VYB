import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export function IconButton({
  className,
  children,
  variant = 'ghost',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'ghost' | 'secondary';
  children: ReactNode;
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg p-2 transition',
        variant === 'ghost' && 'bg-transparent text-vyb-text/90 hover:bg-white/5',
        variant === 'secondary' && 'bg-vyb-elevated text-vyb-text hover:bg-[#2a3142]',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

