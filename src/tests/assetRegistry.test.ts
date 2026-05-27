import { describe, expect, it } from 'vitest';
import { AssetRegistry } from '../engine/assets/AssetRegistry';

describe('AssetRegistry', () => {
  it('indexes known file extensions into typed asset metadata', () => {
    const registry = new AssetRegistry();
    const index = registry.scanFiles(
      [
        'assets/mesh/unit-cube.glb',
        'assets/texture/diffuse.png',
        'assets/audio/placeholder.wav',
        'scripts/player.ts',
      ],
      { knownExtensionsOnly: true },
    );

    expect(index.assets.length).toBe(4);
    expect(index.assets.find((a) => a.extension === '.glb')?.type).toBe('mesh');
    expect(index.assets.find((a) => a.extension === '.png')?.type).toBe('texture');
    expect(index.assets.find((a) => a.extension === '.wav')?.type).toBe('audio');
    expect(index.assets.find((a) => a.extension === '.ts')?.type).toBe('script');
  });

  it('filters unknown extensions when knownExtensionsOnly is enabled', () => {
    const registry = new AssetRegistry();
    const index = registry.scanFiles(['assets/unknown.foo'], { knownExtensionsOnly: true });
    expect(index.assets.length).toBe(0);
  });
});

