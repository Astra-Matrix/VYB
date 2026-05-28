export type RuntimePlaybackState = 'stopped' | 'playing' | 'paused';

export interface RuntimeTickInfo {
  tick: number;
  dt: number;
  elapsed: number;
  fixedDt: number;
}

export interface RuntimeStats {
  playback: RuntimePlaybackState;
  tick: number;
  dt: number;
  elapsed: number;
  scriptsActive: number;
  systemsRan: number;
  physicsBodies?: number;
  animationClips?: number;
  audioSources?: number;
  uiWidgets?: number;
  networkPeers?: number;
  lastError?: string;
}
