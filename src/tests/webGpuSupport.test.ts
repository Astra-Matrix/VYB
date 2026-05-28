import { describe, expect, it, vi, afterEach } from 'vitest';
import { isWebGpuAvailable } from '../engine/renderer/webgpu/webGpuSupport';

describe('isWebGpuAvailable', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false when navigator.gpu is missing', async () => {
    vi.stubGlobal('navigator', {});
    await expect(isWebGpuAvailable()).resolves.toBe(false);
  });

  it('returns true when adapter resolves', async () => {
    vi.stubGlobal('navigator', {
      gpu: {
        requestAdapter: vi.fn().mockResolvedValue({}),
      },
    });
    await expect(isWebGpuAvailable()).resolves.toBe(true);
  });
});
