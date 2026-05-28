import type { VybScene } from '../../scene';
import { ScriptContext } from '../../scripting/ScriptContext';
import { ScriptRuntimeHost } from '../../scripting/ScriptRuntimeHost';
import type { ScriptSourceRegistry } from '../../scripting/scriptSourceRegistry';
import type { RuntimeSystem, RuntimeSystemContext } from '../RuntimeSystem';

export class ScriptSystem implements RuntimeSystem {
  readonly id = 'script';
  private readonly host: ScriptRuntimeHost;

  constructor(registry: ScriptSourceRegistry) {
    this.host = new ScriptRuntimeHost(registry);
  }

  get scriptsActive(): number {
    return this.host.activeCount;
  }

  async onStart(ctx: RuntimeSystemContext): Promise<void> {
    const entities = ctx.scene.world.getEntitiesWithComponent('script');
    for (const entityId of entities) {
      const component = ctx.scene.world.getComponent(entityId, 'script');
      const entity = ctx.scene.world.getEntity(entityId);
      if (!component || !entity) continue;
      try {
        await this.host.attach(entityId, component);
        const scriptCtx = this.createContext(ctx.scene, entityId, entity.name, component.parameters, ctx);
        await this.host.start(scriptCtx);
      } catch (e) {
        ctx.log('error', `Script load failed (${entity.name}): ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }

  async onTick(ctx: RuntimeSystemContext): Promise<void> {
    const entities = ctx.scene.world.getEntitiesWithComponent('script');
    for (const entityId of entities) {
      const component = ctx.scene.world.getComponent(entityId, 'script');
      const entity = ctx.scene.world.getEntity(entityId);
      if (!component || !entity) continue;
      const scriptCtx = this.createContext(ctx.scene, entityId, entity.name, component.parameters, ctx);
      try {
        await this.host.update(scriptCtx);
      } catch (e) {
        ctx.log('error', `Script tick failed (${entity.name}): ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }

  async onStop(ctx: RuntimeSystemContext): Promise<void> {
    const entities = ctx.scene.world.getEntitiesWithComponent('script');
    for (const entityId of entities) {
      const entity = ctx.scene.world.getEntity(entityId);
      const component = ctx.scene.world.getComponent(entityId, 'script');
      if (!entity || !component) continue;
      const scriptCtx = this.createContext(ctx.scene, entityId, entity.name, component.parameters, ctx);
      await this.host.stop(scriptCtx);
    }
    this.host.disposeAll();
  }

  private createContext(
    scene: VybScene,
    entityId: string,
    entityName: string,
    parameters: Record<string, unknown> | undefined,
    ctx: RuntimeSystemContext,
  ): ScriptContext {
    return new ScriptContext(
      entityId,
      entityName,
      scene,
      { dt: ctx.tick.dt, tick: ctx.tick.tick, elapsed: ctx.tick.elapsed },
      parameters,
      (message) => ctx.log('info', message),
    );
  }
}
