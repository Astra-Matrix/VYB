export type BuildPlatformTarget =
  | 'windows-desktop'
  | 'macos-desktop'
  | 'linux-desktop'
  | 'web'
  | 'android'
  | 'ios'
  | 'vr'
  | 'ar'
  | 'console-placeholder'
  | 'cloud-streaming-placeholder'
  | 'dedicated-server'
  | 'headless-simulation';

export interface PlatformCapabilityFlags {
  gpu: boolean;
  audio: boolean;
  physics: boolean;
  networking: boolean;
  xr: boolean;
  scripting: boolean;
}

export interface BuildTargetDescriptor {
  id: BuildPlatformTarget;
  displayName: string;
  description: string;
  capabilities: PlatformCapabilityFlags;
}

export const BUILD_TARGETS: BuildTargetDescriptor[] = [
  {
    id: 'windows-desktop',
    displayName: 'Windows Desktop',
    description: 'Native desktop build for Windows.',
    capabilities: { gpu: true, audio: true, physics: true, networking: true, xr: false, scripting: true },
  },
  {
    id: 'macos-desktop',
    displayName: 'macOS Desktop',
    description: 'Native desktop build for macOS.',
    capabilities: { gpu: true, audio: true, physics: true, networking: true, xr: false, scripting: true },
  },
  {
    id: 'linux-desktop',
    displayName: 'Linux Desktop',
    description: 'Native desktop build for Linux.',
    capabilities: { gpu: true, audio: true, physics: true, networking: true, xr: false, scripting: true },
  },
  {
    id: 'web',
    displayName: 'Web',
    description: 'Web build via WebGPU (scaffold).',
    capabilities: { gpu: true, audio: true, physics: true, networking: true, xr: false, scripting: true },
  },
  {
    id: 'android',
    displayName: 'Android',
    description: 'Mobile build placeholder.',
    capabilities: { gpu: true, audio: true, physics: true, networking: true, xr: false, scripting: true },
  },
  {
    id: 'ios',
    displayName: 'iOS',
    description: 'Mobile build placeholder.',
    capabilities: { gpu: true, audio: true, physics: true, networking: true, xr: false, scripting: true },
  },
  {
    id: 'vr',
    displayName: 'VR',
    description: 'VR build placeholder (OpenXR in future).',
    capabilities: { gpu: true, audio: true, physics: true, networking: true, xr: true, scripting: true },
  },
  {
    id: 'ar',
    displayName: 'AR',
    description: 'AR build placeholder.',
    capabilities: { gpu: true, audio: true, physics: true, networking: true, xr: true, scripting: true },
  },
  {
    id: 'console-placeholder',
    displayName: 'Console (placeholder)',
    description: 'Console output pipeline planned.',
    capabilities: { gpu: true, audio: true, physics: true, networking: true, xr: false, scripting: true },
  },
  {
    id: 'cloud-streaming-placeholder',
    displayName: 'Cloud Streaming (placeholder)',
    description: 'Remote renderer / streaming build placeholder.',
    capabilities: { gpu: true, audio: true, physics: false, networking: true, xr: false, scripting: true },
  },
  {
    id: 'dedicated-server',
    displayName: 'Dedicated Server',
    description: 'Headless server build placeholder.',
    capabilities: { gpu: false, audio: false, physics: true, networking: true, xr: false, scripting: true },
  },
  {
    id: 'headless-simulation',
    displayName: 'Headless Simulation',
    description: 'Deterministic simulation runtime placeholder.',
    capabilities: { gpu: false, audio: false, physics: true, networking: false, xr: false, scripting: true },
  },
];

