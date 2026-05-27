import { describe, expect, it } from 'vitest';
import { createSampleScene } from '../engine/scene/VybScene';

describe('Scene/ECS model', () => {
  it('creates a sample scene with expected typed components', () => {
    const { scene, cameraEntityId, cubeEntityId, planeEntityId, audioEntityId } = createSampleScene();

    const camera = scene.world.getComponent(cameraEntityId, 'camera');
    expect(camera).toBeTruthy();

    const cubeMesh = scene.world.getComponent(cubeEntityId, 'meshRenderer');
    expect(cubeMesh).toBeTruthy();

    const planeMesh = scene.world.getComponent(planeEntityId, 'meshRenderer');
    expect(planeMesh).toBeTruthy();

    const audio = scene.world.getComponent(audioEntityId, 'audioSource');
    expect(audio).toBeTruthy();
  });
});

