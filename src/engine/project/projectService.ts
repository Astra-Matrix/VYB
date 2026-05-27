import type { EngineConfig, ImportMap, VybProject } from './types';
import { VYB_PROJECT_DIRS } from './types';

export interface ProjectValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingDirs: string[];
}

export interface ProjectPaths {
  root: string;
  vybDir: string;
  projectFile: string;
  engineConfig: string;
  importMap: string;
}

export function getProjectPaths(root: string): ProjectPaths {
  const normalized = root.replace(/\\/g, '/').replace(/\/$/, '');
  return {
    root: normalized,
    vybDir: `${normalized}/.vyb`,
    projectFile: `${normalized}/.vyb/project.vyb.json`,
    engineConfig: `${normalized}/.vyb/engine.config.json`,
    importMap: `${normalized}/.vyb/import.map.json`,
  };
}

export function validateProjectStructure(root: string, existingDirs: string[]): ProjectValidationResult {
  void root;
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingDirs: string[] = [];

  for (const dir of VYB_PROJECT_DIRS) {
    if (!existingDirs.includes(dir)) {
      missingDirs.push(dir);
    }
  }

  if (missingDirs.includes('.vyb')) {
    errors.push('Missing required .vyb configuration directory');
  }

  if (missingDirs.length > 0 && !missingDirs.includes('.vyb')) {
    warnings.push(`Missing recommended directories: ${missingDirs.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missingDirs,
  };
}

export function validateProjectMetadata(project: VybProject): ProjectValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!project.name?.trim()) errors.push('Project name is required');
  if (!project.version?.trim()) errors.push('Project version is required');
  if (!project.engineVersion?.trim()) errors.push('Engine version is required');
  if (!Array.isArray(project.targetPlatforms) || project.targetPlatforms.length === 0) {
    warnings.push('No target platforms specified');
  }
  if (!Array.isArray(project.scenes) || project.scenes.length === 0) {
    warnings.push('No scenes defined in project');
  }

  return { valid: errors.length === 0, errors, warnings, missingDirs: [] };
}

export function serializeProject(project: VybProject): string {
  return JSON.stringify({ ...project, modifiedAt: new Date().toISOString() }, null, 2);
}

export function parseProject(json: string): VybProject {
  const data = JSON.parse(json) as VybProject;
  const validation = validateProjectMetadata(data);
  if (!validation.valid) {
    throw new Error(`Invalid project metadata: ${validation.errors.join('; ')}`);
  }
  return data;
}

export function serializeEngineConfig(config: EngineConfig): string {
  return JSON.stringify(config, null, 2);
}

export function parseEngineConfig(json: string): EngineConfig {
  return JSON.parse(json) as EngineConfig;
}

export function serializeImportMap(map: ImportMap): string {
  return JSON.stringify(map, null, 2);
}

export function parseImportMap(json: string): ImportMap {
  return JSON.parse(json) as ImportMap;
}

export interface NewProjectFiles {
  projectJson: string;
  engineConfigJson: string;
  importMapJson: string;
  directories: string[];
}

export function buildNewProjectFiles(project: VybProject, engineConfig: EngineConfig, importMap: ImportMap): NewProjectFiles {
  return {
    projectJson: serializeProject(project),
    engineConfigJson: serializeEngineConfig(engineConfig),
    importMapJson: serializeImportMap(importMap),
    directories: [...VYB_PROJECT_DIRS],
  };
}
