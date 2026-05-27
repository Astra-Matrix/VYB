import { useMemo, useState } from 'react';
import { File, Folder, RefreshCw } from 'lucide-react';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { Button } from '../../ui/components/Button';
import { useAppState } from '../../app/state/useAppState';
import { isTauri } from '../../app/platform/isTauri';
import { bootstrapProjectAtPath } from '../../app/workspace/projectWorkspace';

export function ProjectExplorerPanel() {
  const projectRootPath = useAppState((s) => s.projectRootPath);
  const currentProject = useAppState((s) => s.currentProject);
  const projectTree = useAppState((s) => s.projectTree);
  const applyWorkspace = useAppState((s) => s.actions.applyWorkspace);
  const pushConsole = useAppState((s) => s.actions.pushConsole);

  const [filter, setFilter] = useState('');

  const entries = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = projectTree.filter((e) => e.depth <= 4);
    if (!q) return list;
    return list.filter((e) => e.relativePath.toLowerCase().includes(q) || e.name.toLowerCase().includes(q));
  }, [filter, projectTree]);

  async function refreshWorkspace() {
    if (!projectRootPath || !isTauri()) {
      pushConsole({ level: 'warn', message: 'Refresh requires desktop mode and an opened project.' });
      return;
    }
    try {
      const workspace = await bootstrapProjectAtPath(projectRootPath);
      applyWorkspace(workspace);
      pushConsole({ level: 'info', message: 'Project workspace refreshed (tree + assets).' });
    } catch (e) {
      pushConsole({ level: 'error', message: `Refresh failed: ${e instanceof Error ? e.message : String(e)}` });
    }
  }

  return (
    <GlassPanel className="p-2 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <Folder className="w-4 h-4 text-vyb-accent shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-bold tracking-wide text-vyb-text/80">Project</div>
            <div className="text-[11px] text-vyb-text/50 truncate">{currentProject?.name ?? 'No project'}</div>
          </div>
        </div>
        <Button variant="ghost" className="h-8 px-2" onClick={refreshWorkspace} title="Refresh tree and assets">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <input
        className="w-full rounded-lg border border-vyb-border/60 bg-black/20 text-xs px-2 py-1 mb-2"
        placeholder="Filter files…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className="text-[11px] text-vyb-text/45 px-1 mb-1 truncate">{projectRootPath ?? '—'}</div>

      <div className="flex-1 overflow-auto space-y-0.5 pr-1">
        {entries.length === 0 ? (
          <div className="text-[11px] text-vyb-text/55 px-1 py-2">No files indexed yet.</div>
        ) : (
          entries.slice(0, 300).map((e) => (
            <div
              key={e.relativePath}
              className="flex items-center gap-2 text-[11px] text-vyb-text/70 truncate rounded px-1 py-0.5 hover:bg-white/5"
              style={{ paddingLeft: 4 + e.depth * 10 }}
              title={e.relativePath}
            >
              {e.isDirectory ? (
                <Folder className="w-3.5 h-3.5 text-vyb-text/35 shrink-0" />
              ) : (
                <File className="w-3.5 h-3.5 text-vyb-text/35 shrink-0" />
              )}
              <span className="truncate">{e.name}</span>
            </div>
          ))
        )}
      </div>
    </GlassPanel>
  );
}
