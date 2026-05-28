import type { BuildPlatformTarget } from './BuildTargets';
import type { BuildConfiguration } from './BuildTypes';

export function targetStubReadme(target: BuildPlatformTarget, configuration: BuildConfiguration): string {
  const lines = [
    `# VYB Build — ${target}`,
    '',
    `Configuration: **${configuration}**`,
    '',
    'This directory contains a staged project export from VYB Studio.',
    'See `build-manifest.json` for the file manifest and capability flags.',
    '',
  ];

  switch (target) {
    case 'web':
      lines.push(
        '## Web deployment (scaffold)',
        '',
        '- Host the `project/` folder behind a static file server.',
        '- Run the VYB web player runtime when available (Phase 10+).',
        '- WebGPU is required for the default rendering path.',
      );
      break;
    case 'windows-desktop':
    case 'macos-desktop':
    case 'linux-desktop':
      lines.push(
        '## Desktop deployment (scaffold)',
        '',
        '- Package with Tauri or a native VYB player runtime.',
        '- Use `npm run tauri:build` in the studio repo for the editor shell.',
      );
      break;
    case 'dedicated-server':
    case 'headless-simulation':
      lines.push(
        '## Headless runtime (scaffold)',
        '',
        '- GPU/audio assets may be omitted in future headless exporters.',
        '- Networking and physics flags are set in the build manifest.',
      );
      break;
    default:
      lines.push('## Target notes', '', 'Full packaging for this target is planned in a future release.');
  }

  return lines.join('\n');
}

export function targetLaunchConfig(target: BuildPlatformTarget): Record<string, unknown> {
  return {
    target,
    entryScene: 'scenes/main.vybscene',
    renderer: target === 'dedicated-server' || target === 'headless-simulation' ? 'none' : 'webgpu',
    scripting: true,
  };
}
