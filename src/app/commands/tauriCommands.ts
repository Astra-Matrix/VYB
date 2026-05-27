import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

export async function chooseDirectory(initialDirectory?: string): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    defaultPath: initialDirectory,
  });
  return (selected as string | null) ?? null;
}

export async function createVybProject(payload: { name: string; rootPath: string }): Promise<{ createdAt: string }> {
  const result = await invoke<{ created_at: string }>('create_vyb_project', payload);
  return { createdAt: result.created_at };
}

export async function validateVybProject(rootPath: string): Promise<{ project: unknown; valid: boolean; errors: string[]; warnings: string[] }> {
  return invoke('validate_vyb_project', { rootPath });
}

export async function detectImportCompatibility(rootPath: string): Promise<{ markdown: string; report: unknown }> {
  return invoke('detect_import_compatibility', { rootPath });
}

export async function scanProjectAssets(rootPath: string): Promise<{ assets: unknown[]; scannedAt: string }> {
  return invoke('scan_project_assets', { rootPath });
}

export async function probeHardware(): Promise<unknown> {
  return invoke('probe_hardware_capabilities');
}

export async function readDocMarkdown(payload: { docId: string }): Promise<{ markdown: string }> {
  return invoke('read_doc_markdown', payload);
}

