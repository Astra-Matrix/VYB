import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export function TextField({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return <input className={clsx('vyb-input vyb-focus-ring', className)} {...rest} />;
}
