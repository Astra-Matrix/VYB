import { describe, expect, it } from 'vitest';
import godotMainTscn from '../../examples/godot-import-sample/scenes/main.tscn?raw';
import { parseGodotTscn } from '../engine/import/translators/godotTscnParser';
import { GodotSceneTranslator } from '../engine/import/translators/GodotSceneTranslator';
import { MaterialTranslator } from '../engine/import/material/MaterialTranslator';
import { ImportPipeline } from '../engine/import/ImportPipeline';
import { createImportFileOps } from '../engine/import/ImportFileOps';
import { BUNDLED_GODOT_IMPORT_ROOT, BUNDLED_IMPORT_FILES } from '../engine/import/bundledImportSources';

describe('Godot import', () => {
  it('parses main.tscn nodes', () => {
    const nodes = parseGodotTscn(godotMainTscn);
    expect(nodes.some((n) => n.type === 'Camera3D')).toBe(true);
    expect(nodes.some((n) => n.type === 'MeshInstance3D')).toBe(true);
  });

  it('translates tscn to vybscene entities', () => {
    const translator = new GodotSceneTranslator();
    const result = translator.translate('scenes/main.tscn', godotMainTscn);
    expect(result.scene.world.getAllEntities().length).toBeGreaterThanOrEqual(4);
    expect(result.scene.activeCameraEntityId).toBeTruthy();
    const meshes = result.scene.world.getEntitiesWithComponent('meshRenderer');
    expect(meshes.length).toBeGreaterThan(0);
  });

  it('creates vybmat from material translator', () => {
    const mat = new MaterialTranslator().translate({
      name: 'Test',
      sourceEngine: 'godot',
      sourcePath: 'res://materials/test.tres',
    });
    expect(mat.targetRelativePath).toContain('.vybmat');
    expect(mat.material.shader).toContain('vyb-default-lit');
  });

  it('previews godot import pipeline from bundled sample', async () => {
    const pipeline = new ImportPipeline(createImportFileOps(BUNDLED_IMPORT_FILES));
    const result = await pipeline.preview({
      type: 'godot',
      confidence: 0.95,
      rootPath: BUNDLED_GODOT_IMPORT_ROOT,
      markers: ['project.godot'],
    });
    expect(result.previewSceneJson).toBeTruthy();
    expect(result.scenesWritten[0]).toContain('.vybscene');
  });
});
