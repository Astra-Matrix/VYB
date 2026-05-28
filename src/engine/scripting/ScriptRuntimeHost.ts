import type { ScriptComponent } from '../components';
import type { EntityId } from '../ecs';
import type { ScriptContext } from './ScriptContext';
import type { ScriptInstanceHandle, ScriptRuntimeBridge } from './ScriptRuntimeBridge';
import { JavaScriptScriptBridge } from './bridges/JavaScriptScriptBridge';
import { StubScriptBridge } from './bridges/StubScriptBridge';
import { TypeScriptScriptBridge } from './bridges/TypeScriptScriptBridge';
import { normalizeEntry, type ScriptSourceRegistry } from './scriptSourceRegistry';

export class ScriptRuntimeHost {
  private readonly bridges: ScriptRuntimeBridge[];
  private readonly handles = new Map<EntityId, { bridge: ScriptRuntimeBridge; handle: ScriptInstanceHandle }>();

  constructor(private readonly registry: ScriptSourceRegistry) {
    this.bridges = [
      new TypeScriptScriptBridge(),
      new JavaScriptScriptBridge(),
      new StubScriptBridge('lua'),
      new StubScriptBridge('rust'),
      new StubScriptBridge('wasm'),
    ];
  }

  get activeCount(): number {
    return this.handles.size;
  }

  private pickBridge(component: ScriptComponent): ScriptRuntimeBridge | undefined {
    return this.bridges.find((b) => b.canRun(component));
  }

  async attach(entityId: EntityId, component: ScriptComponent): Promise<void> {
    const bridge = this.pickBridge(component);
    if (!bridge) throw new Error(`No script bridge for language: ${component.language}`);

    const source = this.registry.get(component.entry);
    if (!source) throw new Error(`Script source not found: ${component.entry}`);

    await bridge.load(entityId, component, source);
    this.handles.set(entityId, {
      bridge,
      handle: { entityId, entry: normalizeEntry(component.entry) },
    });
  }

  async start(ctx: ScriptContext): Promise<void> {
    const entry = this.handles.get(ctx.entityId);
    if (!entry) return;
    await entry.bridge.start(entry.handle, ctx);
  }

  async update(ctx: ScriptContext): Promise<void> {
    const entry = this.handles.get(ctx.entityId);
    if (!entry) return;
    await entry.bridge.update(entry.handle, ctx);
  }

  async stop(ctx: ScriptContext): Promise<void> {
    const entry = this.handles.get(ctx.entityId);
    if (!entry) return;
    await entry.bridge.stop(entry.handle, ctx);
  }

  disposeAll(): void {
    for (const [entityId, entry] of this.handles) {
      entry.bridge.dispose(entityId);
    }
    this.handles.clear();
  }
}
