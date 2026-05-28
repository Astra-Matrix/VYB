import type { ScriptComponent } from '../../components';
import type { ScriptContext } from '../ScriptContext';
import type { ScriptInstanceHandle, ScriptRuntimeBridge } from '../ScriptRuntimeBridge';

export class StubScriptBridge implements ScriptRuntimeBridge {
  private warned = new Set<string>();

  constructor(readonly language: ScriptComponent['language']) {}

  canRun(component: ScriptComponent): boolean {
    return component.language === this.language;
  }

  async load(entityId: string, component: ScriptComponent, _source: string): Promise<void> {
    if (!this.warned.has(entityId)) {
      this.warned.add(entityId);
      throw new Error(`${this.language} runtime is not available yet (${component.entry}).`);
    }
  }

  async start(_handle: ScriptInstanceHandle, ctx: ScriptContext): Promise<void> {
    ctx.log(`${this.language} bridge: start skipped (stub).`);
  }

  async update(): Promise<void> {}

  async stop(): Promise<void> {}

  dispose(entityId: string): void {
    this.warned.delete(entityId);
  }
}
