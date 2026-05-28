import { SceneRuntime, type SceneRuntimeHooks } from '../../engine/runtime/SceneRuntime';
import type { RuntimeStats } from '../../engine/runtime/types';
import { createDefaultScriptRegistry } from '../../engine/scripting/bundledScripts';
import type { ScriptSourceRegistry } from '../../engine/scripting/scriptSourceRegistry';
import type { VybScene } from '../../engine/scene';
import type { SceneRuntimeOptions } from '../../engine/runtime/SceneRuntime';

let activeRuntime: SceneRuntime | null = null;
let runtimeOptions: SceneRuntimeOptions = {};
let scriptRegistry: ScriptSourceRegistry = createDefaultScriptRegistry();

export function getScriptRegistry(): ScriptSourceRegistry {
  return scriptRegistry;
}

export function resetScriptRegistry(): void {
  scriptRegistry = createDefaultScriptRegistry();
}

export function setRuntimeGraphOptions(options: SceneRuntimeOptions): void {
  runtimeOptions = options;
  if (activeRuntime) {
    void activeRuntime.stop();
    activeRuntime = null;
  }
}

export function bindSceneRuntime(
  scene: VybScene,
  hooks: SceneRuntimeHooks,
  options?: SceneRuntimeOptions,
): SceneRuntime {
  if (options) runtimeOptions = options;
  if (activeRuntime && activeRuntime.scene !== scene) {
    void activeRuntime.stop();
    activeRuntime = null;
  }
  if (!activeRuntime) {
    activeRuntime = new SceneRuntime(scene, scriptRegistry, hooks, runtimeOptions);
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
