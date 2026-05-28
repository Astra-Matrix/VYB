import type { DetectedProject } from '../../engine/import/ImportDetector';
import { createImportFileOps } from '../../engine/import/ImportFileOps';
import { ImportPipeline, loadPreviewSceneFromResult } from '../../engine/import/ImportPipeline';
import { BUNDLED_GODOT_IMPORT_ROOT, BUNDLED_IMPORT_FILES } from '../../engine/import/bundledImportSources';
import { isTauri } from '../platform/isTauri';
import { scanProjectAssets, scannedAssetsToMetadata, listProjectTree } from '../commands/tauriCommands';
import { AssetRegistry } from '../../engine/assets/AssetRegistry';
import { sceneFromJson } from '../../engine/scene';

export interface RunImportOptions {
  source: DetectedProject;
  targetProjectRoot: string;
  previewOnly?: boolean;
}

export interface RunImportOutcome {
  result: Awaited<ReturnType<ImportPipeline['execute']>>;
  sceneLoaded: boolean;
}

export async function runImportPipeline(options: RunImportOptions): Promise<RunImportOutcome> {
  const source = normalizeSourceRoot(options.source);
  const fileOps = createImportFileOps(BUNDLED_IMPORT_FILES);
  const pipeline = new ImportPipeline(fileOps);

  const result = options.previewOnly || !isTauri()
    ? await pipeline.preview(source)
    : await pipeline.execute(source, options.targetProjectRoot);

  return { result, sceneLoaded: false };
}

export async function applyImportToWorkspace(
  options: RunImportOptions & {
    applyWorkspace: (payload: {
      scene: ReturnType<typeof sceneFromJson>;
      defaultSceneRelativePath: string;
      assets?: ReturnType<typeof scannedAssetsToMetadata>;
      projectTree?: Awaited<ReturnType<typeof listProjectTree>>['entries'];
    }) => void;
  },
): Promise<RunImportOutcome> {
  const outcome = await runImportPipeline(options);
  const preview = loadPreviewSceneFromResult(outcome.result);
  if (!preview || !outcome.result.previewSceneRelativePath) return outcome;

  if (isTauri() && options.targetProjectRoot) {
    const scan = await scanProjectAssets(options.targetProjectRoot);
    const tree = await listProjectTree(options.targetProjectRoot);
    options.applyWorkspace({
      scene: preview,
      defaultSceneRelativePath: outcome.result.previewSceneRelativePath,
      assets: scannedAssetsToMetadata(scan.assets),
      projectTree: tree.entries,
    });
    outcome.sceneLoaded = true;
    return outcome;
  }

  const registry = new AssetRegistry();
  registry.scanFiles(
    outcome.result.importMapEntries.map((e) => e.targetPath),
    { knownExtensionsOnly: false },
  );
  options.applyWorkspace({
    scene: preview,
    defaultSceneRelativePath: outcome.result.previewSceneRelativePath,
    assets: registry.getAllAssets(),
    projectTree: [],
  });
  outcome.sceneLoaded = true;
  return outcome;
}

function normalizeSourceRoot(source: DetectedProject): DetectedProject {
  if (!isTauri() && source.type === 'godot') {
    return { ...source, rootPath: BUNDLED_GODOT_IMPORT_ROOT };
  }
  return source;
}
