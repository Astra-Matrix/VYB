import { BUILD_TARGETS } from '../../engine/build';
import { useAppState } from '../../app/state/useAppState';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { Button } from '../../ui/components/Button';

export function BuildPanel() {
  const selectedTarget = useAppState((s) => s.selectedBuildTarget);
  const selectedConfig = useAppState((s) => s.selectedBuildConfig);
  const outputFolder = useAppState((s) => s.buildOutputFolder);
  const buildLogs = useAppState((s) => s.buildLogs);

  const setBuildTarget = useAppState((s) => s.actions.setBuildTarget);
  const setBuildConfig = useAppState((s) => s.actions.setBuildConfig);
  const setBuildOutputFolder = useAppState((s) => s.actions.setBuildOutputFolder);

  return (
    <GlassPanel className="p-2 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <div>
          <div className="text-xs font-bold tracking-wide text-vyb-text/80">Build</div>
          <div className="text-[11px] text-vyb-text/55">Scaffold build pipeline interface.</div>
        </div>
      </div>

      <div className="space-y-3 overflow-auto px-1">
        <div>
          <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-1">Target</div>
          <select
            className="w-full rounded-lg border border-vyb-border/60 bg-black/20 text-xs px-2 py-1"
            value={selectedTarget ?? ''}
            onChange={(e) => setBuildTarget((e.target.value || undefined) as any)}
          >
            <option value="" disabled>
              Select a target
            </option>
            {BUILD_TARGETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.displayName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-1">Configuration</div>
          <div className="flex gap-2">
            <Button variant={selectedConfig === 'debug' ? 'primary' : 'ghost'} className="flex-1" onClick={() => setBuildConfig('debug')}>
              Debug
            </Button>
            <Button variant={selectedConfig === 'release' ? 'primary' : 'ghost'} className="flex-1" onClick={() => setBuildConfig('release')}>
              Release
            </Button>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-1">Output folder</div>
          <input
            className="w-full rounded-lg border border-vyb-border/60 bg-black/20 text-xs px-2 py-2 text-vyb-text"
            value={outputFolder ?? ''}
            onChange={(e) => setBuildOutputFolder(e.target.value)}
            placeholder="(placeholder)"
          />
        </div>

        <div className="rounded-lg border border-vyb-border/60 bg-black/10 p-2">
          <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-2">Platform capability matrix</div>
          <div className="text-[11px] text-vyb-text/55">
            {selectedTarget ? (
              <>
                {BUILD_TARGETS.find((t) => t.id === selectedTarget)?.displayName}
                <div className="mt-2 space-y-1">
                  {Object.entries(BUILD_TARGETS.find((t) => t.id === selectedTarget)!.capabilities).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="capitalize text-vyb-text/55">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={v ? 'text-vyb-success' : 'text-vyb-text/35'}>{v ? 'Yes' : 'No'}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              'Select a target to view capabilities.'
            )}
          </div>
        </div>

        <Button
          className="w-full"
          variant="secondary"
          onClick={() => {
            // Placeholder build trigger.
          }}
          disabled={!selectedTarget}
        >
          Build (placeholder)
        </Button>

        <div>
          <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-1">Build logs</div>
          <div className="max-h-[220px] overflow-auto rounded-lg border border-vyb-border/60 bg-black/10 p-2">
            {buildLogs.length === 0 ? <div className="text-[11px] text-vyb-text/45">No build logs yet.</div> : null}
            {buildLogs.slice(-30).map((l) => (
              <div key={l.id} className="font-mono text-[11px] text-vyb-text/70">
                [{new Date(l.at).toLocaleTimeString()}] {l.level.toUpperCase()}: {l.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

