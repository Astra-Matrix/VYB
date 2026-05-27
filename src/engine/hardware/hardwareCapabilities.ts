import type { RenderingMode } from '../project/types';
import type { RenderHardwareInfo } from '../renderer/renderInterfaces';

export type HardwareProbeStatus = 'unknown' | 'ok' | 'partial' | 'error';

export interface HardwareCapabilities {
  probeStatus: HardwareProbeStatus;
  gpu: {
    available: boolean;
    backend: RenderingMode | 'web-unknown';
    vendor?: string;
    adapter?: string;
    maxTextureSize?: number;
  };
  cpu: {
    cores?: number;
  };
  ram: {
    totalGb?: number;
  };
  storage: {
    availableGb?: number;
  };
}

export function probeHardwareCapabilities(): HardwareCapabilities {
  // In Tauri (webview) we have limited direct hardware data.
  // This is a scaffold: future phases will use WebGPU queries and Tauri-native probes.
  try {
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : undefined;
    const memory = typeof (navigator as unknown as { deviceMemory?: number }).deviceMemory === 'number' ? (navigator as unknown as { deviceMemory?: number }).deviceMemory : undefined;

    const gpuAvailable = typeof navigator !== 'undefined' && 'gpu' in navigator;
    const backend: RenderHardwareInfo['backend'] = gpuAvailable ? ('webgpu' as RenderingMode) : 'web-unknown';

    return {
      probeStatus: gpuAvailable || cores ? 'ok' : 'partial',
      gpu: {
        available: gpuAvailable,
        backend,
      },
      cpu: {
        cores,
      },
      ram: {
        totalGb: typeof memory === 'number' ? memory : undefined,
      },
      storage: {},
    };
  } catch {
    return {
      probeStatus: 'error',
      gpu: { available: false, backend: 'web-unknown' },
      cpu: {},
      ram: {},
      storage: {},
    };
  }
}

export function formatHardwareSummary(cap: HardwareCapabilities): string {
  const gpu = cap.gpu.available ? `GPU: ${cap.gpu.backend}` : 'GPU: not available in web context';
  const cpu = cap.cpu.cores ? `CPU: ${cap.cpu.cores} cores` : 'CPU: unknown';
  const ram = cap.ram.totalGb ? `RAM: ~${cap.ram.totalGb} GB` : 'RAM: unknown';
  return `${gpu}\n${cpu}\n${ram}`;
}

