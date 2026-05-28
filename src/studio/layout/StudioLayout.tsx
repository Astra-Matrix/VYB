import { useAppState } from '../../app/state/useAppState';
import { CommandBar } from './CommandBar';
import { SettingsPanel } from '../settings/SettingsPanel';
import { ProjectExplorerPanel } from '../panels/ProjectExplorerPanel';
import { HierarchyPanel } from '../hierarchy/HierarchyPanel';
import { AssetBrowserPanel } from '../asset-browser/AssetBrowserPanel';
import { InspectorPanel } from '../inspector/InspectorPanel';
import { HardwarePanel } from '../panels/HardwarePanel';
import { ConsolePanel } from '../console/ConsolePanel';
import { ViewportPanel } from '../viewport/ViewportPanel';
import { BuildPanel } from '../panels/BuildPanel';
import { AIPanelPlaceholder } from '../panels/AIPanelPlaceholder';
import { CodeEditorPanel } from '../code/CodeEditorPanel';
import { VisualScriptingPanel } from '../visual-scripting/VisualScriptingPanel';
import { ImportReportPanel } from '../panels/ImportReportPanel';
import { PluginListPanel } from '../panels/PluginListPanel';

import { GlassPanel } from '../../ui/components/GlassPanel';

function StatusBar() {
  const project = useAppState((s) => s.currentProject);
  const mode = useAppState((s) => s.activeMode);
  const viewportBackend = useAppState((s) => s.viewportBackend);
  const backendLabel =
    viewportBackend === 'webgpu'
      ? 'WebGPU'
      : viewportBackend === 'placeholder'
        ? 'Canvas placeholder'
        : 'Initializing…';
  return (
    <div className="h-10 border-t border-vyb-border/60 bg-vyb-panel/30 backdrop-blur-panel px-4 flex items-center justify-between text-[11px] text-vyb-text/55">
      <div className="truncate">
        {project ? `${project.name} — v${project.version}` : 'No project opened'} • Mode: {mode}
      </div>
      <div>Viewport renderer: {backendLabel}</div>
    </div>
  );
}

function LeftColumn() {
  return (
    <div className="h-full w-full flex flex-col gap-2 overflow-hidden">
      <ProjectExplorerPanel />
      <HierarchyPanel />
      <div className="flex-1 overflow-auto">
        <AssetBrowserPanel />
      </div>
    </div>
  );
}

function RightColumn() {
  const mode = useAppState((s) => s.activeMode);
  const importReport = useAppState((s) => s.importReport);

  if (mode === 'Build') return <BuildPanel />;
  if (mode === 'AI') return <AIPanelPlaceholder />;

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      {(mode === 'Render' || mode === 'Design') && <HardwarePanel />}
      {importReport ? <ImportReportPanel /> : null}
      {mode === 'Design' ? <PluginListPanel /> : null}
      <div className="flex-1 overflow-auto">
        <InspectorPanel />
      </div>
    </div>
  );
}

function CenterPanel() {
  const mode = useAppState((s) => s.activeMode);
  if (mode === 'Code') return <CodeEditorPanel />;
  if (mode === 'World') return <VisualScriptingPanel />;
  // Design/Render modes always include the viewport.
  if (mode === 'Design' || mode === 'Render') return <ViewportPanel />;

  // Other modes are scaffolds routed into viewport for now.
  return (
    <div className="h-full">
      <GlassPanel className="p-4 h-full">
        <div className="text-xs font-bold tracking-wide text-vyb-text/80 mb-2">{mode} mode</div>
        <div className="text-[11px] text-vyb-text/55 leading-relaxed">
          This is a foundation scaffold. Planned Phase 6+ systems will replace this placeholder with
          dedicated UI (audio graphs, networking sessions, renderer pipeline selection, etc.).
        </div>
        <div className="mt-4 h-[60%]">
          <ViewportPanel />
        </div>
      </GlassPanel>
    </div>
  );
}

export function StudioLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-vyb-bg">
      <CommandBar />
      <div className="h-[calc(100vh-14rem)] min-h-[520px] grid grid-cols-[320px_1fr_360px] gap-3 p-3 overflow-hidden">
        <LeftColumn />
        <div className="min-h-0 h-full overflow-hidden">
          <CenterPanel />
        </div>
        <RightColumn />
      </div>

      <div className="h-[320px] p-3 pt-0">
        <ConsolePanel />
      </div>

      <StatusBar />
      <SettingsPanel />
    </div>
  );
}

