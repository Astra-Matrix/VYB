import type { ImportSourceType } from './ImportDetector';

export interface VybImportMapEntry {
  sourcePath: string;
  targetPath: string;
  sourceEngine: ImportSourceType;
  category: 'asset' | 'scene' | 'material' | 'script';
  importedAt: string;
}

export interface VybImportMapFile {
  entries: VybImportMapEntry[];
  lastUpdated: string;
}

export function createEmptyImportMap(): VybImportMapFile {
  return { entries: [], lastUpdated: new Date().toISOString() };
}

export function mergeImportMap(existing: VybImportMapFile, added: VybImportMapEntry[]): VybImportMapFile {
  const byTarget = new Map(existing.entries.map((e) => [e.targetPath, e]));
  for (const entry of added) {
    byTarget.set(entry.targetPath, entry);
  }
  return {
    entries: Array.from(byTarget.values()),
    lastUpdated: new Date().toISOString(),
  };
}

export function importMapToJson(map: VybImportMapFile): string {
  return JSON.stringify(map, null, 2);
}

export function importMapFromJson(json: string): VybImportMapFile {
  const data = JSON.parse(json) as VybImportMapFile;
  if (!Array.isArray(data.entries)) throw new Error('Invalid import.map.json');
  return data;
}
