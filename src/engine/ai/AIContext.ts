import type { BuildPlatformTarget } from '../build/BuildTargets';
import type { ImportReport } from '../import/ImportReport';

export interface AIStudioContext {
  projectName?: string;
  projectVersion?: string;
  projectRoot?: string;
  activeMode?: string;
  entityCount?: number;
  selectedEntityName?: string;
  defaultScene?: string;
  importReport?: Pick<ImportReport, 'markdown' | 'summary' | 'warnings'>;
  buildTarget?: BuildPlatformTarget;
  runtimeSubsystems?: Record<string, boolean>;
  consoleTail?: string[];
}
