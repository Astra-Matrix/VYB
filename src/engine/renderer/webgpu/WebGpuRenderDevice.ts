import type { RenderDevice, RenderHardwareInfo } from '../renderInterfaces';

export class WebGpuRenderDevice implements RenderDevice {
  readonly hardwareInfo: RenderHardwareInfo;
  readonly device: GPUDevice;
  readonly format: GPUTextureFormat;

  private constructor(
    device: GPUDevice,
    format: GPUTextureFormat,
    hardwareInfo: RenderHardwareInfo,
  ) {
    this.device = device;
    this.format = format;
    this.hardwareInfo = hardwareInfo;
  }

  static async create(): Promise<WebGpuRenderDevice> {
    if (!navigator.gpu) throw new Error('WebGPU is not available in this environment.');
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) throw new Error('WebGPU adapter request failed.');

    const device = await adapter.requestDevice();
    const format = navigator.gpu.getPreferredCanvasFormat();
    const info: RenderHardwareInfo = {
      backend: 'webgpu',
      vendor: adapter.info?.vendor,
      adapter: adapter.info?.architecture ?? adapter.info?.description,
      limits: {
        maxTextureSize: adapter.limits.maxTextureDimension2D,
      },
    };
    return new WebGpuRenderDevice(device, format, info);
  }

  async initialize(): Promise<void> {
    // Device is ready after create().
  }

  async destroy(): Promise<void> {
    this.device.destroy();
  }
}
