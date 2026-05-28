import type { VybScene } from '../scene';
import type { RuntimeTickInfo } from './types';

export interface RuntimeSystemContext {
  scene: VybScene;
  tick: RuntimeTickInfo;
  log: (level: 'info' | 'warn' | 'error', message: string) => void;
}

export interface RuntimeSystem {
  readonly id: string;
  onStart?(ctx: RuntimeSystemContext): void | Promise<void>;
  onTick(ctx: RuntimeSystemContext): void | Promise<void>;
  onStop?(ctx: RuntimeSystemContext): void | Promise<void>;
}
