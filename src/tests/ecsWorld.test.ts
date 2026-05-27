import { describe, expect, it } from 'vitest';
import { EcsWorld } from '../engine/ecs';

describe('EcsWorld editor operations', () => {
  it('renames and removes entities', () => {
    const world = new EcsWorld();
    const id = world.createEntity('Test');
    world.addComponent(id, 'transform', {
      position: { x: 0, y: 0, z: 0 },
      rotation: { xDeg: 0, yDeg: 0, zDeg: 0 },
      scale: { x: 1, y: 1, z: 1 },
    });

    world.renameEntity(id, 'Renamed');
    expect(world.getEntity(id)?.name).toBe('Renamed');

    world.removeEntity(id);
    expect(world.getEntity(id)).toBeUndefined();
    expect(world.getTransform(id)).toBeUndefined();
  });
});
