import { describe, expect, it } from 'vitest';
import { createSampleScene, sceneFromJson, sceneToJson } from '../engine/scene';

describe('sceneSerializer', () => {
  it('round-trips a sample scene through JSON', () => {
    const { scene, cubeEntityId } = createSampleScene();
    const json = sceneToJson(scene);
    const loaded = sceneFromJson(json);

    expect(loaded.metadata.name).toBe(scene.metadata.name);
    expect(loaded.world.getEntity(cubeEntityId)?.name).toBe('Cube');
    expect(loaded.world.getComponent(cubeEntityId, 'meshRenderer')).toBeTruthy();
  });
});
