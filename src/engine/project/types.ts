export type TargetPlatform =
  | 'windows'
  | 'macos'
  | 'linux'
  | 'web'
  | 'android'
  | 'ios'
  | 'vr'
  | 'ar'
  | 'console'
  | 'cloud-streaming'
  | 'dedicated-server'
  | 'headless-simulation';

export type RenderingMode = 'webgpu' | 'wgpu-native' | 'compatibility' | 'software';

export type ScriptingLanguage = 'typescript' | 'javascript' | 'lua' | 'rust' | 'wasm';

export interface ImportCompatibilityMetadata {
  unity?: { detected: boolean; version?: string };
  unreal?: { detected: boolean; version?: string };
  godot?: { detected: boolean; version?: string };
  rawAssets?: { detected: boolean; fileCount?: number };
}

export interface VybProject {
  name: string;
  version: string;
  engineVersion: string;
  description?: string;
  createdAt: string;
  modifiedAt: string;
  targetPlatforms: TargetPlatform[];
  renderingMode: RenderingMode;
  assetFolders: string[];
  scenes: string[];
  plugins: string[];
  scriptingLanguages: ScriptingLanguage[];
  defaultScene?: string;
  importCompatibility: ImportCompatibilityMetadata;
}

export interface EngineConfig {
  renderer: {
    backend: RenderingMode;
    maxTextureSize: number;
    msaa: number;
    vsync: boolean;
  };
  physics: {
    enabled: boolean;
    gravity: [number, number, number];
  };
  audio: {
    masterVolume: number;
    sampleRate: number;
  };
  networking: {
    enabled: boolean;
    maxPlayers: number;
  };
}

export interface ImportMapEntry {
  sourceEngine: 'unity' | 'unreal' | 'godot' | 'raw' | 'vyb';
  sourcePath: string;
  targetPath: string;
  status: 'planned' | 'partial' | 'manual' | 'complete';
  notes?: string;
}

export interface ImportMap {
  entries: ImportMapEntry[];
  lastUpdated: string;
}

export const VYB_PROJECT_DIRS = [
  '.vyb',
  'assets',
  'scenes',
  'scripts',
  'materials',
  'shaders',
  'audio',
  'ui',
  'builds',
  'plugins',
  'docs',
] as const;

export const DEFAULT_ASSET_FOLDERS = [
  'assets',
  'scenes',
  'scripts',
  'materials',
  'shaders',
  'audio',
  'ui',
] as const;

export function createDefaultProject(name: string): VybProject {
  const now = new Date().toISOString();
  return {
    name,
    version: '0.1.0',
    engineVersion: '0.1.0',
    description: 'A new VYB project',
    createdAt: now,
    modifiedAt: now,
    targetPlatforms: ['windows', 'macos', 'linux'],
    renderingMode: 'webgpu',
    assetFolders: [...DEFAULT_ASSET_FOLDERS],
    scenes: ['scenes/main.vybscene'],
    plugins: [],
    scriptingLanguages: ['typescript', 'javascript'],
    defaultScene: 'scenes/main.vybscene',
    importCompatibility: {},
  };
}

export function createDefaultEngineConfig(): EngineConfig {
  return {
    renderer: {
      backend: 'webgpu',
      maxTextureSize: 8192,
      msaa: 4,
      vsync: true,
    },
    physics: {
      enabled: true,
      gravity: [0, -9.81, 0],
    },
    audio: {
      masterVolume: 1,
      sampleRate: 48000,
    },
    networking: {
      enabled: false,
      maxPlayers: 16,
    },
  };
}

export function createDefaultImportMap(): ImportMap {
  return {
    entries: [],
    lastUpdated: new Date().toISOString(),
  };
}
