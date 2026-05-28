import type { DetectedProject, ImportSourceType } from './ImportDetector';
import type { ImportFileOps } from './ImportFileOps';
import { filterImportableAssetPaths } from './ImportFileOps';
import { mergeImportMap, type VybImportMapEntry } from './ImportMap';
import { importMapFromJson, importMapToJson } from './ImportMap';
import { MaterialTranslator } from './material/MaterialTranslator';
import { materialToJson } from './material/VybMaterialFile';
import { GodotSceneTranslator } from './translators/GodotSceneTranslator';
import { RawAssetSceneBuilder } from './translators/RawAssetSceneBuilder';
import { AssetNormalizer } from './ImportReport';
import { sceneFromJson } from '../scene/sceneSerializer';

export interface ImportPipelineResult {
  success: boolean;
  assetsCopied: number;
  scenesWritten: string[];
  materialsWritten: string[];
  importMapEntries: VybImportMapEntry[];
  warnings: string[];
  previewSceneJson?: string;
  previewSceneRelativePath?: string;
}

export class ImportPipeline {
  private readonly materialTranslator = new MaterialTranslator();
  private readonly godotSceneTranslator = new GodotSceneTranslator();
  private readonly rawSceneBuilder = new RawAssetSceneBuilder();
  private readonly assetNormalizer = new AssetNormalizer();

  constructor(private readonly fileOps: ImportFileOps) {}

  async execute(source: DetectedProject, targetProjectRoot: string): Promise<ImportPipelineResult> {
    const warnings: string[] = [];
    const importMapEntries: VybImportMapEntry[] = [];
    const scenesWritten: string[] = [];
    const materialsWritten: string[] = [];
    let assetsCopied = 0;

    const files = await this.fileOps.listFiles(source.rootPath);
    const assetFiles = filterImportableAssetPaths(files);

    for (const rel of assetFiles) {
      if (rel.endsWith('.tscn') || rel.endsWith('.vybscene')) continue;
      const targetRel = this.assetNormalizer.normalizePath(rel, `assets/imported/${source.type}`);
      try {
        await this.fileOps.copyIntoProject(source.rootPath, rel, targetProjectRoot, targetRel);
        assetsCopied++;
        importMapEntries.push({
          sourcePath: rel,
          targetPath: targetRel,
          sourceEngine: source.type,
          category: 'asset',
          importedAt: new Date().toISOString(),
        });
      } catch (e) {
        warnings.push(`Asset copy skipped (${rel}): ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    const defaultMat = this.materialTranslator.translate({
      name: 'Imported Default',
      sourceEngine: source.type,
      sourcePath: 'generated',
    });
    const defaultMatPath = defaultMat.targetRelativePath;
    try {
      await this.fileOps.writeText(targetProjectRoot, defaultMatPath, materialToJson(defaultMat.material));
      materialsWritten.push(defaultMatPath);
      importMapEntries.push({
        sourcePath: 'generated:default-material',
        targetPath: defaultMatPath,
        sourceEngine: source.type,
        category: 'material',
        importedAt: new Date().toISOString(),
      });
    } catch (e) {
      warnings.push(`Material write skipped: ${e instanceof Error ? e.message : String(e)}`);
    }

    const sceneResult = await this.translateScenes(source, files, warnings);
    if (sceneResult) {
      try {
        await this.fileOps.writeText(targetProjectRoot, sceneResult.targetRelativePath, sceneResult.sceneJson);
        scenesWritten.push(sceneResult.targetRelativePath);
        importMapEntries.push({
          sourcePath: sceneResult.sourcePath,
          targetPath: sceneResult.targetRelativePath,
          sourceEngine: source.type,
          category: 'scene',
          importedAt: new Date().toISOString(),
        });
      } catch (e) {
        warnings.push(`Scene write skipped: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    try {
      const existing = await this.readImportMap(targetProjectRoot);
      const merged = mergeImportMap(existing, importMapEntries);
      await this.fileOps.writeText(targetProjectRoot, '.vyb/import.map.json', importMapToJson(merged));
    } catch (e) {
      warnings.push(`import.map.json update skipped: ${e instanceof Error ? e.message : String(e)}`);
    }

    return {
      success: warnings.length === 0 || assetsCopied > 0 || scenesWritten.length > 0,
      assetsCopied,
      scenesWritten,
      materialsWritten,
      importMapEntries,
      warnings,
      previewSceneJson: sceneResult?.sceneJson,
      previewSceneRelativePath: sceneResult?.targetRelativePath,
    };
  }

  /**
   * Preview import without writing to disk (web dev).
   */
  async preview(source: DetectedProject): Promise<ImportPipelineResult> {
    const warnings: string[] = [];
    const files = await this.fileOps.listFiles(source.rootPath);
    const sceneResult = await this.translateScenes(source, files, warnings);
    return {
      success: !!sceneResult,
      assetsCopied: filterImportableAssetPaths(files).length,
      scenesWritten: sceneResult ? [sceneResult.targetRelativePath] : [],
      materialsWritten: [],
      importMapEntries: [],
      warnings,
      previewSceneJson: sceneResult?.sceneJson,
      previewSceneRelativePath: sceneResult?.targetRelativePath,
    };
  }

  private async translateScenes(
    source: DetectedProject,
    files: string[],
    warnings: string[],
  ): Promise<{ sourcePath: string; sceneJson: string; targetRelativePath: string } | undefined> {
    switch (source.type as ImportSourceType) {
      case 'godot': {
        const tscn = files.find((f) => f.endsWith('.tscn'));
        if (!tscn) {
          warnings.push('No .tscn scene file found in Godot project.');
          return undefined;
        }
        const text = await this.fileOps.readText(source.rootPath, tscn);
        const translated = this.godotSceneTranslator.translate(tscn, text);
        warnings.push(...translated.warnings);
        return { sourcePath: tscn, sceneJson: translated.sceneJson, targetRelativePath: translated.targetRelativePath };
      }
      case 'raw': {
        const meshes = filterImportableAssetPaths(files).filter((f) => /\.(fbx|obj|glb|gltf)$/i.test(f));
        if (meshes.length === 0) return undefined;
        const built = this.rawSceneBuilder.build({ meshFiles: meshes });
        return {
          sourcePath: 'raw-asset-folder',
          sceneJson: built.sceneJson,
          targetRelativePath: built.targetRelativePath,
        };
      }
      case 'unity':
        warnings.push('Unity scene YAML translation is partial — assets indexed; recreate scenes in VYB editor.');
        return undefined;
      case 'unreal':
        warnings.push('Unreal map translation is not automated — export FBX/glTF to raw assets for best results.');
        return undefined;
      default:
        return undefined;
    }
  }

  private async readImportMap(targetRoot: string) {
    try {
      const json = await this.fileOps.readText(targetRoot, '.vyb/import.map.json');
      return importMapFromJson(json);
    } catch {
      return { entries: [], lastUpdated: new Date().toISOString() };
    }
  }
}

export function loadPreviewSceneFromResult(result: ImportPipelineResult) {
  if (!result.previewSceneJson) return null;
  return sceneFromJson(result.previewSceneJson);
}
