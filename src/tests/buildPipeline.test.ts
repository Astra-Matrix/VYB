import { describe, expect, it } from 'vitest';
import { createBuildManifest } from '../engine/build/BuildManifest';
import { BuildPipeline, resolveDefaultBuildOutput } from '../engine/build/BuildPipeline';
import type { BuildFileOps } from '../engine/build/BuildFileOps';

describe('BuildPipeline', () => {
  it('resolves default output under project builds folder', () => {
    const path = resolveDefaultBuildOutput('/proj', 'web', 'release');
    expect(path).toBe('/proj/builds/web/release');
  });

  it('creates manifest with target capabilities', () => {
    const manifest = createBuildManifest(
      {
        projectRoot: '/proj',
        projectName: 'Test',
        projectVersion: '1.0.0',
        target: 'web',
        configuration: 'debug',
        outputRoot: '/proj/builds/web/debug',
        defaultScene: 'scenes/main.vybscene',
        scenes: ['scenes/main.vybscene'],
      },
      ['project/scenes/main.vybscene'],
    );
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.target).toBe('web');
    expect(manifest.capabilities.gpu).toBe(true);
    expect(manifest.stagedFiles).toContain('project/scenes/main.vybscene');
  });

  it('runs preview build without filesystem ops', async () => {
    const ops: BuildFileOps = {
      listProjectFiles: async () => ['scenes/main.vybscene', '.vyb/project.vyb.json'],
      readProjectText: async () => '{}',
      writeBuildText: async () => {
        throw new Error('should not write in preview');
      },
      copyToBuild: async () => {
        throw new Error('should not copy in preview');
      },
    };

    const pipeline = new BuildPipeline(ops);
    const result = await pipeline.run({
      projectRoot: '/proj',
      projectName: 'Preview',
      projectVersion: '0.1.0',
      target: 'windows-desktop',
      configuration: 'debug',
      outputRoot: '/proj/builds/windows-desktop/debug',
      previewOnly: true,
      knownProjectFiles: ['scenes/main.vybscene'],
    });

    expect(result.success).toBe(true);
    expect(result.manifestJson).toBeTruthy();
    expect(result.filesStaged).toBeGreaterThan(0);
  });
});
