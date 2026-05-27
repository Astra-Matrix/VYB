import { Button } from '../../ui/components/Button';
import { useAppState } from '../../app/state/useAppState';

export type StudioMode =
  | 'Design'
  | 'Code'
  | 'World'
  | 'Render'
  | 'Audio'
  | 'Network'
  | 'Build'
  | 'AI';

const MODES: StudioMode[] = ['Design', 'Code', 'World', 'Render', 'Audio', 'Network', 'Build', 'AI'];

export function ModeSwitcher() {
  const activeMode = useAppState((s) => s.activeMode);
  const setActiveMode = useAppState((s) => s.actions.setActiveMode);

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {MODES.map((m) => (
        <Button
          key={m}
          variant={m === activeMode ? 'primary' : 'ghost'}
          className="px-2 py-1 text-xs font-semibold whitespace-nowrap"
          onClick={() => setActiveMode(m)}
        >
          {m}
        </Button>
      ))}
    </div>
  );
}

