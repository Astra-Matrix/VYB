import { useMemo } from 'react';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { Button } from '../../ui/components/Button';
import { useAppState } from '../../app/state/useAppState';

function levelColor(level: 'info' | 'warn' | 'error') {
  switch (level) {
    case 'info':
      return 'text-vyb-text/70';
    case 'warn':
      return 'text-vyb-warning';
    case 'error':
      return 'text-vyb-danger';
  }
}

export function ConsolePanel() {
  const entries = useAppState((s) => s.consoleEntries);
  const clearConsole = useAppState((s) => s.actions.clearConsole);

  const lines = useMemo(() => entries.slice(-200).reverse(), [entries]);

  return (
    <GlassPanel className="h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-vyb-border/60">
        <div className="text-xs font-bold tracking-wide text-vyb-text/80">Console</div>
        <Button variant="ghost" className="h-8 px-2 text-xs" onClick={clearConsole} disabled={entries.length === 0}>
          Clear
        </Button>
      </div>
      <div className="p-3 overflow-auto h-[200px]">
        {entries.length === 0 ? (
          <div className="text-xs text-vyb-text/50">No logs yet.</div>
        ) : (
          <div className="space-y-1">
            {lines.map((e) => (
              <div key={e.id} className={['font-mono text-[11px] leading-relaxed', levelColor(e.level)].join(' ')}>
                <span className="text-vyb-text/40">{new Date(e.at).toLocaleTimeString()} </span>
                {e.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassPanel>
  );
}

