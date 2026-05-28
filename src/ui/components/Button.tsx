import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export function Button({
  className,
  children,
  variant = 'primary',
  size = 'md',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'signal' | 'warm' | 'epic';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}) {
  return (
    <button
      className={clsx(
        variant === 'primary' && 'vyb-btn-primary',
        variant === 'secondary' && 'vyb-btn-secondary',
        variant === 'ghost' && 'vyb-btn-ghost',
        variant === 'danger' && 'vyb-btn-danger',
        variant === 'signal' && 'vyb-btn-signal',
        (variant === 'warm' || variant === 'epic') && 'vyb-btn-primary',
        size === 'sm' && 'vyb-btn-sm',
        size === 'md' && 'vyb-btn-md',
        size === 'lg' && 'vyb-btn-lg',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
