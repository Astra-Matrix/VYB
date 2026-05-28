import { Hammer, Loader2, Trash2 } from 'lucide-react';
import { BUILD_TARGETS, resolveDefaultBuildOutput } from '../../engine/build';
import { useAppState } from '../../app/state/useAppState';
import { runBuildPipeline } from '../../app/build/runBuildPipeline';
import { StudioPanel } from '../../ui/components/StudioPanel';
import { Button } from '../../ui/components/Button';
import { TextField } from '../../ui/components/TextField';
import { StatusLight } from '../../ui/components/StatusLight';
import { isTauri } from '../../app/platform/isTauri';

export function BuildPanel() {
  const project = useAppState((s) => s.currentProject);
  const projectRoot = useAppState((s) => s.projectRootPath);
  const projectTree = useAppState((s) => s.projectTree);
  const selectedTarget = useAppState((s) => s.selectedBuildTarget);
  const selectedConfig = useAppState((s) => s.selectedBuildConfig);
  const outputFolder = useAppState((s) => s.buildOutputFolder);
  const buildLogs = useAppState((s) => s.buildLogs);
  const buildInProgress = useAppState((s) => s.buildInProgress);

  const setBuildTarget = useAppState((s) => s.actions.setBuildTarget);
  const setBuildConfig = useAppState((s) => s.actions.setBuildConfig);
  const setBuildOutputFolder = useAppState((s) => s.actions.setBuildOutputFolder);
  const pushBuildLog = useAppState((s) => s.actions.pushBuildLog);
  const clearBuildLogs = useAppState((s) => s.actions.clearBuildLogs);
  const setBuildInProgress = useAppState((s) => s.actions.setBuildInProgress);

  const targetDesc = BUILD_TARGETS.find((t) => t.id === selectedTarget);
  const defaultOutput =
    projectRoot && selectedTarget
      ? resolveDefaultBuildOutput(projectRoot, selectedTarget, selectedConfig)
      : '';

  async function handleBuild() {
    if (!project || !projectRoot || !selectedTarget) return;
    clearBuildLogs();
    setBuildInProgress(true);
    pushBuildLog({ level: 'info', message: `Starting ${selectedConfig} build for ${targetDesc?.displayName ?? selectedTarget}…` });

    try {
      const knownProjectFiles = projectTree.filter((e) => !e.isDirectory).map((e) => e.relativePath);
      const result = await runBuildPipeline({
        projectRoot,
        project,
        target: selectedTarget,
        configuration: selectedConfig,
        outputFolder: outputFolder || defaultOutput,
        knownProjectFiles,
        onLog: (level, message) => pushBuildLog({ level, message }),
      });

      if (result.manifestJson && !isTauri()) {
        pushBuildLog({ level: 'info', message: 'Manifest preview available in build report (desktop required for export).' });
      }
    } catch (e) {
      pushBuildLog({
        level: 'error',
        message: `Build failed: ${e instanceof Error ? e.message : String(e)}`,
      });
    } finally {
      setBuildInProgress(false);
    }
  }

  return (
    <StudioPanel
      title="Build & Deploy"
      icon={<Hammer className="w-4 h-4" />}
      className="h-full"
      active={buildInProgress}
      noPadding
    >
      <div className="flex flex-col h-full overflow-hidden p-3 gap-3">
        <p className="text-[11px] text-vyb-muted leading-relaxed">
          Stage project artifacts, emit build manifests, and prepare target-specific runtime stubs.
          {!isTauri() ? ' Web mode runs preview builds only.' : null}
        </p>

        <div>
          <label className="text-[10px] font-bold text-vyb-muted uppercase tracking-wide">Target</label>
          <select
            className="vyb-input mt-1 w-full text-xs"
            value={selectedTarget ?? ''}
            onChange={(e) => setBuildTarget((e.target.value || undefined) as typeof selectedTarget)}
          >
            <option value="" disabled>
              Select deployment target
            </option>
            {BUILD_TARGETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.displayName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-vyb-muted uppercase tracking-wide">Configuration</label>
          <div className="flex gap-2 mt-1">
            <Button
              variant={selectedConfig === 'debug' ? 'primary' : 'secondary'}
              size="sm"
              className="flex-1"
              onClick={() => setBuildConfig('debug')}
            >
              Debug
            </Button>
            <Button
              variant={selectedConfig === 'release' ? 'primary' : 'secondary'}
              size="sm"
              className="flex-1"
              onClick={() => setBuildConfig('release')}
            >
              Release
            </Button>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-vyb-muted uppercase tracking-wide">Output folder</label>
          <TextField
            className="mt-1 text-xs font-mono"
            value={outputFolder ?? defaultOutput}
            onChange={(e) => setBuildOutputFolder(e.target.value)}
            placeholder={defaultOutput || 'project/builds/…'}
            disabled={!projectRoot}
          />
        </div>

        {targetDesc ? (
          <div className="rounded-md border border-vyb-line/60 bg-vyb-charcoal/50 p-2">
            <div className="text-[10px] font-bold uppercase tracking-wide text-vyb-text-secondary mb-2 flex items-center gap-2">
              <StatusLight variant="plasma" pulse={buildInProgress} />
              Capability matrix
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              {Object.entries(targetDesc.capabilities).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <span className="text-vyb-muted capitalize">{k}</span>
                  <span className={v ? 'text-vyb-green' : 'text-vyb-muted/50'}>{v ? 'on' : 'off'}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex gap-2">
          <Button
            className="flex-1"
            variant="primary"
            disabled={!project || !projectRoot || !selectedTarget || buildInProgress}
            onClick={() => void handleBuild()}
          >
            {buildInProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hammer className="w-4 h-4" />}
            {buildInProgress ? 'Building…' : isTauri() ? 'Build project' : 'Preview build'}
          </Button>
          <Button variant="ghost" size="sm" onClick={clearBuildLogs} title="Clear logs">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-[10px] font-bold uppercase tracking-wide text-vyb-muted mb-1">Build log</div>
          <div className="flex-1 overflow-auto rounded-md border border-vyb-line/50 bg-vyb-charcoal/60 p-2 font-mono text-[10px]">
            {buildLogs.length === 0 ? (
              <span className="text-vyb-muted">No build output yet.</span>
            ) : (
              buildLogs.slice(-50).map((l) => (
                <div
                  key={l.id}
                  className={
                    l.level === 'error'
                      ? 'text-vyb-danger'
                      : l.level === 'warn'
                        ? 'text-vyb-amber'
                        : 'text-vyb-text-secondary'
                  }
                >
                  [{new Date(l.at).toLocaleTimeString()}] {l.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </StudioPanel>
  );
}
