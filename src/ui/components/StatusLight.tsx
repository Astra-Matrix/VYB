import clsx from 'clsx';

export type StatusLightVariant = 'plasma' | 'cyan' | 'green' | 'blue' | 'violet' | 'magenta' | 'muted';

const VARIANT_CLASS: Record<StatusLightVariant, string> = {
  plasma: 'vyb-status-plasma',
  cyan: 'vyb-status-cyan',
  green: 'vyb-status-green',
  blue: 'bg-vyb-blue text-vyb-blue',
  violet: 'bg-vyb-violet text-vyb-violet',
  magenta: 'vyb-status-magenta',
  muted: 'bg-vyb-muted/50 text-vyb-muted',
};

export function StatusLight({
  variant = 'plasma',
  pulse = false,
  className,
  title,
}: {
  variant?: StatusLightVariant;
  pulse?: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={clsx(
        'vyb-status-light',
        VARIANT_CLASS[variant],
        pulse && 'animate-diagnostic-pulse',
        className,
      )}
    />
  );
}
