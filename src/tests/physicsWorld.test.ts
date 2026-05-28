import { describe, expect, it } from 'vitest';
import { PhysicsWorld } from '../engine/physics/PhysicsWorld';
import { createSampleScene } from '../engine/scene';

describe('PhysicsWorld', () => {
  it('applies gravity and resolves ground collision', () => {
    const { scene, cubeEntityId } = createSampleScene();
    const world = new PhysicsWorld();
    const startY = scene.world.getTransform(cubeEntityId)!.position.y;

    for (let i = 0; i < 30; i++) {
      world.step(scene, 1 / 60);
    }

    const endY = scene.world.getTransform(cubeEntityId)!.position.y;
    expect(endY).toBeLessThan(startY);
    expect(endY).toBeGreaterThanOrEqual(0.4);
  });
});
