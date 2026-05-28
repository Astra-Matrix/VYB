import { describe, expect, it } from 'vitest';
import { mat4Identity, mat4Multiply, mat4Perspective } from '../engine/renderer/math/mat4';

describe('mat4', () => {
  it('identity multiply preserves matrix', () => {
    const a = mat4Identity();
    const b = mat4Identity();
    const out = mat4Multiply(a, b);
    expect(out[0]).toBe(1);
    expect(out[5]).toBe(1);
    expect(out[10]).toBe(1);
    expect(out[15]).toBe(1);
  });

  it('perspective sets expected depth terms', () => {
    const p = mat4Perspective(Math.PI / 3, 16 / 9, 0.1, 100);
    expect(p[11]).toBe(-1);
    expect(p[14]).toBeLessThan(0);
  });
});
