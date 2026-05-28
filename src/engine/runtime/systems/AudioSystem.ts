import { AudioEngine } from '../../audio/AudioEngine';
import type { RuntimeSystem, RuntimeSystemContext } from '../RuntimeSystem';

export class AudioSystem implements RuntimeSystem {
  readonly id = 'audio';
  readonly engine = new AudioEngine();
  lastStats = { activeSources: 0, queuedPlays: 0 };

  async onStart(ctx: RuntimeSystemContext): Promise<void> {
    for (const entityId of ctx.scene.world.getEntitiesWithComponent('audioSource')) {
      const audio = ctx.scene.world.getComponent(entityId, 'audioSource');
      if (!audio) continue;
      this.engine.enqueue({
        entityId,
        assetId: audio.assetId,
        volume: audio.volume,
        loop: audio.loop,
        spatial: audio.spatial,
      });
      ctx.log('info', `Audio queued: ${audio.assetId} on ${entityId}`);
    }
  }

  async onTick(ctx: RuntimeSystemContext): Promise<void> {
    this.lastStats = this.engine.tick(ctx.tick.dt);
  }

  async onStop(): Promise<void> {
    this.engine.stopAll();
  }
}
