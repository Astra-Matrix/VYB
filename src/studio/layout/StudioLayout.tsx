import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
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
import { AIPanel } from '../panels/AIPanel';
import { CodeEditorPanel } from '../code/CodeEditorPanel';
import { VisualScriptingPanel } from '../visual-scripting/VisualScriptingPanel';
import { ImportReportPanel } from '../panels/ImportReportPanel';
import { PluginListPanel } from '../panels/PluginListPanel';
import { SystemsRuntimePanel } from '../panels/SystemsRuntimePanel';
import { DocsModal } from '../docs/DocsModal';
import { STUDIO_BUILD_LABEL } from '../../app/studioBuildLabel';

function ResizeHandle() {
  return (
    <PanelResizeHandle className="w-1.5 mx-0.5 rounded-full bg-transparent hover:bg-vyb-plasma/50 transition-all duration-150 data-[resize-handle-active]:bg-vyb-plasma/70 data-[resize-handle-active]:shadow-[0_0_12px_rgba(255,107,26,0.35)]" />
  );
}

function StatusBar() {
  const project = useAppState((s) => s.currentProject);
  const mode = useAppState((s) => s.activeMode);
  const viewportBackend = useAppState((s) => s.viewportBackend);
  const runtimeStats = useAppState((s) => s.runtimeStats);
  const backendLabel =
    viewportBackend === 'webgpu' ? 'WebGPU' : viewportBackend === 'placeholder' ? 'Canvas' : '…';

  return (
    <footer className="h-9 shrink-0 border-t border-vyb-line/80 bg-vyb-charcoal/95 backdrop-blur-panel px-4 flex items-center justify-between text-[10px] text-vyb-muted font-mono">
      <span className="truncate">
        {project ? `${project.name} v${project.version}` : '—'} • {mode}
        <span className="text-vyb-muted ml-2 hidden lg:inline">• {STUDIO_BUILD_LABEL}</span>
      </span>
      <span className="flex gap-4">
        {runtimeStats ? (
          <>
            <span>tick {runtimeStats.tick}</span>
            {runtimeStats.physicsBodies !== undefined ? <span>physics {runtimeStats.physicsBodies}</span> : null}
          </>
        ) : null}
        <span className="text-vyb-plasma font-semibold">{backendLabel}</span>
      </span>
    </footer>
  );
}

function LeftColumn() {
  return (
    <div className="h-full flex flex-col gap-2 p-2">
      <ProjectExplorerPanel />
      <HierarchyPanel />
      <div className="flex-1 min-h-0">
        <AssetBrowserPanel />
      </div>
    </div>
  );
}

function RightColumn() {
  const mode = useAppState((s) => s.activeMode);
  const importReport = useAppState((s) => s.importReport);

  if (mode === 'Build') {
    return (
      <div className="h-full p-2">
        <BuildPanel />
      </div>
    );
  }
  if (mode === 'AI') {
    return (
      <div className="h-full p-2">
        <AIPanel />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-2 p-2 overflow-hidden">
      {(mode === 'Audio' || mode === 'Network') && <SystemsRuntimePanel />}
      {(mode === 'Render' || mode === 'Design') && <HardwarePanel />}
      {importReport ? <ImportReportPanel /> : null}
      {mode === 'Design' ? <PluginListPanel /> : null}
      <div className="flex-1 min-h-0 overflow-hidden">
        <InspectorPanel />
      </div>
    </div>
  );
}

function CenterPanel() {
  const mode = useAppState((s) => s.activeMode);
  if (mode === 'Code') {
    return (
      <div className="h-full p-2">
        <CodeEditorPanel />
      </div>
    );
  }
  if (mode === 'World') {
    return (
      <div className="h-full p-2">
        <VisualScriptingPanel />
      </div>
    );
  }
  if (mode === 'Audio' || mode === 'Network') {
    return (
      <div className="h-full p-2 flex flex-col gap-2">
        <div className="flex-[2] min-h-0 rounded-lg border border-vyb-plasma/20 shadow-rim-plasma overflow-hidden ring-1 ring-vyb-plasma/10">
          <ViewportPanel />
        </div>
      </div>
    );
  }
  return (
    <div className="h-full p-2">
      <div className="h-full rounded-lg border border-vyb-plasma/15 shadow-panel overflow-hidden ring-1 ring-white/[0.03]">
        <ViewportPanel />
      </div>
    </div>
  );
}

export function StudioLayout() {
  const openDocsId = useAppState((s) => s.openDocsId);
  const setOpenDocsId = useAppState((s) => s.actions.setOpenDocsId);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-vyb-bg bg-mesh-hero">
      <div className="h-[2px] shrink-0 bg-accent-bar opacity-90" />
      <CommandBar />

      <div className="flex-1 min-h-0">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={22} minSize={16} maxSize={35}>
            <LeftColumn />
          </Panel>
          <ResizeHandle />
          <Panel defaultSize={56} minSize={35}>
            <CenterPanel />
          </Panel>
          <ResizeHandle />
          <Panel defaultSize={22} minSize={16} maxSize={40}>
            <RightColumn />
          </Panel>
        </PanelGroup>
      </div>

      <PanelGroup direction="vertical" className="h-[280px] shrink-0 border-t border-vyb-border/60">
        <Panel defaultSize={100} minSize={40}>
          <div className="h-full p-2 pt-1">
            <ConsolePanel />
          </div>
        </Panel>
      </PanelGroup>

      <StatusBar />
      <SettingsPanel />
      {openDocsId ? (
        <DocsModal docId={openDocsId} onClose={() => setOpenDocsId(undefined)} onSelectDoc={setOpenDocsId} />
      ) : null}
    </div>
  );
}
