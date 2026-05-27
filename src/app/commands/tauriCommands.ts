import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import type { AssetMetadata } from '../../engine/assets';
import type { VybProject } from '../../engine/project/types';
import { parseProject } from '../../engine/project/projectService';

export async function chooseDirectory(initialDirectory?: string): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    defaultPath: initialDirectory,
  });
  return (selected as string | null) ?? null;
}

export async function createVybProject(payload: {
  name: string;
  rootPath: string;
}): Promise<{ createdAt: string; defaultScenePath: string }> {
  const result = await invoke<{ created_at: string; default_scene_path: string }>('create_vyb_project', {
    name: payload.name,
    rootPath: payload.rootPath,
  });
  return { createdAt: result.created_at, defaultScenePath: result.default_scene_path };
}

export async function validateVybProject(rootPath: string): Promise<{
  project: VybProject | null;
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const result = await invoke<{
    project?: unknown;
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>('validate_vyb_project', { rootPath });

  let project: VybProject | null = null;
  if (result.project) {
    project = parseProject(JSON.stringify(result.project));
  }

  return { ...result, project };
}

export async function detectImportCompatibility(rootPath: string): Promise<{ markdown: string; report: unknown }> {
  return invoke('detect_import_compatibility', { rootPath });
}

export interface ScannedAssetDto {
  path: string;
  extension: string;
  sizeBytes: number;
}

export async function scanProjectAssets(rootPath: string): Promise<{
  assets: ScannedAssetDto[];
  scannedAt: string;
  truncated: boolean;
}> {
  return invoke('scan_project_assets', { rootPath });
}

export interface ProjectTreeEntryDto {
  relativePath: string;
  name: string;
  isDirectory: boolean;
  depth: number;
}

export async function listProjectTree(rootPath: string): Promise<{
  entries: ProjectTreeEntryDto[];
  scannedAt: string;
}> {
  return invoke('list_project_tree', { rootPath });
}

export async function loadSceneFile(scenePath: string): Promise<{ json: string; scenePath: string }> {
  return invoke('load_scene', { scenePath });
}

export async function saveSceneFile(scenePath: string, json: string): Promise<{ savedAt: string; scenePath: string }> {
  const result = await invoke<{ saved_at: string; scene_path: string }>('save_scene', { scenePath, json });
  return { savedAt: result.saved_at, scenePath: result.scene_path };
}

export async function probeHardware(): Promise<unknown> {
  return invoke('probe_hardware_capabilities');
}

export async function readDocMarkdown(payload: { docId: string }): Promise<{ markdown: string }> {
  return invoke('read_doc_markdown', payload);
}

export function scannedAssetsToMetadata(assets: ScannedAssetDto[]): AssetMetadata[] {
  return assets.map((a) => {
    const ext = a.extension.toLowerCase();
    const type = inferType(ext);
    return {
      id: `${type}:${a.path}`,
      type,
      path: a.path,
      extension: ext,
      sizeBytes: a.sizeBytes,
    };
  });
}

function inferType(ext: string): AssetMetadata['type'] {
  const map: Record<string, AssetMetadata['type']> = {
    '.fbx': 'mesh',
    '.obj': 'mesh',
    '.glb': 'mesh',
    '.gltf': 'mesh',
    '.png': 'texture',
    '.jpg': 'texture',
    '.jpeg': 'texture',
    '.webp': 'texture',
    '.hdr': 'texture',
    '.exr': 'texture',
    '.wav': 'audio',
    '.mp3': 'audio',
    '.ogg': 'audio',
    '.ts': 'script',
    '.js': 'script',
    '.lua': 'script',
    '.rs': 'script',
    '.wasm': 'script',
    '.json': 'data',
    '.vybscene': 'scene',
    '.vybmat': 'material',
    '.vybprefab': 'prefab',
    '.wgsl': 'shader',
    '.glsl': 'shader',
    '.hlsl': 'shader',
  };
  return map[ext] ?? 'unknown';
}
