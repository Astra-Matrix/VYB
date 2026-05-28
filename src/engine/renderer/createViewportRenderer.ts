import type { ViewportRenderer } from './renderInterfaces';
import { PlaceholderViewportRenderer } from './placeholder';
import { WebGpuViewportRenderer } from './webgpu/WebGpuViewportRenderer';
import { isWebGpuAvailable } from './webgpu/webGpuSupport';

export type ViewportRendererKind = ViewportRenderer['backendId'];

/**
 * Creates the best available viewport renderer for the current environment.
 * WebGPU is preferred; falls back to the 2D canvas placeholder.
 */
export async function createViewportRenderer(canvas: HTMLCanvasElement): Promise<ViewportRenderer> {
  if (await isWebGpuAvailable()) {
    try {
      const renderer = new WebGpuViewportRenderer(canvas);
      await renderer.initialize();
      return renderer;
    } catch {
      // Fall through to placeholder when context/device init fails.
    }
  }
  return new PlaceholderViewportRenderer(canvas);
}
