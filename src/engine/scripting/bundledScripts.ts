import playerTs from '../../../examples/sample-vyb-project/scripts/player.ts?raw';
import logicJs from '../../../examples/sample-vyb-project/scripts/logic.js?raw';
import { ScriptSourceRegistry } from './scriptSourceRegistry';

export function createDefaultScriptRegistry(): ScriptSourceRegistry {
  const registry = new ScriptSourceRegistry();
  registry.registerMany({
    'scripts/player.ts': playerTs,
    'scripts/logic.js': logicJs,
  });
  return registry;
}
