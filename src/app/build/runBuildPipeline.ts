import { BuildPipeline, resolveDefaultBuildOutput } from '../../engine/build';
import type { BuildPlatformTarget } from '../../engine/build';
import type { VybProject } from '../../engine/project/types';
import { isTauri } from '../platform/isTauri';

export interface RunBuildOptions {
  projectRoot: string;
  project: VybProject;
  target: BuildPlatformTarget;
  configuration: 'debug' | 'release';
  outputFolder?: string;
  knownProjectFiles?: string[];
  onLog?: (level: 'info' | 'warn' | 'error', message: string) => void;
}

export async function runBuildPipeline(options: RunBuildOptions) {
  const outputRoot =
    options.outputFolder?.trim() ||
    resolveDefaultBuildOutput(options.projectRoot, options.target, options.configuration);

  const pipeline = new BuildPipeline();
  const result = await pipeline.run({
    projectRoot: options.projectRoot,
    projectName: options.project.name,
    projectVersion: options.project.version,
    target: options.target,
    configuration: options.configuration,
    outputRoot,
    defaultScene: options.project.defaultScene,
    scenes: options.project.scenes,
    knownProjectFiles: options.knownProjectFiles,
    previewOnly: !isTauri(),
  });

  for (const step of result.steps) {
    options.onLog?.(step.level, `[${step.step}] ${step.message}`);
  }
  for (const w of result.warnings) {
    options.onLog?.('warn', w);
  }
  for (const e of result.errors) {
    options.onLog?.('error', e);
  }

  if (result.success) {
    options.onLog?.(
      'info',
      `Build succeeded → ${result.outputPath} (${result.filesStaged} artifacts, ~${Math.round(result.bytesStaged / 1024)} KB)`,
    );
  }

  return result;
}
