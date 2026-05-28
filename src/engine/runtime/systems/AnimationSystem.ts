import { AnimationDirector } from '../../animation/AnimationDirector';
import type { RuntimeSystem, RuntimeSystemContext } from '../RuntimeSystem';

export class AnimationSystem implements RuntimeSystem {
  readonly id = 'animation';
  readonly director = new AnimationDirector();
  activeClips = 0;

  constructor() {
    this.director.registerClip({
      id: 'clip:idle-wobble',
      name: 'Idle Wobble',
      durationSeconds: 2,
      loop: true,
    });
  }

  async onStart(ctx: RuntimeSystemContext): Promise<void> {
    for (const entityId of ctx.scene.world.getEntitiesWithComponent('meshRenderer')) {
      this.director.play(entityId, 'clip:idle-wobble', 1);
    }
  }

  async onTick(ctx: RuntimeSystemContext): Promise<void> {
    this.activeClips = this.director.step(ctx.scene, ctx.tick.dt);
  }

  async onStop(): Promise<void> {
    this.activeClips = 0;
  }
}
