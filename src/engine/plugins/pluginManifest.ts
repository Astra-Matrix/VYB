export type PluginPermission =
  | 'filesystem.read'
  | 'filesystem.write'
  | 'network.outbound'
  | 'renderer.gpu'
  | 'ui.panels'
  | 'editor.commands'
  | 'import.handlers'
  | 'asset.processors'
  | 'build.targets'
  | 'scripting.extensions'
  | 'ai.tools'
  | 'marketplace.packages';

export interface PluginManifest {
  schemaVersion: string;
  pluginId: string;
  name: string;
  version: string;
  author: string;
  entrypoint: {
    /**
     * Path to the plugin's JS/TS entry when running in the editor.
     * Native plugin support comes later.
     */
    editor: string;
    /**
     * Optional renderer/native entry.
     */
    renderer?: string;
  };
  permissions: PluginPermission[];

  uiContributions?: {
    editorPanels?: string[];
    editorCommands?: string[];
  };

  extensionPoints?: {
    'editor.panels'?: string[];
    'editor.commands'?: string[];
    'importer.handlers'?: string[];
    'asset.processors'?: string[];
    'renderer.backends'?: string[];
    'build.targets'?: string[];
    'script.languages'?: string[];
    'ai.tools'?: string[];
    'marketplace.packages'?: string[];
  };

  importHandlers?: {
    sourceTypes?: Array<'unity' | 'unreal' | 'godot' | 'raw' | 'vyb' | 'unknown'>;
    notes?: string[];
  };

  assetProcessors?: {
    types?: string[];
    notes?: string[];
  };
}

export interface PluginValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const REQUIRED_FIELDS = ['schemaVersion', 'pluginId', 'name', 'version', 'author', 'entrypoint', 'permissions'] as const;

export function validatePluginManifest(manifest: unknown): PluginValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, errors: ['Plugin manifest must be an object'], warnings };
  }

  const m = manifest as Record<string, unknown>;

  for (const field of REQUIRED_FIELDS) {
    if (!(field in m)) errors.push(`Missing required field: ${field}`);
  }

  if (typeof m.schemaVersion !== 'string') errors.push('schemaVersion must be a string');
  if (typeof m.pluginId !== 'string') errors.push('pluginId must be a string');
  if (typeof m.name !== 'string') errors.push('name must be a string');
  if (typeof m.version !== 'string') errors.push('version must be a string');
  if (typeof m.author !== 'string') errors.push('author must be a string');

  if (!Array.isArray(m.permissions)) errors.push('permissions must be an array');
  if (Array.isArray(m.permissions) && m.permissions.some((p) => typeof p !== 'string')) errors.push('permissions must be strings');

  // Honest warnings.
  if (!('extensionPoints' in m)) {
    warnings.push('No extensionPoints declared. The plugin may be editor-only.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

