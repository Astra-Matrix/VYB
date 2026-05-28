import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export function IconButton({
  className,
  children,
  variant = 'ghost',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'ghost' | 'secondary' | 'metal';
  children: ReactNode;
}) {
  return (
    <button
      className={clsx(
        'vyb-focus-ring inline-flex items-center justify-center rounded-md p-2 vyb-transition',
        variant === 'ghost' && 'text-vyb-text-secondary hover:text-vyb-text hover:bg-white/[0.05] hover:shadow-[0_0_12px_rgba(255,107,26,0.12)]',
        variant === 'secondary' && 'vyb-btn-secondary vyb-btn-sm !px-2',
        variant === 'metal' &&
          'border border-vyb-line/70 bg-btn-metal text-vyb-text hover:border-vyb-plasma/40',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
