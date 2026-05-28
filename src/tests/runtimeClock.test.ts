import { describe, expect, it } from 'vitest';
import { RuntimeClock } from '../engine/runtime/RuntimeClock';

describe('RuntimeClock', () => {
  it('accumulates fixed steps from delta time', () => {
    const clock = new RuntimeClock({ fixedDt: 0.016 });
    const first = clock.accumulate(0.032);
    expect(first.fixedSteps).toBeGreaterThanOrEqual(1);
    expect(clock.getTick()).toBeGreaterThan(0);
  });
});
