import type { BuildPlatformTarget } from './BuildTargets';

export type BuildConfiguration = 'debug' | 'release';

export interface BuildRequest {
  projectRoot: string;
  projectName: string;
  projectVersion: string;
  target: BuildPlatformTarget;
  configuration: BuildConfiguration;
  outputRoot: string;
  defaultScene?: string;
  scenes?: string[];
  /** When filesystem staging is unavailable, use this file list from the studio tree. */
  knownProjectFiles?: string[];
  previewOnly?: boolean;
}

export interface BuildStepLog {
  step: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface BuildPipelineResult {
  success: boolean;
  outputPath: string;
  manifestPath: string;
  filesStaged: number;
  bytesStaged: number;
  steps: BuildStepLog[];
  warnings: string[];
  errors: string[];
  manifestJson?: string;
}

export interface BuildManifest {
  schemaVersion: 1;
  builtAt: string;
  engineVersion: string;
  project: {
    name: string;
    version: string;
    root: string;
  };
  target: BuildPlatformTarget;
  configuration: BuildConfiguration;
  defaultScene?: string;
  scenes: string[];
  stagedFiles: string[];
  capabilities: Record<string, boolean>;
}
