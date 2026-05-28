import { useAppState } from '../../app/state/useAppState';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { Button } from '../../ui/components/Button';
import { TextField } from '../../ui/components/TextField';

export function SettingsPanel() {
  const isSettingsOpen = useAppState((s) => s.isSettingsOpen);
  const setSettingsOpen = useAppState((s) => s.actions.setSettingsOpen);

  if (!isSettingsOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => setSettingsOpen(false)}
      onKeyDown={(e) => e.key === 'Escape' && setSettingsOpen(false)}
      role="presentation"
    >
      <div onClick={(e) => e.stopPropagation()} role="dialog">
      <GlassPanel className="w-[720px] max-w-[92vw] p-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <div className="text-sm font-bold text-vyb-text">Preferences</div>
            <div className="text-xs text-vyb-text/60">Scaffold settings for future studio intelligence.</div>
          </div>
          <Button variant="ghost" className="h-9" onClick={() => setSettingsOpen(false)}>
            Close
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="text-xs text-vyb-text/70 font-semibold">Editor Theme</div>
            <TextField value="VYB Dark (Premium)" readOnly className="cursor-default" />
          </div>
          <div className="space-y-2">
            <div className="text-xs text-vyb-text/70 font-semibold">Language Server</div>
            <TextField value="Planned" readOnly className="cursor-default" />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => setSettingsOpen(false)}
            variant="primary"
          >
            Save (placeholder)
          </Button>
        </div>
      </GlassPanel>
      </div>
    </div>
  );
}

