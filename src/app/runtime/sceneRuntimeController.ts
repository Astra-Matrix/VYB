import { SceneRuntime, type SceneRuntimeHooks } from '../../engine/runtime/SceneRuntime';
import type { RuntimeStats } from '../../engine/runtime/types';
import { createDefaultScriptRegistry } from '../../engine/scripting/bundledScripts';
import type { ScriptSourceRegistry } from '../../engine/scripting/scriptSourceRegistry';
import type { VybScene } from '../../engine/scene';

let activeRuntime: SceneRuntime | null = null;
let scriptRegistry: ScriptSourceRegistry = createDefaultScriptRegistry();

export function getScriptRegistry(): ScriptSourceRegistry {
  return scriptRegistry;
}

export function resetScriptRegistry(): void {
  scriptRegistry = createDefaultScriptRegistry();
}

export function bindSceneRuntime(
  scene: VybScene,
  hooks: SceneRuntimeHooks,
): SceneRuntime {
  if (activeRuntime && activeRuntime.scene !== scene) {
    void activeRuntime.stop();
    activeRuntime = null;
  }
  if (!activeRuntime) {
    activeRuntime = new SceneRuntime(scene, scriptRegistry, hooks);
  }
  return activeRuntime;
}

export function getSceneRuntime(): SceneRuntime | null {
  return activeRuntime;
}

export async function stopSceneRuntime(): Promise<void> {
  if (!activeRuntime) return;
  await activeRuntime.stop();
  activeRuntime = null;
}

export function readRuntimeStats(): RuntimeStats | null {
  return activeRuntime?.getStats() ?? null;
}
