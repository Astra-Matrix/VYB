export interface AnimationClip {
  id: string;
  name: string;
  durationSeconds: number;
  loop: boolean;
}

export interface EntityAnimationState {
  entityId: string;
  clipId: string;
  time: number;
  playing: boolean;
  speed: number;
}
