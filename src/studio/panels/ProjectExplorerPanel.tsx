import { FileCode2, Folder, Import, Plus } from 'lucide-react';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { Button } from '../../ui/components/Button';
import { useAppState } from '../../app/state/useAppState';

export function ProjectExplorerPanel() {
  const projectRootPath = useAppState((s) => s.projectRootPath);
  const currentProject = useAppState((s) => s.currentProject);

  const handleCreateProject = () => {
    // Startup screen owns create/open in this scaffold.
  };

  return (
    <GlassPanel className="p-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <Folder className="w-4 h-4 text-vyb-accent" />
          <div>
            <div className="text-xs font-bold tracking-wide text-vyb-text/80">Project</div>
            <div className="text-[11px] text-vyb-text/50 truncate">{currentProject?.name ?? 'No project'}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="h-8 px-2" onClick={handleCreateProject}>
            <Plus className="w-4 h-4" /> New
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-vyb-border/60 bg-black/10 p-2">
        <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-2">Workspace</div>
        <div className="text-[11px] text-vyb-text/55 break-all">
          {projectRootPath ?? 'Select “Open Project” to inspect files.'}
        </div>
      </div>

      <div className="mt-2 space-y-1">
        <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 px-1">Core VYB folders</div>
        <div className="space-y-1">
          {['.vyb/', 'assets/', 'scenes/', 'scripts/', 'materials/', 'shaders/', 'audio/', 'ui/', 'builds/', 'plugins/'].map(
            (f) => (
              <div key={f} className="flex items-center justify-between text-[11px] text-vyb-text/55 px-1">
                <span className="flex items-center gap-2 truncate">
                  <Folder className="w-4 h-4 text-vyb-text/25" />
                  {f}
                </span>
                <span className="text-[10px] text-vyb-text/35">scaffold</span>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={() => {}}>
          <Import className="w-4 h-4" />
          Import
        </Button>
        <Button variant="ghost" className="h-9 px-3">
          <FileCode2 className="w-4 h-4" />
        </Button>
      </div>
    </GlassPanel>
  );
}

