import type { Vec3 } from '../components';
import type { VybScene } from '../scene';
import type { EntityId } from '../ecs';

export interface ScriptLogFn {
  (message: string): void;
}

/**
 * API surface exposed to gameplay scripts during runtime ticks.
 */
export class ScriptContext {
  readonly dt: number;
  readonly tick: number;
  readonly elapsed: number;
  readonly parameters: Record<string, unknown>;

  constructor(
    readonly entityId: EntityId,
    readonly entityName: string,
    private readonly scene: VybScene,
    timing: { dt: number; tick: number; elapsed: number },
    parameters: Record<string, unknown> | undefined,
    private readonly logFn: ScriptLogFn,
  ) {
    this.dt = timing.dt;
    this.tick = timing.tick;
    this.elapsed = timing.elapsed;
    this.parameters = parameters ?? {};
  }

  log(message: string): void {
    this.logFn(`[${this.entityName}] ${message}`);
  }

  getPosition(): Vec3 {
    const t = this.scene.world.getTransform(this.entityId);
    if (!t) return { x: 0, y: 0, z: 0 };
    return { ...t.position };
  }

  setPosition(position: Partial<Vec3>): void {
    const t = this.scene.world.getTransform(this.entityId);
    if (!t) return;
    this.scene.world.updateComponent(this.entityId, 'transform', {
      ...t,
      position: { ...t.position, ...position },
    });
  }

  getRotationY(): number {
    return this.scene.world.getTransform(this.entityId)?.rotation.yDeg ?? 0;
  }

  setRotationY(yDeg: number): void {
    const t = this.scene.world.getTransform(this.entityId);
    if (!t) return;
    this.scene.world.updateComponent(this.entityId, 'transform', {
      ...t,
      rotation: { ...t.rotation, yDeg },
    });
  }

  rotateY(degrees: number): void {
    this.setRotationY(this.getRotationY() + degrees);
  }
}
