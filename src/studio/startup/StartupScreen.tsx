import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../ui/components/Button';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { TextField } from '../../ui/components/TextField';
import { useAppState } from '../../app/state/useAppState';
import { useNavigate } from 'react-router-dom';
import { createSampleScene } from '../../engine/scene';
import { AssetRegistry } from '../../engine/assets/AssetRegistry';
import { createVybProject as createVybProjectCmd, chooseDirectory, validateVybProject } from '../../app/commands/tauriCommands';
import { createSampleNodeGraph } from '../../engine/visual-scripting';

// Local-only recent project cache.
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
  const openProject = useAppState((s) => s.actions.openProject);
  const setScene = useAppState((s) => s.actions.setScene);
  const selectEntity = useAppState((s) => s.actions.selectEntity);
  const setNodeGraph = useAppState((s) => s.actions.setNodeGraph);
  const setAssetRegistry = useAppState((s) => s.actions.setAssetRegistry);
  const setSettingsOpen = useAppState((s) => s.actions.setSettingsOpen);
  const pushConsole = useAppState((s) => s.actions.pushConsole);

  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [createName, setCreateName] = useState('My VYB Project');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  const assetRegistry = useMemo(() => {
    const ar = new AssetRegistry();
    // Scaffold: we keep this deterministic so the UI stays functional.
    const files = [
      'assets/mesh/unit-cube.glb',
      'assets/texture/diffuse.png',
      'assets/shaders/default.wgsl',
      'assets/audio/placeholder.wav',
      'scripts/player.ts',
    ];
    ar.scanFiles(files, { knownExtensionsOnly: true });
    return ar;
  }, []);

  async function handleCreate() {
    setIsBusy(true);
    try {
      const rootPath = await chooseDirectory();
      if (!rootPath) return;

      // Try real project creation through the Rust backend command.
      // If backend is not yet running, fallback to in-memory mock project.
      let project: any;
      try {
        const result = await createVybProjectCmd({ name: createName.trim(), rootPath });
        project = {
          name: createName.trim(),
          version: '0.1.0',
          engineVersion: '0.1.0',
          createdAt: result.createdAt ?? new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          targetPlatforms: ['windows', 'macos', 'linux'],
          renderingMode: 'webgpu',
          assetFolders: ['assets', 'scenes', 'scripts', 'materials', 'shaders', 'audio', 'ui'],
          scenes: ['scenes/main.vybscene'],
          plugins: [],
          scriptingLanguages: ['typescript', 'javascript'],
          importCompatibility: {},
          description: 'Created from VYB scaffold',
        };
      } catch {
        project = {
          name: createName.trim(),
          version: '0.1.0',
          engineVersion: '0.1.0',
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          targetPlatforms: ['windows', 'macos', 'linux'],
          renderingMode: 'webgpu',
          assetFolders: ['assets', 'scenes', 'scripts', 'materials', 'shaders', 'audio', 'ui'],
          scenes: ['scenes/main.vybscene'],
          plugins: [],
          scriptingLanguages: ['typescript', 'javascript'],
          importCompatibility: {},
          description: 'Created (mock) because backend command is unavailable.',
        };
      }

      openProject({ rootPath, project });

      const sceneData = createSampleScene();
      setScene(sceneData.scene);
      selectEntity(sceneData.cubeEntityId);
      setNodeGraph(createSampleNodeGraph());

      setAssetRegistry(assetRegistry.getAllAssets(), new Date().toISOString());

      const entry: RecentEntry = { rootPath, name: project.name, at: new Date().toISOString() };
      const nextRecent = [entry, ...recent.filter((r) => r.rootPath !== rootPath)].slice(0, 12);
      setRecent(nextRecent);
      saveRecent(nextRecent);

      navigate('/studio');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleOpenExisting() {
    setIsBusy(true);
    try {
      const rootPath = await chooseDirectory();
      if (!rootPath) return;

      try {
        const result = await validateVybProject(rootPath);
        if (!result.valid) {
          pushConsole({ level: 'warn', message: `Project validation warnings: ${result.errors.join(' | ')}` });
        }

        const project = result.project as any;
        if (project?.name) {
          openProject({ rootPath, project });
        } else {
          throw new Error('Validation did not return a project payload.');
        }
      } catch (e) {
        pushConsole({ level: 'warn', message: `Open existing failed validation: ${e instanceof Error ? e.message : String(e)}` });
        // Fallback: open a mock project to keep the studio interactive.
        openProject({
          rootPath,
          project: {
            name: 'Imported VYB Project',
            version: '0.1.0',
            engineVersion: '0.1.0',
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            targetPlatforms: ['windows', 'macos', 'linux'],
            renderingMode: 'webgpu',
            assetFolders: ['assets', 'scenes', 'scripts', 'materials', 'shaders', 'audio', 'ui'],
            scenes: ['scenes/main.vybscene'],
            plugins: [],
            scriptingLanguages: ['typescript', 'javascript'],
            importCompatibility: {},
          },
        });
      }

      const sceneData = createSampleScene();
      setScene(sceneData.scene);
      selectEntity(sceneData.cubeEntityId);
      setNodeGraph(createSampleNodeGraph());
      setAssetRegistry(assetRegistry.getAllAssets(), new Date().toISOString());
      navigate('/studio');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleOpenMockProject(rootPath: string, projectName: string) {
    const sceneData = createSampleScene();
    openProject({
      rootPath,
      project: {
        name: projectName,
        version: '0.1.0',
        engineVersion: '0.1.0',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        targetPlatforms: ['windows', 'macos', 'linux'],
        renderingMode: 'webgpu',
        assetFolders: ['assets', 'scenes', 'scripts', 'materials', 'shaders', 'audio', 'ui'],
        scenes: ['scenes/main.vybscene'],
        plugins: [],
        scriptingLanguages: ['typescript', 'javascript'],
        importCompatibility: {},
      },
    });

    setScene(sceneData.scene);
    selectEntity(sceneData.cubeEntityId);
    setNodeGraph(createSampleNodeGraph());
    setAssetRegistry(assetRegistry.getAllAssets(), new Date().toISOString());
    navigate('/studio');
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-vyb-bg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(91,141,239,0.28),transparent_55%)]" />

      <div className="relative h-full w-full flex items-center justify-center p-6">
        <div className="w-full max-w-5xl grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <GlassPanel className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-b from-vyb-accent/35 to-transparent border border-vyb-accent/40 flex items-center justify-center">
                  <span className="text-vyb-accent font-black tracking-wide text-lg">V</span>
                </div>
                <div>
                  <div className="text-lg font-extrabold tracking-wide text-vyb-text">VYB</div>
                  <div className="text-xs text-vyb-text/55">The next-generation game creation environment</div>
                </div>
              </div>

              <div className="text-sm text-vyb-text/70 leading-relaxed">
                VYB is designed to become a premium, production-grade studio platform that fuses editor UX, renderer
                abstraction, asset pipeline intelligence, and import/export compatibility.
              </div>

              <div className="mt-4 rounded-lg border border-vyb-border/60 bg-black/10 p-3">
                <div className="text-xs font-bold tracking-wide text-vyb-text/70 mb-1">Current status</div>
                <div className="text-[11px] text-vyb-text/55 leading-relaxed">
                  This is an early scaffold. UI panels, project system models, import detection architecture, and typed
                  ECS/scene scaffolding are in place. Real renderer backends and full import pipelines are planned.
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-bold tracking-wide text-vyb-text/80">Create a new project</div>
                  <div className="text-[11px] text-vyb-text/55">File-system workspace supported.</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] text-vyb-text/55 font-semibold">Project name</div>
                <TextField value={createName} onChange={(e) => setCreateName(e.target.value)} disabled={isBusy} />

                <Button
                  variant="primary"
                  className="w-full"
                  disabled={isBusy || !createName.trim()}
                  onClick={handleCreate}
                >
                  {isBusy ? 'Creating…' : 'Create Project'}
                </Button>

                <Button variant="ghost" className="w-full" disabled={isBusy} onClick={() => setSettingsOpen(true)}>
                  Studio preferences (placeholder)
                </Button>
                <Button variant="secondary" className="w-full" disabled={isBusy} onClick={handleOpenExisting}>
                  Open Existing Project
                </Button>
              </div>
            </GlassPanel>
          </div>

          <div className="space-y-4">
            <GlassPanel className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-bold tracking-wide text-vyb-text/80">Recent projects</div>
                  <div className="text-[11px] text-vyb-text/55">Mock cache until backend reads real projects.</div>
                </div>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                {recent.length === 0 ? (
                  <div className="text-[11px] text-vyb-text/55">No recent projects yet. Create one on the left.</div>
                ) : (
                  recent.map((r) => (
                    <button
                      key={r.rootPath}
                      className="w-full text-left rounded-lg border border-vyb-border/40 bg-black/10 p-3 hover:bg-white/5"
                      onClick={() => handleOpenMockProject(r.rootPath, r.name)}
                    >
                      <div className="text-xs font-bold text-vyb-text/85 truncate">{r.name}</div>
                      <div className="text-[11px] text-vyb-text/55 truncate">{r.rootPath}</div>
                      <div className="text-[10px] text-vyb-text/40 mt-1">
                        {new Date(r.at).toLocaleDateString()} • {new Date(r.at).toLocaleTimeString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </GlassPanel>

            <GlassPanel className="p-4">
              <div className="text-xs font-bold tracking-wide text-vyb-text/80 mb-2">Import compatibility (scaffold)</div>
              <div className="text-[11px] text-vyb-text/55 leading-relaxed mb-3">
                VYB currently detects likely Unity/Unreal/Godot/raw asset structures and generates honest migration
                reports. Full translation pipelines are planned.
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => handleOpenMockProject('mock://local', 'Mock VYB Project')}
              >
                Create Mock Project
              </Button>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

