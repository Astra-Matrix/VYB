import clsx from 'clsx';

export function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'plasma' | 'accent' | 'warm' | 'signal' | 'success' | 'muted';
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border',
        variant === 'default' && 'bg-vyb-elevated/80 text-vyb-text-secondary border-vyb-line/60',
        (variant === 'plasma' || variant === 'accent' || variant === 'warm') &&
          'bg-vyb-plasma/15 text-vyb-plasma border-vyb-plasma/40 shadow-[0_0_12px_rgba(255,107,26,0.15)]',
        variant === 'signal' && 'bg-vyb-cyan/10 text-vyb-cyan border-vyb-cyan/35',
        variant === 'success' && 'bg-vyb-green/10 text-vyb-green border-vyb-green/35',
        variant === 'muted' && 'bg-vyb-charcoal text-vyb-muted border-vyb-line/50',
      )}
    >
      {children}
    </span>
  );
}
