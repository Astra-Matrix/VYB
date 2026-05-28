import { describe, expect, it } from 'vitest';
import { stripTypeScript } from '../engine/scripting/stripTypeScript';
import { JavaScriptScriptBridge } from '../engine/scripting/bridges/JavaScriptScriptBridge';
import { ScriptContext } from '../engine/scripting/ScriptContext';
import { createSampleScene } from '../engine/scene';
import playerSource from '../../examples/sample-vyb-project/scripts/player.ts?raw';

describe('stripTypeScript', () => {
  it('strips inline object parameter types from player.ts', () => {
    const stripped = stripTypeScript(playerSource);
    expect(stripped).not.toMatch(/:\s*\{/);
    expect(stripped).toContain('export class PlayerController');
  });

  it('compiles stripped player.ts and runs onUpdate', async () => {
    const { scene, cubeEntityId } = createSampleScene();
    const stripped = stripTypeScript(playerSource);

    const bridge = new JavaScriptScriptBridge();
    await bridge.load(
      cubeEntityId,
      { language: 'javascript', entry: 'scripts/player.ts', parameters: { speed: 90 } },
      stripped,
    );

    const ctx = new ScriptContext(cubeEntityId, 'Cube', scene, { dt: 0.05, tick: 1, elapsed: 0 }, { speed: 90 }, () => {});
    await bridge.start({ entityId: cubeEntityId, entry: 'scripts/player.ts' }, ctx);
    await bridge.update({ entityId: cubeEntityId, entry: 'scripts/player.ts' }, ctx);

    expect(scene.world.getTransform(cubeEntityId)!.rotation.yDeg).not.toBe(0);
  });
});
