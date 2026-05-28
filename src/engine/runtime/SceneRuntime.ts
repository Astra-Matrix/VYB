import type { VybScene } from '../scene';
import type { ScriptSourceRegistry } from '../scripting/scriptSourceRegistry';
import { RuntimeClock } from './RuntimeClock';
import type { RuntimeSystem, RuntimeSystemContext } from './RuntimeSystem';
import { ScriptSystem } from './systems/ScriptSystem';
import type { RuntimePlaybackState, RuntimeStats, RuntimeTickInfo } from './types';

export interface SceneRuntimeHooks {
  onSceneMutated?: () => void;
  onLog?: (level: 'info' | 'warn' | 'error', message: string) => void;
  onStats?: (stats: RuntimeStats) => void;
}

export class SceneRuntime {
  private readonly clock = new RuntimeClock();
  private readonly systems: RuntimeSystem[];
  private readonly scriptSystem: ScriptSystem;
  private playback: RuntimePlaybackState = 'stopped';
  private lastError?: string;
  private systemsRan = 0;

  constructor(
    readonly scene: VybScene,
    registry: ScriptSourceRegistry,
    private readonly hooks: SceneRuntimeHooks = {},
  ) {
    this.scriptSystem = new ScriptSystem(registry);
    this.systems = [this.scriptSystem];
  }

  getPlayback(): RuntimePlaybackState {
    return this.playback;
  }

  getStats(): RuntimeStats {
    return {
      playback: this.playback,
      tick: this.clock.getTick(),
      dt: 0,
      elapsed: this.clock.getElapsed(),
      scriptsActive: this.scriptSystem.scriptsActive,
      systemsRan: this.systemsRan,
      lastError: this.lastError,
    };
  }

  async play(): Promise<void> {
    if (this.playback === 'playing') return;
    if (this.playback === 'paused') {
      this.resume();
      return;
    }
    this.lastError = undefined;
    this.clock.reset();
    await this.runLifecycle('onStart');
    this.playback = 'playing';
    this.emitStats();
  }

  pause(): void {
    if (this.playback !== 'playing') return;
    this.playback = 'paused';
    this.emitStats();
  }

  resume(): void {
    if (this.playback !== 'paused') return;
    this.playback = 'playing';
    this.clock.reset();
    this.emitStats();
  }

  async stop(): Promise<void> {
    if (this.playback === 'stopped') return;
    await this.runLifecycle('onStop');
    this.playback = 'stopped';
    this.clock.reset();
    this.emitStats();
  }

  /**
   * Advance simulation by real-time delta (seconds).
   */
  async tickFrame(dt: number): Promise<void> {
    if (this.playback !== 'playing') return;

    const { fixedSteps } = this.clock.accumulate(dt);
    if (fixedSteps === 0) return;

    for (let i = 0; i < fixedSteps; i++) {
      await this.runTick(this.clock.fixedDt);
    }
    this.hooks.onSceneMutated?.();
    this.emitStats();
  }

  /**
   * Manual step when paused (editor scrub).
   */
  async stepOnce(): Promise<void> {
    if (this.playback !== 'paused') return;
    await this.runTick(this.clock.fixedDt);
    this.hooks.onSceneMutated?.();
    this.emitStats();
  }

  private async runTick(dt: number): Promise<void> {
    const tickInfo: RuntimeTickInfo = {
      tick: this.clock.getTick(),
      dt,
      elapsed: this.clock.getElapsed(),
      fixedDt: this.clock.fixedDt,
    };
    const ctx: RuntimeSystemContext = {
      scene: this.scene,
      tick: tickInfo,
      log: (level, message) => {
        if (level === 'error') this.lastError = message;
        this.hooks.onLog?.(level, message);
      },
    };

    this.systemsRan = 0;
    for (const system of this.systems) {
      try {
        await system.onTick.call(system, ctx);
        this.systemsRan++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        this.lastError = msg;
        ctx.log('error', `${system.id}: ${msg}`);
      }
    }
  }

  private async runLifecycle(phase: 'onStart' | 'onStop'): Promise<void> {
    const ctx: RuntimeSystemContext = {
      scene: this.scene,
      tick: { tick: 0, dt: 0, elapsed: 0, fixedDt: this.clock.fixedDt },
      log: (level, message) => {
        if (level === 'error') this.lastError = message;
        this.hooks.onLog?.(level, message);
      },
    };

    for (const system of this.systems) {
      const fn = system[phase];
      if (!fn) continue;
      try {
        await fn.call(system, ctx);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        this.lastError = msg;
        ctx.log('error', `${system.id}.${phase}: ${msg}`);
      }
    }
  }

  private emitStats(): void {
    this.hooks.onStats?.(this.getStats());
  }
}
