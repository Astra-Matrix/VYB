import type { ScriptComponent } from '../../components';
import type { ScriptContext } from '../ScriptContext';
import type { ScriptInstanceHandle, ScriptRuntimeBridge } from '../ScriptRuntimeBridge';
import { stripTypeScript } from '../stripTypeScript';
import { JavaScriptScriptBridge } from './JavaScriptScriptBridge';

/**
 * TypeScript scripts are stripped to JS and executed by the JavaScript bridge.
 */
export class TypeScriptScriptBridge implements ScriptRuntimeBridge {
  readonly language = 'typescript' as const;
  private readonly delegate = new JavaScriptScriptBridge();

  canRun(component: ScriptComponent): boolean {
    return component.language === 'typescript';
  }

  async load(entityId: string, component: ScriptComponent, source: string): Promise<void> {
    await this.delegate.load(entityId, { ...component, language: 'javascript' }, stripTypeScript(source));
  }

  start(handle: ScriptInstanceHandle, ctx: ScriptContext): Promise<void> {
    return this.delegate.start(handle, ctx);
  }

  update(handle: ScriptInstanceHandle, ctx: ScriptContext): Promise<void> {
    return this.delegate.update(handle, ctx);
  }

  stop(handle: ScriptInstanceHandle, ctx: ScriptContext): Promise<void> {
    return this.delegate.stop(handle, ctx);
  }

  dispose(entityId: string): void {
    this.delegate.dispose(entityId);
  }
}
