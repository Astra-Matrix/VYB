import { invoke } from '@tauri-apps/api/core';
import { isTauri } from '../../app/platform/isTauri';

export interface ImportFileOps {
  listFiles(rootPath: string): Promise<string[]>;
  readText(rootPath: string, relativePath: string): Promise<string>;
  writeText(targetRoot: string, relativePath: string, content: string): Promise<void>;
  copyIntoProject(sourceRoot: string, sourceRelative: string, targetRoot: string, targetRelative: string): Promise<void>;
}

const ASSET_EXT = /\.(fbx|obj|glb|gltf|png|jpe?g|webp|hdr|exr|wav|mp3|ogg|tscn|tres|vybscene|vybmat)$/i;

export function createImportFileOps(bundledFiles?: Record<string, string>): ImportFileOps {
  if (isTauri()) return createTauriImportFileOps();
  return createWebImportFileOps(bundledFiles ?? {});
}

function createTauriImportFileOps(): ImportFileOps {
  return {
    async listFiles(rootPath) {
      const result = await invoke<{ files: string[] }>('list_import_source_files', { rootPath });
      return result.files;
    },
    async readText(rootPath, relativePath) {
      const result = await invoke<{ content: string }>('read_import_source_text', { rootPath, relativePath });
      return result.content;
    },
    async writeText(targetRoot, relativePath, content) {
      await invoke('write_project_text_file', { rootPath: targetRoot, relativePath, content });
    },
    async copyIntoProject(sourceRoot, sourceRelative, targetRoot, targetRelative) {
      await invoke('copy_import_asset', {
        sourceRoot,
        sourceRelative,
        targetRoot,
        targetRelative,
      });
    },
  };
}

function createWebImportFileOps(bundledFiles: Record<string, string>): ImportFileOps {
  return {
    async listFiles(rootPath) {
      const prefix = rootPath.replace(/\\/g, '/').replace(/\/$/, '');
      return Object.keys(bundledFiles)
        .map((k) => k.replace(/\\/g, '/'))
        .filter((k) => k.startsWith(`${prefix}/`))
        .map((k) => k.slice(prefix.length + 1));
    },
    async readText(rootPath, relativePath) {
      const normRoot = rootPath.replace(/\\/g, '/').replace(/\/$/, '');
      const key = `${normRoot}/${relativePath.replace(/\\/g, '/')}`;
      if (bundledFiles[key]) return bundledFiles[key];
      throw new Error(`Bundled import file not found: ${key}`);
    },
    async writeText(_targetRoot, _relativePath, _content) {
      throw new Error('Writing import output requires the Tauri desktop app.');
    },
    async copyIntoProject() {
      throw new Error('Copying import assets requires the Tauri desktop app.');
    },
  };
}

export function filterImportableAssetPaths(files: string[]): string[] {
  return files.filter((f) => ASSET_EXT.test(f));
}
