export type AssetType =
  | 'mesh'
  | 'texture'
  | 'material'
  | 'audio'
  | 'script'
  | 'data'
  | 'scene'
  | 'shader'
  | 'ui'
  | 'animation'
  | 'physics'
  | 'ai_behavior'
  | 'prefab'
  | 'unknown';

export interface AssetMetadataBase {
  id: string;
  type: AssetType;
  path: string; // relative path within project (preferred)
  extension: string; // including dot
  sizeBytes?: number;
  createdAt?: string;
}

export interface MeshAssetMetadata extends AssetMetadataBase {
  type: 'mesh';
}

export interface TextureAssetMetadata extends AssetMetadataBase {
  type: 'texture';
}

export interface ShaderAssetMetadata extends AssetMetadataBase {
  type: 'shader';
}

export interface AudioAssetMetadata extends AssetMetadataBase {
  type: 'audio';
}

export interface ScriptAssetMetadata extends AssetMetadataBase {
  type: 'script';
  languageHint?: 'typescript' | 'javascript' | 'lua' | 'rust' | 'wasm';
}

export interface DataAssetMetadata extends AssetMetadataBase {
  type: 'data';
}

export interface SceneAssetMetadata extends AssetMetadataBase {
  type: 'scene';
}

export interface PrefabAssetMetadata extends AssetMetadataBase {
  type: 'prefab';
}

export interface AIBehaviorAssetMetadata extends AssetMetadataBase {
  type: 'ai_behavior';
}

export type AssetMetadata =
  | MeshAssetMetadata
  | TextureAssetMetadata
  | ShaderAssetMetadata
  | AudioAssetMetadata
  | ScriptAssetMetadata
  | DataAssetMetadata
  | SceneAssetMetadata
  | PrefabAssetMetadata
  | AIBehaviorAssetMetadata
  | AssetMetadataBase;

export const KNOWN_ASSET_EXTENSIONS: Record<string, AssetType> = {
  // meshes
  '.fbx': 'mesh',
  '.obj': 'mesh',
  '.glb': 'mesh',
  '.gltf': 'mesh',
  '.vybscene': 'scene',
  '.vybprefab': 'prefab',

  // textures
  '.png': 'texture',
  '.jpg': 'texture',
  '.jpeg': 'texture',
  '.webp': 'texture',
  '.hdr': 'texture',
  '.exr': 'texture',

  // audio
  '.wav': 'audio',
  '.mp3': 'audio',
  '.ogg': 'audio',

  // scripts
  '.ts': 'script',
  '.js': 'script',
  '.lua': 'script',
  '.rs': 'script',
  '.wasm': 'script',

  // shaders / materials
  '.json': 'data',
  '.vybmat': 'material',
};

export const DEFAULT_SHADER_EXTENSIONS = ['.wgsl', '.glsl', '.hlsl'] as const;

