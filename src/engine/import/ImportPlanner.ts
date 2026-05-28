import type { DetectedProject, ImportSourceType } from './ImportDetector';

export type ImportAction = 'import-now' | 'partial-import' | 'manual-migration' | 'planned' | 'unsupported';

export interface ImportPlanItem {
  category: string;
  source: ImportSourceType;
  action: ImportAction;
  description: string;
  targetPath?: string;
  risk?: 'low' | 'medium' | 'high';
}

export interface ImportPlan {
  source: DetectedProject;
  items: ImportPlanItem[];
  estimatedEffort: 'minimal' | 'moderate' | 'significant' | 'major';
}

export class ImportPlanner {
  createPlan(source: DetectedProject): ImportPlan {
    switch (source.type) {
      case 'vyb':
        return this.planVyb(source);
      case 'unity':
        return this.planUnity(source);
      case 'unreal':
        return this.planUnreal(source);
      case 'godot':
        return this.planGodot(source);
      case 'raw':
        return this.planRaw(source);
      default:
        return {
          source,
          items: [{ category: 'unknown', source: 'unknown', action: 'unsupported', description: 'Unknown project format' }],
          estimatedEffort: 'major',
        };
    }
  }

  private planVyb(source: DetectedProject): ImportPlan {
    return {
      source,
      estimatedEffort: 'minimal',
      items: [
        { category: 'project', source: 'vyb', action: 'import-now', description: 'Open native VYB project directly', risk: 'low' },
      ],
    };
  }

  private planUnity(source: DetectedProject): ImportPlan {
    return {
      source,
      estimatedEffort: 'significant',
      items: [
        { category: 'assets', source: 'unity', action: 'partial-import', description: 'Copy mesh/texture assets to assets/', targetPath: 'assets/', risk: 'medium' },
        { category: 'scenes', source: 'unity', action: 'manual-migration', description: 'Unity scenes: asset copy + manual scene rebuild (YAML translator partial)', risk: 'high' },
        { category: 'materials', source: 'unity', action: 'partial-import', description: 'Materials mapped to default .vybmat stubs', risk: 'medium' },
        { category: 'scripts', source: 'unity', action: 'manual-migration', description: 'C# scripts cannot auto-convert; migration notes provided', risk: 'high' },
        { category: 'prefabs', source: 'unity', action: 'planned', description: 'Prefab hierarchy translation planned', risk: 'medium' },
      ],
    };
  }

  private planUnreal(source: DetectedProject): ImportPlan {
    return {
      source,
      estimatedEffort: 'major',
      items: [
        { category: 'assets', source: 'unreal', action: 'partial-import', description: 'FBX/glTF exports from Content/ can be indexed', targetPath: 'assets/', risk: 'medium' },
        { category: 'maps', source: 'unreal', action: 'manual-migration', description: 'UMAP levels require SceneTranslator (planned)', risk: 'high' },
        { category: 'materials', source: 'unreal', action: 'planned', description: 'Unreal material graphs need dedicated translator', risk: 'high' },
        { category: 'blueprints', source: 'unreal', action: 'unsupported', description: 'Blueprint visual scripts cannot be auto-migrated', risk: 'high' },
      ],
    };
  }

  private planGodot(source: DetectedProject): ImportPlan {
    return {
      source,
      estimatedEffort: 'moderate',
      items: [
        { category: 'scenes', source: 'godot', action: 'partial-import', description: 'Godot .tscn translated to .vybscene (Camera/Light/MeshInstance3D)', risk: 'medium' },
        { category: 'materials', source: 'godot', action: 'partial-import', description: 'Default .vybmat generated; Godot .tres mapping planned', risk: 'medium' },
        { category: 'scripts', source: 'godot', action: 'manual-migration', description: 'GDScript requires ScriptMigrationNotes', risk: 'high' },
        { category: 'assets', source: 'godot', action: 'import-now', description: 'Standard assets (PNG, WAV, glTF) can be indexed', targetPath: 'assets/', risk: 'low' },
      ],
    };
  }

  private planRaw(source: DetectedProject): ImportPlan {
    return {
      source,
      estimatedEffort: 'minimal',
      items: [
        { category: 'assets', source: 'raw', action: 'import-now', description: 'Index raw asset files into VYB asset registry', targetPath: 'assets/', risk: 'low' },
        { category: 'scenes', source: 'raw', action: 'partial-import', description: 'Auto-layout .vybscene from mesh files (FBX/glTF/OBJ)', risk: 'low' },
        { category: 'materials', source: 'raw', action: 'partial-import', description: 'Default lit .vybmat assigned to imported meshes', risk: 'low' },
      ],
    };
  }
}
