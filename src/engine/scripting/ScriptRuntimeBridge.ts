import type { ScriptComponent } from '../components';
import type { ScriptContext } from './ScriptContext';

export interface ScriptInstanceHandle {
  entityId: string;
  entry: string;
}

export interface ScriptRuntimeBridge {
  readonly language: ScriptComponent['language'];
  canRun(component: ScriptComponent): boolean;
  load(entityId: string, component: ScriptComponent, source: string): Promise<void>;
  start(handle: ScriptInstanceHandle, ctx: ScriptContext): Promise<void>;
  update(handle: ScriptInstanceHandle, ctx: ScriptContext): Promise<void>;
  stop(handle: ScriptInstanceHandle, ctx: ScriptContext): Promise<void>;
  dispose(entityId: string): void;
}
