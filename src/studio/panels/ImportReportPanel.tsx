import ReactMarkdown from 'react-markdown';
import { useAppState } from '../../app/state/useAppState';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { Button } from '../../ui/components/Button';
import { applyImportToWorkspace } from '../../app/import/runImportPipeline';
import { isTauri } from '../../app/platform/isTauri';

export function ImportReportPanel() {
  const importReport = useAppState((s) => s.importReport);
  const sourcePath = useAppState((s) => s.importLastSourcePath);
  const projectRoot = useAppState((s) => s.projectRootPath);
  const setImportReport = useAppState((s) => s.actions.setImportReport);
  const pushConsole = useAppState((s) => s.actions.pushConsole);
  const applyImportedPreview = useAppState((s) => s.actions.applyImportedPreview);

  if (!importReport) return null;

  const primary = importReport.detection.primary;
  const canImport = !!primary && primary.type !== 'vyb' && primary.type !== 'unknown';

  const runImport = async (previewOnly: boolean) => {
    if (!primary) return;
    const targetRoot = projectRoot ?? 'examples/sample-vyb-project';
    try {
      pushConsole({
        level: 'info',
        message: previewOnly ? `Previewing import from ${primary.type}…` : `Running import pipeline (${primary.type})…`,
      });

      const outcome = await applyImportToWorkspace({
        source: { ...primary, rootPath: sourcePath ?? primary.rootPath },
        targetProjectRoot: targetRoot,
        previewOnly,
        applyWorkspace: (payload) => {
          if (projectRoot) {
            applyImportedPreview({
              scene: payload.scene,
              sceneRelativePath: payload.defaultSceneRelativePath,
              assets: payload.assets,
              projectTree: payload.projectTree,
            });
          } else {
            applyImportedPreview({
              scene: payload.scene,
              sceneRelativePath: payload.defaultSceneRelativePath,
              assets: payload.assets,
            });
          }
        },
      });

      outcome.result.warnings.forEach((w) => pushConsole({ level: 'warn', message: w }));
      pushConsole({
        level: 'info',
        message: `Import ${previewOnly ? 'preview' : 'run'} complete — assets: ${outcome.result.assetsCopied}, scenes: ${outcome.result.scenesWritten.length}`,
      });

      if (outcome.sceneLoaded) {
        pushConsole({ level: 'info', message: `Loaded imported scene: ${outcome.result.previewSceneRelativePath}` });
      }
    } catch (e) {
      pushConsole({ level: 'error', message: `Import failed: ${e instanceof Error ? e.message : String(e)}` });
    }
  };

  return (
    <GlassPanel className="p-2 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-1 mb-2">
        <div className="min-w-0">
          <div className="text-xs font-bold tracking-wide text-vyb-text/80">Import Report</div>
          <div className="text-[11px] text-vyb-text/55 truncate">{sourcePath}</div>
        </div>
        <div className="flex gap-1 shrink-0">
          {canImport ? (
            <>
              <Button variant="secondary" className="h-8 px-2 text-xs" onClick={() => void runImport(true)}>
                Preview
              </Button>
              <Button
                variant="primary"
                className="h-8 px-2 text-xs"
                disabled={!isTauri()}
                title={isTauri() ? 'Copy assets and write scenes to project' : 'Full import requires Tauri desktop app'}
                onClick={() => void runImport(false)}
              >
                Run Import
              </Button>
            </>
          ) : null}
          <Button variant="ghost" className="h-8 px-2 text-xs" onClick={() => setImportReport(undefined, undefined)}>
            Close
          </Button>
        </div>
      </div>

      <div className="overflow-auto pr-1 max-h-[280px]">
        <ReactMarkdown>{importReport.markdown}</ReactMarkdown>
      </div>
    </GlassPanel>
  );
}
