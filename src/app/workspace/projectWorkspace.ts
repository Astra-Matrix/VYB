import { AssetRegistry } from '../../engine/assets/AssetRegistry';
import { createSampleNodeGraph } from '../../engine/visual-scripting';
import { createSampleScene, sceneFromJson, type VybScene } from '../../engine/scene';
import type { VybProject } from '../../engine/project/types';
import { isTauri } from '../platform/isTauri';
import {
  createVybProject,
  listProjectTree,
  loadSceneFile,
  scanProjectAssets,
  scannedAssetsToMetadata,
  validateVybProject,
  type ProjectTreeEntryDto,
} from '../commands/tauriCommands';
import sampleProjectJson from '../../../examples/sample-vyb-project/.vyb/project.vyb.json';
import sampleSceneJson from '../../../examples/sample-vyb-project/scenes/main.vybscene?raw';

export interface WorkspaceBootstrapResult {
  rootPath: string;
  project: VybProject;
  scene: VybScene;
  defaultSceneRelativePath: string;
  assets: ReturnType<AssetRegistry['getAllAssets']>;
  assetsScannedAt: string;
  projectTree: ProjectTreeEntryDto[];
  selectEntityId?: string;
}

function joinPath(root: string, rel: string): string {
  const sep = root.includes('\\') ? '\\' : '/';
  const normalized = rel.replace(/\//g, sep);
  if (root.endsWith(sep)) return `${root}${normalized}`;
  return `${root}${sep}${normalized}`;
}

export async function bootstrapProjectAtPath(rootPath: string): Promise<WorkspaceBootstrapResult> {
  if (!isTauri()) {
    return bootstrapBundledSampleProject();
  }

  const validation = await validateVybProject(rootPath);
  if (!validation.project) {
    throw new Error(validation.errors.join('; ') || 'Failed to load project metadata.');
  }

  const project = validation.project;
  const defaultSceneRelativePath = project.defaultScene ?? project.scenes[0] ?? 'scenes/main.vybscene';
  const scenePath = joinPath(rootPath, defaultSceneRelativePath);

  let scene: VybScene;
  try {
    const loaded = await loadSceneFile(scenePath);
    scene = sceneFromJson(loaded.json);
  } catch {
    const sample = createSampleScene();
    scene = sample.scene;
  }

  const scan = await scanProjectAssets(rootPath);
  const assets = scannedAssetsToMetadata(scan.assets);

  const tree = await listProjectTree(rootPath);

  const selectEntityId =
    scene.activeCameraEntityId ??
    scene.world.getAllEntities().find((e) => scene.world.hasComponent(e.id, 'meshRenderer'))?.id;

  return {
    rootPath,
    project,
    scene,
    defaultSceneRelativePath,
    assets,
    assetsScannedAt: scan.scannedAt,
    projectTree: tree.entries,
    selectEntityId,
  };
}

export async function createProjectWorkspace(name: string, rootPath: string): Promise<WorkspaceBootstrapResult> {
  if (!isTauri()) {
    return bootstrapBundledSampleProject(name);
  }

  const created = await createVybProject({ name, rootPath });
  return bootstrapProjectAtPath(rootPath).then((r) => ({
    ...r,
    defaultSceneRelativePath: created.defaultScenePath,
  }));
}

/** Web/dev fallback: load bundled example project from repository examples/. */
export async function bootstrapBundledSampleProject(nameOverride?: string): Promise<WorkspaceBootstrapResult> {
  const project = {
    ...(sampleProjectJson as VybProject),
    name: nameOverride ?? (sampleProjectJson as VybProject).name,
    modifiedAt: new Date().toISOString(),
  };

  let scene: VybScene;
  try {
    scene = sceneFromJson(sampleSceneJson);
  } catch {
    scene = createSampleScene().scene;
  }

  const registry = new AssetRegistry();
  registry.scanFiles(
    [
      'assets/mesh/unit-cube.glb',
      'assets/texture/diffuse.png',
      'scripts/player.ts',
    ],
    { knownExtensionsOnly: true },
  );

  const rootPath = 'examples/sample-vyb-project';
  const tree: ProjectTreeEntryDto[] = [
    { relativePath: '.', name: '.', isDirectory: true, depth: 0 },
    { relativePath: '.vyb', name: '.vyb', isDirectory: true, depth: 1 },
    { relativePath: 'assets', name: 'assets', isDirectory: true, depth: 1 },
    { relativePath: 'assets/mesh', name: 'mesh', isDirectory: true, depth: 2 },
    { relativePath: 'assets/mesh/unit-cube.glb', name: 'unit-cube.glb', isDirectory: false, depth: 3 },
    { relativePath: 'scenes', name: 'scenes', isDirectory: true, depth: 1 },
    { relativePath: 'scenes/main.vybscene', name: 'main.vybscene', isDirectory: false, depth: 2 },
  ];

  return {
    rootPath,
    project,
    scene,
    defaultSceneRelativePath: 'scenes/main.vybscene',
    assets: registry.getAllAssets(),
    assetsScannedAt: new Date().toISOString(),
    projectTree: tree,
    selectEntityId: scene.activeCameraEntityId ?? '3',
  };
}

export { createSampleNodeGraph };
