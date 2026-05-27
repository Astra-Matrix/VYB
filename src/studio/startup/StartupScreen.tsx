import { useEffect, useState } from 'react';
import { Button } from '../../ui/components/Button';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { TextField } from '../../ui/components/TextField';
import { useAppState } from '../../app/state/useAppState';
import { useNavigate } from 'react-router-dom';
import { chooseDirectory } from '../../app/commands/tauriCommands';
import {
  bootstrapBundledSampleProject,
  bootstrapProjectAtPath,
  createProjectWorkspace,
} from '../../app/workspace/projectWorkspace';
import { createSampleNodeGraph } from '../../engine/visual-scripting';
import { isTauri } from '../../app/platform/isTauri';

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
  const setSettingsOpen = useAppState((s) => s.actions.setSettingsOpen);
  const pushConsole = useAppState((s) => s.actions.pushConsole);

  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [createName, setCreateName] = useState('My VYB Project');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setRecent(loadRecent());
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

      const rootPath = await chooseDirectory();
      if (!rootPath) return;

      const workspace = await createProjectWorkspace(createName.trim(), rootPath);
      await enterStudio(workspace);
    } catch (e) {
      pushConsole({
        level: 'error',
        message: `Create project failed: ${e instanceof Error ? e.message : String(e)}`,
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function handleOpenExisting() {
    setIsBusy(true);
    try {
      if (!isTauri()) {
        const workspace = await bootstrapBundledSampleProject();
        await enterStudio(workspace);
        return;
      }

      const rootPath = await chooseDirectory();
      if (!rootPath) return;

      const workspace = await bootstrapProjectAtPath(rootPath);
      await enterStudio(workspace);
    } catch (e) {
      pushConsole({
        level: 'error',
        message: `Open project failed: ${e instanceof Error ? e.message : String(e)}`,
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
                Phase 1 adds real project I/O, filesystem asset indexing, scene persistence, and improved hierarchy/inspector
                editing.
              </div>

              <div className="mt-4 rounded-lg border border-vyb-border/60 bg-black/10 p-3">
                <div className="text-xs font-bold tracking-wide text-vyb-text/70 mb-1">Runtime</div>
                <div className="text-[11px] text-vyb-text/55 leading-relaxed">
                  {isTauri()
                    ? 'Desktop mode: filesystem project create/open, asset scan, and scene save are enabled.'
                    : 'Web dev mode: bundled sample project is used. Run `npm run tauri:dev` for full filesystem integration.'}
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-bold tracking-wide text-vyb-text/80">Create a new project</div>
                  <div className="text-[11px] text-vyb-text/55">Writes `.vyb/`, folders, and `scenes/main.vybscene`.</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] text-vyb-text/55 font-semibold">Project name</div>
                <TextField value={createName} onChange={(e) => setCreateName(e.target.value)} disabled={isBusy} />

                <Button variant="primary" className="w-full" disabled={isBusy || !createName.trim()} onClick={handleCreate}>
                  {isBusy ? 'Working…' : isTauri() ? 'Create Project' : 'Open Sample Project'}
                </Button>

                <Button variant="ghost" className="w-full" disabled={isBusy} onClick={() => setSettingsOpen(true)}>
                  Studio preferences
                </Button>
                <Button variant="secondary" className="w-full" disabled={isBusy} onClick={handleOpenExisting}>
                  {isTauri() ? 'Open Existing Project' : 'Open Bundled Sample'}
                </Button>
              </div>
            </GlassPanel>
          </div>

          <div className="space-y-4">
            <GlassPanel className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-bold tracking-wide text-vyb-text/80">Recent projects</div>
                  <div className="text-[11px] text-vyb-text/55">Stored locally in your browser.</div>
                </div>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                {recent.length === 0 ? (
                  <div className="text-[11px] text-vyb-text/55">No recent projects yet.</div>
                ) : (
                  recent.map((r) => (
                    <button
                      key={r.rootPath}
                      className="w-full text-left rounded-lg border border-vyb-border/40 bg-black/10 p-3 hover:bg-white/5"
                      onClick={() => handleOpenRecent(r)}
                    >
                      <div className="text-xs font-bold text-vyb-text/85 truncate">{r.name}</div>
                      <div className="text-[11px] text-vyb-text/55 truncate">{r.rootPath}</div>
                    </button>
                  ))
                )}
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
