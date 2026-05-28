import { FileText, Layers, Pause, Play, Save, Settings, Sparkles, Square, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { IconButton } from '../../ui/components/IconButton';
import { ModeSwitcher } from '../modes/ModeSwitcher';
import { Button } from '../../ui/components/Button';
import { Badge } from '../../ui/components/Badge';
import { useAppState } from '../../app/state/useAppState';
import { useNavigate } from 'react-router-dom';
import { chooseDirectory, detectImportCompatibility } from '../../app/commands/tauriCommands';
import { planner, reportBuilder } from '../../engine/import';
import type { DetectedProject, ImportDetectionResult, ImportSourceType } from '../../engine/import/ImportDetector';

const IMPORT_SOURCE_TYPES: ImportSourceType[] = ['vyb', 'unity', 'unreal', 'godot', 'raw', 'unknown'];

function coerceDetection(report: unknown): ImportDetectionResult {
  const raw = report as { detected?: Partial<DetectedProject>[]; scannedAt?: string };
  const detected: DetectedProject[] = (raw.detected ?? []).map((d) => ({
    type: IMPORT_SOURCE_TYPES.includes(d.type as ImportSourceType) ? (d.type as ImportSourceType) : 'unknown',
    confidence: d.confidence ?? 0,
    rootPath: d.rootPath ?? '',
    markers: d.markers ?? [],
    metadata: d.metadata,
  }));
  return {
    detected,
    primary: detected[0],
    scannedAt: raw.scannedAt ?? new Date().toISOString(),
  };
}

export function CommandBar() {
  const setSettingsOpen = useAppState((s) => s.actions.setSettingsOpen);
  const project = useAppState((s) => s.currentProject);
  const projectRoot = useAppState((s) => s.projectRootPath);
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
    <header className="vyb-toolbar justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <motion.div
          className="h-9 w-9 rounded-md border border-vyb-plasma/50 bg-vyb-graphite shadow-rim-plasma"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="h-full w-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-vyb-plasma" />
          </div>
        </motion.div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm tracking-wide text-vyb-text">VYB Studio</span>
            <Badge variant="plasma">Command Center</Badge>
          </div>
          <div className="text-[11px] text-vyb-muted truncate max-w-[280px]">
            {project ? `${project.name} • ${projectRoot}` : 'No project opened'}
          </div>
        </div>
      </div>

      <ModeSwitcher />

      <div className="flex items-center gap-2">
        <IconButton aria-label="AI" onClick={() => {}} title="AI tools">
          <Sparkles className="w-4 h-4 text-vyb-magenta" />
        </IconButton>
        <IconButton aria-label="Docs" onClick={() => navigate('/docs/01_VISION')} title="Documentation">
          <FileText className="w-4 h-4" />
        </IconButton>
        <IconButton aria-label="Settings" onClick={() => setSettingsOpen(true)} title="Settings">
          <Settings className="w-4 h-4" />
        </IconButton>

        <div className="w-px h-6 bg-gradient-to-b from-transparent via-vyb-plasma/40 to-transparent mx-1" />

        <Button variant="ghost" size="sm" disabled={!scene} onClick={() => void playRuntime()} title="Play">
          <Play className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" disabled={runtimePlayback !== 'playing'} onClick={() => pauseRuntime()} title="Pause">
          <Pause className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" disabled={runtimePlayback === 'stopped'} onClick={() => void stopRuntime()} title="Stop">
          <Square className="w-4 h-4" />
        </Button>

        <Button
          variant="secondary"
          size="sm"
          disabled={!projectRoot || !scene || !activeSceneRelativePath}
          onClick={async () => {
            if (!projectRoot || !scene || !activeSceneRelativePath) return;
            try {
              const { saveActiveScene } = await import('../../app/workspace/saveScene');
              await saveActiveScene(projectRoot, activeSceneRelativePath, scene);
              pushConsole({ level: 'info', message: `Scene saved: ${activeSceneRelativePath}` });
            } catch (e) {
              pushConsole({ level: 'error', message: `Save failed: ${e instanceof Error ? e.message : String(e)}` });
            }
          }}
        >
          <Save className="w-4 h-4" />
          Save
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            void (async () => {
              try {
                const selected = await chooseDirectory(projectRoot);
                if (!selected) return;
                pushConsole({ level: 'info', message: `Import detection: ${selected}` });
                const result = await detectImportCompatibility(selected);
                const detection = coerceDetection(result.report);
                const plan = detection.primary ? planner.createPlan(detection.primary) : undefined;
                setImportReport(reportBuilder.build(selected, detection, plan), selected);
              } catch (e) {
                pushConsole({ level: 'error', message: `Import failed: ${e instanceof Error ? e.message : String(e)}` });
              }
            })();
          }}
        >
          <Layers className="w-4 h-4" />
          Import
        </Button>
      </div>
    </header>
  );
}
