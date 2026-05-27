import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export function TextField({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return (
    <input
      className={clsx(
        'w-full rounded-lg border border-vyb-border/60 bg-black/20 px-3 py-2 text-sm text-vyb-text placeholder-vyb-text/40',
        'focus:border-vyb-accent/60 focus:ring-1 focus:ring-vyb-accent/40',
        className,
      )}
      {...rest}
    />
  );
}

