import { describe, expect, it } from 'vitest';
import { validatePluginManifest } from '../engine/plugins/pluginManifest';

describe('Plugin manifest validation', () => {
  it('accepts a valid manifest shape', () => {
    const manifest = {
      schemaVersion: '0.1.0',
      pluginId: 'example-plugin',
      name: 'Example Plugin',
      version: '0.1.0',
      author: 'VYB',
      entrypoint: { editor: 'index.ts' },
      permissions: ['editor.panels', 'editor.commands'],
      extensionPoints: {
        'editor.panels': ['Example Panel'],
      },
    };

    const res = validatePluginManifest(manifest);
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual([]);
  });

  it('rejects missing required fields', () => {
    const manifest = {
      pluginId: 'missing',
    };
    const res = validatePluginManifest(manifest);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
  });
});

