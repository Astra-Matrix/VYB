export interface RuntimeClockOptions {
  fixedDt?: number;
  maxDelta?: number;
}

/**
 * Tracks simulation time with optional fixed-step accumulation.
 */
export class RuntimeClock {
  readonly fixedDt: number;
  private readonly maxDelta: number;
  private elapsed = 0;
  private tick = 0;
  private accumulator = 0;
  private lastNow = 0;

  constructor(options: RuntimeClockOptions = {}) {
    this.fixedDt = options.fixedDt ?? 1 / 60;
    this.maxDelta = options.maxDelta ?? 0.1;
  }

  reset(): void {
    this.elapsed = 0;
    this.tick = 0;
    this.accumulator = 0;
    this.lastNow = 0;
  }

  beginFrame(nowMs: number): number {
    if (this.lastNow === 0) {
      this.lastNow = nowMs;
      return 0;
    }
    const raw = (nowMs - this.lastNow) / 1000;
    this.lastNow = nowMs;
    return Math.min(this.maxDelta, Math.max(0, raw));
  }

  /**
   * Advances fixed steps; returns number of fixed ticks to run this frame.
   */
  accumulate(dt: number): { dt: number; fixedSteps: number } {
    this.elapsed += dt;
    this.accumulator += dt;
    let fixedSteps = 0;
    while (this.accumulator >= this.fixedDt) {
      this.accumulator -= this.fixedDt;
      this.tick++;
      fixedSteps++;
    }
    return { dt, fixedSteps };
  }

  getTick(): number {
    return this.tick;
  }

  getElapsed(): number {
    return this.elapsed;
  }
}
