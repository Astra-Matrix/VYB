import { describe, expect, it } from 'vitest';
import { SceneRuntime } from '../engine/runtime/SceneRuntime';
import { ScriptSourceRegistry } from '../engine/scripting/scriptSourceRegistry';
import { createSampleScene } from '../engine/scene';

describe('SceneRuntime', () => {
  it('plays and ticks script systems', async () => {
    const { scene, cubeEntityId } = createSampleScene();
    scene.world.addComponent(cubeEntityId, 'script', {
      language: 'javascript',
      entry: 'scripts/player.js',
      parameters: {},
    });
    expect(scene.world.getEntitiesWithComponent('script')).toContain(cubeEntityId);

    const registry = new ScriptSourceRegistry();
    registry.register(
      'scripts/player.js',
      `export function onUpdate(ctx) { ctx.rotateY(120 * ctx.dt); }`,
    );

    const runtime = new SceneRuntime(scene, registry);
    await runtime.play();
    expect(runtime.getStats().scriptsActive).toBe(1);
    await runtime.tickFrame(0.2);
    await runtime.tickFrame(0.2);
    expect(Math.abs(scene.world.getTransform(cubeEntityId)!.rotation.yDeg)).toBeGreaterThan(0.01);
    await runtime.stop();
    expect(runtime.getPlayback()).toBe('stopped');
  });
});
