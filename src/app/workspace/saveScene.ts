import { sceneToJson } from '../../engine/scene';
import { isTauri } from '../platform/isTauri';
import { saveSceneFile } from '../commands/tauriCommands';
import type { VybScene } from '../../engine/scene';

function joinPath(root: string, rel: string): string {
  const sep = root.includes('\\') ? '\\' : '/';
  const normalized = rel.replace(/\//g, sep);
  if (root.endsWith(sep)) return `${root}${normalized}`;
  return `${root}${sep}${normalized}`;
}

export async function saveActiveScene(rootPath: string, relativeScenePath: string, scene: VybScene): Promise<void> {
  const json = sceneToJson(scene, true);
  if (!isTauri()) {
    // Web/dev: no filesystem write; log only.
    console.info('[VYB] Scene save (web dev mode):', { relativeScenePath, bytes: json.length });
    return;
  }
  const scenePath = joinPath(rootPath, relativeScenePath);
  await saveSceneFile(scenePath, json);
}
