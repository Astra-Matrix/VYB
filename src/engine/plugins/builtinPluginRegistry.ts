import type { PluginManifest } from './pluginManifest';
import { validatePluginManifest } from './pluginManifest';

export interface BuiltinPluginDescriptor {
  manifest: PluginManifest;
  manifestPath: string;
}

/**
 * loadBuiltinPlugins
 * Scans the repository's /plugins folder at build-time using Vite's import.meta.glob.
 *
 * Security note: plugin code itself is not executed yet in this scaffold.
 * We only read and validate plugin manifests.
 */
export function loadBuiltinPlugins(): BuiltinPluginDescriptor[] {
  // The glob path is relative to this file: src/engine/plugins/...
  const modules = import.meta.glob('../../../plugins/**/plugin.vyb.json', {
    eager: true,
    import: 'default',
  }) as Record<string, PluginManifest>;

  const results: BuiltinPluginDescriptor[] = [];

  for (const [manifestPath, manifest] of Object.entries(modules)) {
    const v = validatePluginManifest(manifest);
    if (!v.valid) continue;
    results.push({ manifest, manifestPath });
  }

  results.sort((a, b) => a.manifest.name.localeCompare(b.manifest.name));
  return results;
}

