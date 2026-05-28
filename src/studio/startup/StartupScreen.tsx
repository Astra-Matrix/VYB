import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Import, Play, Plus, Sparkles } from 'lucide-react';
import { Button } from '../../ui/components/Button';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { TextField } from '../../ui/components/TextField';
import { Badge } from '../../ui/components/Badge';
import { HudRing } from '../../ui/components/HudRing';
import { StatusLight } from '../../ui/components/StatusLight';
import { useAppState } from '../../app/state/useAppState';
import { useNavigate } from 'react-router-dom';
import { chooseDirectory } from '../../app/commands/tauriCommands';
import {
  bootstrapBundledSampleProject,
  bootstrapProjectAtPath,
  createProjectWorkspace,
} from '../../app/workspace/projectWorkspace';
import { createSampleNodeGraph, createSampleShaderGraph } from '../../engine/visual-scripting';
import { isTauri } from '../../app/platform/isTauri';
import { applyImportToWorkspace } from '../../app/import/runImportPipeline';
import { BUNDLED_GODOT_IMPORT_ROOT } from '../../engine/import/bundledImportSources';
import { detector, reportBuilder, planner } from '../../engine/import';

const RECENT_KEY = 'vyb:recentProjects:v1';
type RecentEntry = { rootPath: string; name: string; at: string };

function loadRecent(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentEntry[];
  } catch {
    return [];
  }
}

function saveRecent(entries: RecentEntry[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(entries.slice(0, 12)));
}

export function StartupScreen() {
  const navigate = useNavigate();
  const applyWorkspace = useAppState((s) => s.actions.applyWorkspace);
  const setNodeGraph = useAppState((s) => s.actions.setNodeGraph);
  const setShaderGraph = useAppState((s) => s.actions.setShaderGraph);
  const setSettingsOpen = useAppState((s) => s.actions.setSettingsOpen);
  const pushConsole = useAppState((s) => s.actions.pushConsole);
  const setImportReport = useAppState((s) => s.actions.setImportReport);
  const applyImportedPreview = useAppState((s) => s.actions.applyImportedPreview);

  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [createName, setCreateName] = useState('My VYB Project');
  const [isBusy, setIsBusy] = useState(false);
  const [bootPhase, setBootPhase] = useState(0);

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  useEffect(() => {
    const phases = ['SYSTEM CHECK', 'RENDER CORE', 'RUNTIME OK', 'READY'];
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % phases.length;
      setBootPhase(i);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  function rememberRecent(rootPath: string, name: string) {
    const entry: RecentEntry = { rootPath, name, at: new Date().toISOString() };
    const nextRecent = [entry, ...recent.filter((r) => r.rootPath !== rootPath)].slice(0, 12);
    setRecent(nextRecent);
    saveRecent(nextRecent);
  }

  async function enterStudio(workspace: Awaited<ReturnType<typeof bootstrapProjectAtPath>>) {
    applyWorkspace(workspace);
    setNodeGraph(createSampleNodeGraph());
    setShaderGraph(createSampleShaderGraph());
    rememberRecent(workspace.rootPath, workspace.project.name);
    pushConsole({ level: 'info', message: `Opened project: ${workspace.project.name}` });
    navigate('/studio');
  }

  async function handleCreate() {
    setIsBusy(true);
    try {
      if (!isTauri()) {
        const workspace = await bootstrapBundledSampleProject(createName.trim());
        await enterStudio(workspace);
        return;
      }
      const picked = await chooseDirectory(undefined);
      if (!picked) return;
      const workspace = await createProjectWorkspace(picked, createName.trim());
      await enterStudio(workspace);
    } catch (e) {
      pushConsole({
        level: 'error',
        message: `Create failed: ${e instanceof Error ? e.message : String(e)}`,
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function handleOpenExisting() {
    setIsBusy(true);
    try {
      if (!isTauri()) {
        const workspace = await bootstrapBundledSampleProject('Sample');
        await enterStudio(workspace);
        return;
      }
      const picked = await chooseDirectory(undefined);
      if (!picked) return;
      const workspace = await bootstrapProjectAtPath(picked);
      await enterStudio(workspace);
    } catch (e) {
      pushConsole({
        level: 'error',
        message: `Open failed: ${e instanceof Error ? e.message : String(e)}`,
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function handleGodotImportDemo() {
    setIsBusy(true);
    try {
      const workspace = await bootstrapBundledSampleProject('Godot Import Preview');
      applyWorkspace(workspace);
      setNodeGraph(createSampleNodeGraph());
      setShaderGraph(createSampleShaderGraph());

      const detection = detector.detectFromDirectoryListing(BUNDLED_GODOT_IMPORT_ROOT, [
        'project.godot',
        'scenes',
        'scripts',
      ]);
      const primary = detection.primary ?? detection.detected[0];
      if (!primary) throw new Error('Godot sample project not detected.');

      const plan = planner.createPlan(primary);
      const report = reportBuilder.build(BUNDLED_GODOT_IMPORT_ROOT, detection, plan);
      setImportReport(report, BUNDLED_GODOT_IMPORT_ROOT);

      await applyImportToWorkspace({
        source: primary,
        targetProjectRoot: workspace.rootPath,
        previewOnly: true,
        applyWorkspace: (payload) => {
          applyImportedPreview({
            scene: payload.scene,
            sceneRelativePath: payload.defaultSceneRelativePath,
            assets: payload.assets,
            projectTree: payload.projectTree,
          });
        },
      });

      rememberRecent(workspace.rootPath, workspace.project.name);
      pushConsole({ level: 'info', message: 'Loaded Godot import preview (examples/godot-import-sample).' });
      navigate('/studio');
    } catch (e) {
      pushConsole({
        level: 'error',
        message: `Godot import demo failed: ${e instanceof Error ? e.message : String(e)}`,
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function handleOpenRecent(entry: RecentEntry) {
    setIsBusy(true);
    try {
      if (!isTauri() || entry.rootPath.startsWith('examples/')) {
        const workspace = await bootstrapBundledSampleProject(entry.name);
        await enterStudio(workspace);
        return;
      }
      const workspace = await bootstrapProjectAtPath(entry.rootPath);
      await enterStudio(workspace);
    } catch (e) {
      pushConsole({
        level: 'error',
        message: `Open recent failed: ${e instanceof Error ? e.message : String(e)}`,
      });
    } finally {
      setIsBusy(false);
    }
  }

  const bootLabels = ['SYSTEM CHECK', 'RENDER CORE', 'RUNTIME OK', 'READY'];
  const features = [
    { title: 'WebGPU Viewport', desc: 'Sacred center-stage preview with precision HUD overlays.', signal: 'cyan' as const },
    { title: 'Visual Scripting', desc: 'Node graphs and shader pipelines wired to Play.', signal: 'plasma' as const },
    { title: 'Import Pipelines', desc: 'Godot, raw assets, migration diagnostics.', signal: 'violet' as const },
    { title: 'Runtime Systems', desc: 'Physics, animation, audio, UI, network.', signal: 'green' as const },
  ];

  return (
    <div className="min-h-screen w-screen overflow-hidden bg-vyb-bg bg-mesh-hero relative">
      <div className="absolute inset-0 bg-gradient-to-b from-vyb-charcoal/20 via-transparent to-vyb-bg pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent-bar opacity-95" />

      {/* HUD focal — center-weighted atmosphere */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.35]">
        <HudRing size={520} animate label="VYB CORE" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6 min-h-screen">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-md border border-vyb-plasma/50 bg-vyb-graphite flex items-center justify-center shadow-rim-plasma">
                <span className="font-display text-xl font-black vyb-text-gradient">V</span>
              </div>
              <div>
                <h1 className="font-display text-4xl md:text-5xl font-extrabold vyb-text-gradient tracking-tight leading-none">
                  VYB STUDIO
                </h1>
                <p className="text-xs text-vyb-muted mt-1 tracking-wide">Next-generation game creation command center</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant="plasma">WebGPU</Badge>
              <Badge variant="signal">ECS Runtime</Badge>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-vyb-muted uppercase tracking-widest">
                <StatusLight variant="green" pulse />
                {bootLabels[bootPhase]}
              </span>
            </div>
          </div>
          <p className="text-sm text-vyb-text-secondary max-w-sm leading-relaxed border-l border-vyb-plasma/30 pl-4">
            {isTauri()
              ? 'Desktop workstation — filesystem I/O, import pipelines, multi-system runtime.'
              : 'Preview build — open sample project or run Godot import demo.'}
          </p>
        </motion.header>

        <div className="grid lg:grid-cols-3 gap-4 flex-1">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08, duration: 0.28 }}
            className="lg:col-span-2"
          >
            <GlassPanel className="p-6 vyb-card-hover border-vyb-plasma/25">
              <h2 className="font-display text-base font-bold text-vyb-text mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-vyb-plasma" />
                Initialize workspace
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-vyb-muted uppercase tracking-[0.12em]">Project designation</label>
                  <TextField
                    className="mt-1.5 w-full"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    disabled={isBusy}
                  />
                </div>
                <Button variant="primary" size="lg" className="w-full" disabled={isBusy || !createName.trim()} onClick={handleCreate}>
                  <Play className="w-4 h-4" />
                  {isBusy ? 'Booting…' : isTauri() ? 'Create Project' : 'Open Sample'}
                </Button>
                <Button variant="secondary" size="lg" className="w-full" disabled={isBusy} onClick={handleOpenExisting}>
                  <FolderOpen className="w-4 h-4" />
                  Open Existing
                </Button>
                <Button variant="signal" size="lg" className="w-full sm:col-span-2" disabled={isBusy} onClick={() => void handleGodotImportDemo()}>
                  <Import className="w-4 h-4" />
                  Godot Import Preview
                </Button>
                <Button variant="ghost" className="w-full" disabled={isBusy} onClick={() => setSettingsOpen(true)}>
                  <Sparkles className="w-4 h-4" />
                  System preferences
                </Button>
              </div>
            </GlassPanel>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
            <GlassPanel className="p-4 h-full flex flex-col min-h-[280px]">
              <h2 className="vyb-panel-chrome-title mb-3 flex items-center gap-2">
                <StatusLight variant="plasma" />
                Recent workspaces
              </h2>
              <div className="flex-1 space-y-2 overflow-auto max-h-[300px] pr-1">
                {recent.length === 0 ? (
                  <p className="text-[11px] text-vyb-muted font-mono">No entries in local registry.</p>
                ) : (
                  recent.map((r, i) => (
                    <motion.button
                      key={r.rootPath}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.04 * i }}
                      className="w-full text-left rounded-md border border-vyb-line/60 bg-vyb-charcoal/60 p-3 vyb-card-hover group"
                      onClick={() => handleOpenRecent(r)}
                    >
                      <div className="text-sm font-semibold text-vyb-text group-hover:text-vyb-plasma transition-colors truncate">
                        {r.name}
                      </div>
                      <div className="text-[10px] text-vyb-muted truncate font-mono mt-0.5">{r.rootPath}</div>
                    </motion.button>
                  ))
                )}
              </div>
            </GlassPanel>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pb-4"
        >
          {features.map((f) => (
            <GlassPanel key={f.title} className="p-4 vyb-card-hover">
              <div className="flex items-center gap-2 mb-2">
                <StatusLight variant={f.signal} />
                <div className="text-sm font-bold text-vyb-text">{f.title}</div>
              </div>
              <div className="text-[11px] text-vyb-muted leading-relaxed">{f.desc}</div>
            </GlassPanel>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
