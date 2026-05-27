import { describe, expect, it } from 'vitest';
import { createDefaultProject } from '../engine/project/types';
import { parseProject, validateProjectMetadata, validateProjectStructure } from '../engine/project/projectService';
import { VYB_PROJECT_DIRS } from '../engine/project/types';

describe('VYB Project format', () => {
  it('validates default project metadata', () => {
    const p = createDefaultProject('My Project');
    const result = validateProjectMetadata(p);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects missing project name in parseProject', () => {
    expect(() => {
      parseProject(
        JSON.stringify({
          // missing name
          version: '0.1.0',
          engineVersion: '0.1.0',
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          targetPlatforms: ['windows'],
          renderingMode: 'webgpu',
          assetFolders: ['assets'],
          scenes: ['scenes/main.vybscene'],
          plugins: [],
          scriptingLanguages: ['typescript'],
          defaultScene: 'scenes/main.vybscene',
          importCompatibility: {},
        }),
      );
    }).toThrow(/Project name is required/);
  });

  it('detects missing .vyb directory in validateProjectStructure', () => {
    const result = validateProjectStructure('root', VYB_PROJECT_DIRS.filter((d) => d !== '.vyb'));
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

