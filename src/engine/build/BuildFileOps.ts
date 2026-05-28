import { invoke } from '@tauri-apps/api/core';
import { isTauri } from '../../app/platform/isTauri';

export interface BuildFileOps {
  listProjectFiles(projectRoot: string): Promise<string[]>;
  readProjectText(projectRoot: string, relativePath: string): Promise<string>;
  writeBuildText(outputRoot: string, relativePath: string, content: string): Promise<void>;
  copyToBuild(projectRoot: string, sourceRelative: string, outputRoot: string, targetRelative: string): Promise<void>;
}

export function createBuildFileOps(): BuildFileOps {
  if (isTauri()) return createTauriBuildFileOps();
  return createWebBuildFileOps();
}

function createTauriBuildFileOps(): BuildFileOps {
  return {
    async listProjectFiles(projectRoot) {
      const result = await invoke<{ files: string[] }>('list_build_source_files', { projectRoot });
      return result.files;
    },
    async readProjectText(projectRoot, relativePath) {
      const result = await invoke<{ content: string }>('read_import_source_text', {
        rootPath: projectRoot,
        relativePath,
      });
      return result.content;
    },
    async writeBuildText(outputRoot, relativePath, content) {
      await invoke('write_build_artifact', { outputRoot, relativePath, content });
    },
    async copyToBuild(projectRoot, sourceRelative, outputRoot, targetRelative) {
      await invoke('copy_build_artifact', {
        projectRoot,
        sourceRelative,
        outputRoot,
        targetRelative,
      });
    },
  };
}

function createWebBuildFileOps(): BuildFileOps {
  return {
    async listProjectFiles() {
      return [];
    },
    async readProjectText() {
      throw new Error('Reading project files for build requires the Tauri desktop app.');
    },
    async writeBuildText() {
      throw new Error('Writing build output requires the Tauri desktop app.');
    },
    async copyToBuild() {
      throw new Error('Staging build artifacts requires the Tauri desktop app.');
    },
  };
}
