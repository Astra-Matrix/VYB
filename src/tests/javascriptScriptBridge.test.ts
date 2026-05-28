import { describe, expect, it } from 'vitest';
import { JavaScriptScriptBridge } from '../engine/scripting/bridges/JavaScriptScriptBridge';
import { ScriptContext } from '../engine/scripting/ScriptContext';
import { createSampleScene } from '../engine/scene';

describe('JavaScriptScriptBridge', () => {
  it('runs onUpdate and mutates transform', async () => {
    const { scene, cubeEntityId } = createSampleScene();
    scene.world.addComponent(cubeEntityId, 'script', {
      language: 'javascript',
      entry: 'scripts/test.js',
      parameters: {},
    });

    const source = `
      export function onUpdate(ctx) {
        ctx.rotateY(90 * ctx.dt);
      }
    `;

    const bridge = new JavaScriptScriptBridge();
    await bridge.load(cubeEntityId, { language: 'javascript', entry: 'scripts/test.js', parameters: {} }, source);

    const ctx = new ScriptContext(cubeEntityId, 'Cube', scene, { dt: 1, tick: 1, elapsed: 1 }, {}, () => {});
    await bridge.start({ entityId: cubeEntityId, entry: 'scripts/test.js' }, ctx);
    await bridge.update({ entityId: cubeEntityId, entry: 'scripts/test.js' }, ctx);

    expect(scene.world.getTransform(cubeEntityId)?.rotation.yDeg).toBeCloseTo(90, 1);
  });
});
