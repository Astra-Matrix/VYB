import type { VybScene } from '../scene';
import type { AnimationClip, EntityAnimationState } from './AnimationTypes';

export class AnimationDirector {
  private readonly clips = new Map<string, AnimationClip>();
  private readonly states = new Map<string, EntityAnimationState>();

  registerClip(clip: AnimationClip): void {
    this.clips.set(clip.id, clip);
  }

  play(entityId: string, clipId: string, speed = 1): void {
    this.states.set(entityId, { entityId, clipId, time: 0, playing: true, speed });
  }

  stop(entityId: string): void {
    const s = this.states.get(entityId);
    if (s) s.playing = false;
  }

  step(scene: VybScene, dt: number): number {
    let updated = 0;
    for (const state of this.states.values()) {
      if (!state.playing) continue;
      const clip = this.clips.get(state.clipId);
      if (!clip) continue;

      state.time += dt * state.speed;
      if (clip.loop && clip.durationSeconds > 0) {
        state.time %= clip.durationSeconds;
      } else if (state.time >= clip.durationSeconds) {
        state.time = clip.durationSeconds;
        state.playing = false;
      }

      const transform = scene.world.getTransform(state.entityId);
      if (transform) {
        const wobble = Math.sin(state.time * 4) * 0.05;
        scene.world.updateComponent(state.entityId, 'transform', {
          ...transform,
          rotation: { ...transform.rotation, yDeg: transform.rotation.yDeg + wobble * dt * 60 },
        });
        updated++;
      }
    }
    return updated;
  }

  getActiveCount(): number {
    return [...this.states.values()].filter((s) => s.playing).length;
  }
}
