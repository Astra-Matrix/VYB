import type { ScriptComponent } from '../../components';
import type { ScriptContext } from '../ScriptContext';
import type { ScriptInstanceHandle, ScriptRuntimeBridge } from '../ScriptRuntimeBridge';

type ScriptCallable = {
  onStart?: (ctx: ScriptContext) => void;
  onUpdate?: (ctx: ScriptContext) => void;
  update?: (ctx: ScriptContext) => void;
  onStop?: (ctx: ScriptContext) => void;
};

interface LoadedScript {
  handle: ScriptInstanceHandle;
  callable: ScriptCallable;
}

function compileScriptModule(source: string): Record<string, unknown> {
  const body = source
    .replace(/^\s*export\s+function\s+(\w+)/gm, 'exports.$1 = function')
    .replace(/^\s*export\s+class\s+(\w+)/gm, 'exports.$1 = class $1')
    .replace(/^\s*export\s+default\s+/gm, 'exports.default = ')
    .replace(/^\s*export\s+/gm, '');
  const module = { exports: {} as Record<string, unknown> };
  const fn = new Function('module', 'exports', `"use strict";\n${body}\nreturn module.exports;`);
  const result = fn(module, module.exports) as Record<string, unknown> | undefined;
  return result ?? module.exports;
}

function resolveCallable(exports: Record<string, unknown>): ScriptCallable {
  if (
    typeof exports.onStart === 'function' ||
    typeof exports.onUpdate === 'function' ||
    typeof exports.update === 'function' ||
    typeof exports.onStop === 'function'
  ) {
    return {
      onStart: exports.onStart as ((ctx: ScriptContext) => void) | undefined,
      onUpdate: exports.onUpdate as ((ctx: ScriptContext) => void) | undefined,
      update: exports.update as ((ctx: ScriptContext) => void) | undefined,
      onStop: exports.onStop as ((ctx: ScriptContext) => void) | undefined,
    };
  }

  const candidate = exports.default ?? exports.PlayerController;
  if (typeof candidate === 'function') {
    return new (candidate as new () => ScriptCallable)();
  }
  if (candidate && typeof candidate === 'object') {
    return candidate as ScriptCallable;
  }

  return {};
}

export class JavaScriptScriptBridge implements ScriptRuntimeBridge {
  readonly language = 'javascript' as const;
  private readonly loaded = new Map<string, LoadedScript>();

  canRun(component: ScriptComponent): boolean {
    return component.language === 'javascript';
  }

  async load(entityId: string, component: ScriptComponent, source: string): Promise<void> {
    const exports = compileScriptModule(source);
    const callable = resolveCallable(exports);
    const handle: ScriptInstanceHandle = { entityId, entry: component.entry };
    this.loaded.set(entityId, { handle, callable });
  }

  async start(handle: ScriptInstanceHandle, ctx: ScriptContext): Promise<void> {
    const script = this.loaded.get(handle.entityId)?.callable;
    script?.onStart?.(ctx);
  }

  async update(handle: ScriptInstanceHandle, ctx: ScriptContext): Promise<void> {
    const script = this.loaded.get(handle.entityId)?.callable;
    if (script?.onUpdate) script.onUpdate(ctx);
    else if (script?.update) script.update(ctx);
  }

  async stop(handle: ScriptInstanceHandle, ctx: ScriptContext): Promise<void> {
    const script = this.loaded.get(handle.entityId)?.callable;
    script?.onStop?.(ctx);
  }

  dispose(entityId: string): void {
    this.loaded.delete(entityId);
  }
}
