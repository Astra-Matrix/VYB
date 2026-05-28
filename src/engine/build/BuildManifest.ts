import { BUILD_TARGETS } from './BuildTargets';
import type { BuildManifest, BuildRequest } from './BuildTypes';

const ENGINE_VERSION = '0.1.0';

export function createBuildManifest(
  request: BuildRequest,
  stagedFiles: string[],
): BuildManifest {
  const targetDesc = BUILD_TARGETS.find((t) => t.id === request.target);
  const caps = targetDesc?.capabilities ?? {
    gpu: true,
    audio: true,
    physics: true,
    networking: true,
    xr: false,
    scripting: true,
  };

  return {
    schemaVersion: 1,
    builtAt: new Date().toISOString(),
    engineVersion: ENGINE_VERSION,
    project: {
      name: request.projectName,
      version: request.projectVersion,
      root: request.projectRoot.replace(/\\/g, '/'),
    },
    target: request.target,
    configuration: request.configuration,
    defaultScene: request.defaultScene,
    scenes: request.scenes ?? [],
    stagedFiles: stagedFiles.map((f) => f.replace(/\\/g, '/')),
    capabilities: {
      gpu: caps.gpu,
      audio: caps.audio,
      physics: caps.physics,
      networking: caps.networking,
      xr: caps.xr,
      scripting: caps.scripting,
    },
  };
}

export function manifestToJson(manifest: BuildManifest): string {
  return JSON.stringify(manifest, null, 2);
}
