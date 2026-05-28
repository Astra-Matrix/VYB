import { PhysicsWorld } from '../../physics/PhysicsWorld';
import type { RuntimeSystem, RuntimeSystemContext } from '../RuntimeSystem';

export class PhysicsSystem implements RuntimeSystem {
  readonly id = 'physics';
  private readonly world = new PhysicsWorld();
  lastStats = { bodiesSimulated: 0, collisionsResolved: 0 };

  async onTick(ctx: RuntimeSystemContext): Promise<void> {
    this.lastStats = this.world.step(ctx.scene, ctx.tick.dt);
  }
}
