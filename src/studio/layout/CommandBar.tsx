import { FileText, Layers, Pause, Play, Save, Settings, Sparkles, Square, Zap } from 'lucide-react';
import { IconButton } from '../../ui/components/IconButton';
import { ModeSwitcher } from '../modes/ModeSwitcher';
import { Button } from '../../ui/components/Button';
import { useAppState } from '../../app/state/useAppState';
import { useNavigate } from 'react-router-dom';
import { chooseDirectory, detectImportCompatibility } from '../../app/commands/tauriCommands';
import { planner, reportBuilder } from '../../engine/import';

export function CommandBar() {
  const setSettingsOpen = useAppState((s) => s.actions.setSettingsOpen);
  const openProject = useAppState((s) => s.projectRootPath);
  const setImportReport = useAppState((s) => s.actions.setImportReport);
  const pushConsole = useAppState((s) => s.actions.pushConsole);
  const scene = useAppState((s) => s.scene);
  const activeSceneRelativePath = useAppState((s) => s.activeSceneRelativePath);
  const runtimePlayback = useAppState((s) => s.runtimePlayback);
  const playRuntime = useAppState((s) => s.actions.playRuntime);
  const pauseRuntime = useAppState((s) => s.actions.pauseRuntime);
  const stopRuntime = useAppState((s) => s.actions.stopRuntime);
  const navigate = useNavigate();

  return (
    <div className="h-14 flex items-center justify-between px-4 border-b border-vyb-border/60 bg-vyb-panel/40 backdrop-blur-panel">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-b from-vyb-accent/35 to-transparent border border-vyb-accent/40 flex items-center justify-center">
          <Zap className="w-4 h-4 text-vyb-accent" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold tracking-wide text-vyb-text">VYB Studio</div>
          <div className="text-xs text-vyb-text/60 truncate">{openProject ? openProject : 'No project opened'}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ModeSwitcher />
        <IconButton aria-label="AI" onClick={() => {}} title="AI tools placeholder">
          <Sparkles className="w-4 h-4" />
        </IconButton>
        <IconButton aria-label="Docs" onClick={() => navigate('/docs/01_VISION')} title="Open vision docs">
          <FileText className="w-4 h-4" />
        </IconButton>
        <IconButton aria-label="Settings" onClick={() => setSettingsOpen(true)} title="Settings">
          <Settings className="w-4 h-4" />
        </IconButton>
        <Button variant="secondary" className="h-9" disabled={!scene} onClick={() => void playRuntime()} title="Play runtime">
          <Play className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          className="h-9"
          disabled={runtimePlayback !== 'playing'}
          onClick={() => pauseRuntime()}
          title="Pause runtime"
        >
          <Pause className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          className="h-9"
          disabled={runtimePlayback === 'stopped'}
          onClick={() => void stopRuntime()}
          title="Stop runtime"
        >
          <Square className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          className="h-9"
          disabled={!openProject || !scene || !activeSceneRelativePath}
          onClick={async () => {
            if (!openProject || !scene || !activeSceneRelativePath) return;
            try {
              const { saveActiveScene } = await import('../../app/workspace/saveScene');
              await saveActiveScene(openProject, activeSceneRelativePath, scene);
              pushConsole({ level: 'info', message: `Scene saved: ${activeSceneRelativePath}` });
            } catch (e) {
              pushConsole({ level: 'error', message: `Save scene failed: ${e instanceof Error ? e.message : String(e)}` });
            }
          }}
        >
          <Save className="w-4 h-4" />
          Save
        </Button>
        <Button
          variant="secondary"
          className="h-9"
          onClick={() => {
            (async () => {
              try {
                const selected = await chooseDirectory(openProject);
                if (!selected) return;

                pushConsole({ level: 'info', message: `Running import compatibility detection for ${selected}` });
                const result = await detectImportCompatibility(selected);

                const reportValue = result.report as any;
                const detected = (reportValue?.detected ?? []) as any[];
                const scannedAt = (reportValue?.scannedAt as string | undefined) ?? new Date().toISOString();

                const detection = {
                  detected,
                  primary: detected[0],
                  scannedAt,
                };
                const plan = detection.primary ? planner.createPlan(detection.primary) : undefined;
                const built = reportBuilder.build(selected, detection, plan);

                setImportReport(built, selected);
                pushConsole({ level: 'info', message: 'Import report generated.' });
              } catch (e) {
                pushConsole({ level: 'error', message: `Import detection failed: ${e instanceof Error ? e.message : String(e)}` });
              }
            })();
          }}
        >
          <Layers className="w-4 h-4" />
          Import
        </Button>
      </div>
    </div>
  );
}

